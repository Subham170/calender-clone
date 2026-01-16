import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// MongoDB connection configuration
let mongoUri;

if (process.env.MONGODB_URI) {
  mongoUri = process.env.MONGODB_URI;
  console.log(`🔗 Connecting to MongoDB: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
} else if (process.env.DB_URL) {
  // Support legacy DB_URL format for MongoDB
  mongoUri = process.env.DB_URL;
  console.log(`🔗 Connecting to MongoDB: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
} else {
  // Default MongoDB connection string
  mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/calendar_clone";
  console.log(`🔗 Connecting to MongoDB: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
}

// MongoDB connection options
const mongooseOptions = {
  // Remove deprecated options - Mongoose 7+ handles these automatically
};

// Connect to MongoDB
mongoose
  .connect(mongoUri, mongooseOptions)
  .then(() => {
    console.log("✅ Connected to MongoDB database");
  })
  .catch((error) => {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed through app termination");
  process.exit(0);
});

export default mongoose;
