import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const generateToken = (userId, res) => {
    const token = jwt.sign(
        { userId }, "secret", { expiresIn: '7d' }
    );
    res.cookie("jwt", token, {
  httpOnly: true,
  secure: true,        // MUST be true on HTTPS
  sameSite: "none",    // MUST be "none" for cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000
});


    return token;
}

export {generateToken};