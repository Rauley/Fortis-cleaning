require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");
const axios = require("axios");

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/contact", async (req, res) => {
  const { name, email, message, token } = req.body;

  if (!name || !email || !message || !token) {
    return res.status(400).json({ message: "All fields and reCAPTCHA are required." });
  }

  console.log("📥 Contact form submitted:", { name, email, message });

  try {
    // ✅ 1. Verify reCAPTCHA token with Google
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`;
    const captchaRes = await axios.post(verifyURL);
    const success = captchaRes.data.success;

    if (!success) {
      return res.status(403).json({ message: "Failed reCAPTCHA verification." });
    }

    // ✅ 2. Check Gmail credentials
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      throw new Error("Missing Gmail credentials in .env file");
    }

    // ✅ 3. Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: email,
      to: process.env.GMAIL_USER,
      subject: `Fortis Cleaning Services - Message from ${name}`,
      text: message
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent!");
    res.status(200).json({ message: "Email sent successfully" });

  } catch (err) {
    console.error("❌ Error sending email:", err.message);
    res.status(500).json({ message: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});