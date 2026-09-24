const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

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

const expenseSchema = new mongoose.Schema({
  userId: String,
  title: String,
  amount: Number,
  date: String,
  createdAt: { type: Date, default: Date.now },
});

const Expense = mongoose.model("Expense", expenseSchema);

const eventSchema = new mongoose.Schema({
  userId: String,
  name: String,
  date: String,
  time: String,
  description: String,
  color: String,
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", eventSchema);

const taskSchema = new mongoose.Schema({
  userId: String,
  title: String,
  dueDate: String,
  completed: Boolean,
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);

const feedSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  text: String,
  category: String,
  eventName: String,
  eventDate: String,
  eventTime: String,
  eventDescription: String,
  eventColor: String,
  mediaData: String,
  mediaType: String,
  likes: [String],
  comments: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
      userId: String,
      userName: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

const Feed = mongoose.model("Feed", feedSchema);

const diarySchema = new mongoose.Schema({
  userId: String,
  title: String,
  date: Date,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Diary = mongoose.model("Diary", diarySchema);

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "profile-service" });
});

app.get("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put("/api/profile", async (req, res) => {
  try {
    const { userId, name, email, phone, department, avatar } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });
    if (email && !isValidEmail(email)) return res.status(400).json({ error: "Invalid email format" });

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (user !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) {
      try {
        const feedServiceUrl = process.env.FEED_SERVICE_URL || "http://feed-service:5006";
        await axios.put(`${feedServiceUrl}/api/users/${userId}/name`, { userName: name });
        console.log(`Updated username in feed-service for userId: ${userId}`);
      } catch (feedErr) {
        console.error("Error updating username in feed-service:", feedErr.message);
      }
    }

    return res.json({ message: "Profile updated", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/user-stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const totalExpenses = await Expense.countDocuments({ userId });
    const totalEvents = await Event.countDocuments({ userId });
    const totalTasks = await Task.countDocuments({ userId });
    const totalDiaryEntries = await Diary.countDocuments({ userId });
    const totalFeedPosts = await Feed.countDocuments({ userId });
    
    const totalExpenseAmount = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const stats = {
      totalExpenses,
      totalExpenseAmount: totalExpenseAmount[0]?.total || 0,
      totalFeedPosts,
      totalEvents,
      totalTasks,
      totalDiaryEntries,
    };

    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://mongodb:27017/student_companion";

console.log("Profile Service - Attempting to connect to MongoDB at:", MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Profile Service - MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Profile Service running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Profile Service - MongoDB connection error:", err.message);
    process.exit(1);
  });
