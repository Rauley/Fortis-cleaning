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
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`;
    const captchaRes = await axios.post(verifyURL);
    const success = captchaRes.data.success;

    if (!success) {
      return res.status(403).json({ message: "Failed reCAPTCHA verification." });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      throw new Error("Missing Gmail credentials in .env file");
    }

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

app.post("/booking", async (req, res) => {
  const { name, email, service, preferred_date, location, details, token } = req.body;

  if (!name || !email || !service || !preferred_date || !token) {
    return res.status(400).json({ message: "Required fields and reCAPTCHA are missing." });
  }

  console.log("📅 Booking request submitted:", { name, email, service, preferred_date });

  try {
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`;
    const captchaRes = await axios.post(verifyURL);
    const success = captchaRes.data.success;

    if (!success) {
      return res.status(403).json({ message: "Failed reCAPTCHA verification." });
    }

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
      subject: `Fortis Booking - ${service} Request from ${name}`,
      text: `Service: ${service}\nDate: ${preferred_date}\nLocation: ${location}\nDetails: ${details}\nFrom: ${name} <${email}>`
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Booking email sent!");
    res.status(200).json({ message: "Booking request sent successfully" });

  } catch (err) {
    console.error("❌ Error sending booking email:", err.message);
    res.status(500).json({ message: "Failed to send booking request" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
