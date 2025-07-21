import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
export default function sendMail(email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Test Email from Node.js",
    text: "MAIL TEXT AT 14:02 FROM G12.",
    html: "<p>This is a <strong>test email</strong> sent from a Node.js project.</p>",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log("Error: " + error.message);
    }
    console.log("Email sent: " + info.response);
  });
}
