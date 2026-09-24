const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const userSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    email: String,
    phone: String,
    department: String,
    batch: String,
    avatar: String,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePasswordStrength(password) {
  const errors = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain number");
  return errors;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "your-app-password",
  },
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.post("/api/register", async (req, res) => {
  try {
    const { studentId, password, name, email, phone, department, batch } = req.body;
    
    if (!studentId || !password) return res.status(400).json({ error: "studentId and password required" });
    if (email && !isValidEmail(email)) return res.status(400).json({ error: "Invalid email format" });
    
    const passwordErrors = validatePasswordStrength(password);
    if (passwordErrors.length > 0) return res.status(400).json({ error: passwordErrors.join(", ") });

    const existing = await User.findOne({ studentId });
    if (existing) return res.status(409).json({ error: "Student already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ studentId, password: hashedPassword, name, email, phone, department, batch });
    return res.json({ message: "Registered", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { studentId, password } = req.body;
    if (!studentId || !password) return res.status(400).json({ error: "studentId and password required" });

    const user = await User.findOne({ studentId });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    return res.json({ message: "Authenticated", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await User.findByIdAndUpdate(user._id, { resetToken, resetTokenExpiry });

    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}&email=${email}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "your-email@gmail.com",
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click the link below to reset your password (valid for 1 hour):</p><a href="${resetLink}">${resetLink}</a>`,
    });

    return res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ error: "Email, token, and new password required" });

    const passwordErrors = validatePasswordStrength(newPassword);
    if (passwordErrors.length > 0) return res.status(400).json({ error: passwordErrors.join(", ") });

    const user = await User.findOne({ email, resetToken: token });
    if (!user) return res.status(401).json({ error: "Invalid or expired token" });

    if (new Date() > user.resetTokenExpiry) return res.status(401).json({ error: "Token has expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword, resetToken: null, resetTokenExpiry: null });

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://mongodb:27017/student_companion";

console.log("Auth Service - Attempting to connect to MongoDB at:", MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Auth Service - MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Auth Service running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Auth Service - MongoDB connection error:", err.message);
    process.exit(1);
  });
