import nodemailer from "nodemailer";
// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "studyv922@gmail.com",
    pass: "eaqw lfcq yxif cmyl",
  },
});
// Wrap in an async IIFE so we can use await.
const emailSender = async (verificationToken, email) => {
  const info = await transporter.sendMail({
    from: '"MathVersus" <studyv922@gmail.com>',
    to: email,
    subject: "Verification Code",
    text: "Don't share this code with anyone.", // plain‑text body
    html: `<b>Your verification code is: ${verificationToken}</b>`, // HTML body
  });

  console.log("Message sent:", info.messageId);
};

export { emailSender };
