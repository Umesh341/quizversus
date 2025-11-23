import express from "express";
import { UserModel } from "../model/user.model.js";
import { emailSender } from "../utility/nodemailer.js";
import bcrypt from "bcrypt";
import { generateToken } from "../libs/utils.js";

const generateVerificationToken = async () => {
  // generate 4 digit numeric code
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const registerUser = async (req, res) => {
  try {
    const verificationToken = await generateVerificationToken();
    const { username, email, password } = req.body;
    // Handle user registration logic here (e.g., save to database)
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashVerificationToken = await bcrypt.hash(verificationToken, 5);
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.log(existingUser);
      existingUser.verificationToken = hashVerificationToken;
      await existingUser.save();
      res.json({
        message: "User with this email already exists",
        user: existingUser,
      });
      await emailSender(verificationToken, email);
      return;
    }

    const hashPassword = await bcrypt.hash(password, 6);

    console.log("reached 2");

    const newUser = await UserModel.create({
      username,
      email,
      password: hashPassword,
      verificationToken: hashVerificationToken,
    });
    // JWt generation and setting cookie
    res.status(201).json({
      message: "Registration successful! Please verify your email.",
      user: newUser,
    });
    console.log("first");
    await emailSender(verificationToken, email);
  } catch (error) {
    console.log(error);
  }
};

const emailVerification = async (req, res) => {
  try {
    console.log("first");
    const email = req.params.email;
    console.log(email);
    const { token } = req.body;
    console.log(token);
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(409).json({ message: "User not found" });
    }
    if (user.isVerified) {
      return res.status(403).json({ message: "Email is already verified" });
    }
    console.log(user);
    if (user.verificationToken) {
      const isMatch = await bcrypt.compare(token, user.verificationToken);
      console.log(isMatch);
      if (isMatch) {
        console.log(user);
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        await generateToken(user._id, res);
        console.log(user);
        res.status(202).json({ message: "Email verified successfully" });
      } else {
        res.status(409).json({ message: "Invalid verification token" });
        console.log(isMatch);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res) => {
  // Implement login logic here
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isVerified = user.isVerified;
    if (!isVerified) {
      await emailSender(user.verificationToken, email);
      res.status(402).json({ message: "Email not verified" });
      return;
    }
    const userClient = user.toObject();

    // Remove sensitive fields
    delete userClient.password;
    console.log(userClient);
    generateToken(userClient._id, res);
    res.status(200).json({ message: "Login successful", user: userClient });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkAuth = async (req, res) => {
  try {

    const userId = req.user?._id;
    console.log(userId);
    const isVerified = req.user?.isVerified;
    console.log(isVerified);
    if (userId) {
      res.status(200).json({ user: req.user });
    } else {
    
      res.status(200).json({ user: null });
      return false;
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { registerUser, emailVerification, loginUser, checkAuth, logoutUser };
