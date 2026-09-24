const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

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
  fileName: String,
  fileSize: Number,
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

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "feed-service" });
});

app.post("/api/feed", async (req, res) => {
  try {
    console.log("/api/feed payload", req.body);
    const {
      userId,
      userName,
      text,
      mediaData,
      mediaType,
      fileName,
      fileSize,
      category,
      eventName,
      eventDate,
      eventTime,
      eventDescription,
      eventColor
    } = req.body;

    const isEvent = (category === 'event');

    const parseDateFromText = (txt) => {
      if (!txt) return null;
      const match = txt.match(/\b(\d{4}-\d{2}-\d{2})\b/);
      return match ? match[1] : null;
    };
    const parseTimeFromText = (txt) => {
      if (!txt) return null;
      const match = txt.match(/\b(\d{2}:\d{2})\b/);
      return match ? match[1] : null;
    };

    const safeEventName = isEvent ? (eventName || text || 'Event') : null;
    const safeEventDate = isEvent ? (eventDate || parseDateFromText(text) || null) : null;
    const safeEventTime = isEvent ? (eventTime || parseTimeFromText(text) || null) : null;
    const safeEventDescription = isEvent ? (eventDescription || text || null) : null;
    const safeEventColor = isEvent ? (eventColor || '#1976d2') : null;

    const docToCreate = {
      userId,
      userName,
      text,
      mediaData,
      mediaType,
      fileName,
      fileSize,
      category: category || 'general',
      eventName: safeEventName,
      eventDate: safeEventDate,
      eventTime: safeEventTime,
      eventDescription: safeEventDescription,
      eventColor: safeEventColor
    };

    console.log("/api/feed will create doc", docToCreate);

    const post = await Feed.create(docToCreate);
    const saved = await Feed.findById(post._id).lean();
    console.log("/api/feed saved doc", saved);
    res.json({ message: "Post added", post: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/feed", async (req, res) => {
  try {
    const posts = await Feed.find({}).sort({ timestamp: -1 }).limit(100);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/feed/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    const post = await Feed.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    const likes = post.likes || [];
    const hasLiked = likes.includes(userId);
    
    if (hasLiked) {
      post.likes = likes.filter(id => id !== userId);
    } else {
      post.likes = [...likes, userId];
    }
    
    await post.save();
    res.json({ message: hasLiked ? "Unliked" : "Liked", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/feed/:postId/comment", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, userName, text } = req.body;
    
    const post = await Feed.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    const comment = {
      _id: new mongoose.Types.ObjectId(),
      userId,
      userName,
      text,
      createdAt: new Date()
    };
    
    post.comments = [...(post.comments || []), comment];
    await post.save();
    
    res.json({ message: "Comment added", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/feed/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.query;
    
    const post = await Feed.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.userId !== userId) return res.status(403).json({ error: "Not authorized" });
    
    await Feed.findByIdAndDelete(postId);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/feed/:postId/comment/:commentId", async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.query;
    
    const post = await Feed.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    
    const comment = post.comments.find(c => c._id.toString() === commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.userId !== userId) return res.status(403).json({ error: "Not authorized" });
    
    post.comments = post.comments.filter(c => c._id.toString() !== commentId);
    await post.save();
    
    res.json({ message: "Comment deleted", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/users/:userId/name", async (req, res) => {
  try {
    const { userId } = req.params;
    const { userName } = req.body;
    
    if (!userName) return res.status(400).json({ error: "userName required" });
    
    const postsResult = await Feed.updateMany(
      { userId },
      { $set: { userName } }
    );
    
    const commentsResult = await Feed.updateMany(
      { "comments.userId": userId },
      { $set: { "comments.$[comment].userName": userName } },
      { arrayFilters: [{ "comment.userId": userId }] }
    );
    
    console.log(`Updated username for userId ${userId}: ${postsResult.modifiedCount} posts, ${commentsResult.modifiedCount} comment arrays`);
    
    res.json({ 
      message: "Username updated", 
      postsUpdated: postsResult.modifiedCount,
      commentsUpdated: commentsResult.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5006;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://mongodb:27017/student_companion";

console.log("Feed Service - Attempting to connect to MongoDB at:", MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Feed Service - MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Feed Service running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Feed Service - MongoDB connection error:", err.message);
    process.exit(1);
  });
