const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const expenseSchema = new mongoose.Schema({
  userId: String,
  title: String,
  amount: Number,
  date: String,
  createdAt: { type: Date, default: Date.now },
});

const Expense = mongoose.model("Expense", expenseSchema);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "expense-service" });
});

app.post("/api/expenses", async (req, res) => {
  try {
    const { userId, title, amount, date } = req.body;
    const expense = await Expense.create({ userId, title, amount, date });
    res.json({ message: "Expense added", expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/expenses", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const expenses = await Expense.find(filter).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) return res.status(404).json({ error: "Expense not found or unauthorized" });

    await Expense.findByIdAndDelete(id);
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5003;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://mongodb:27017/student_companion";

console.log("Expense Service - Attempting to connect to MongoDB at:", MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Expense Service - MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Expense Service running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Expense Service - MongoDB connection error:", err.message);
    process.exit(1);
  });
