import cors from "cors";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

import availabilityRoutes from "./routes/availability.js";
import bookingsRoutes from "./routes/bookings.js";
import eventTypesRoutes from "./routes/eventTypes.js";
import userRoutes from "./routes/user.js";
import mongoose from "./database/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection is handled in db.js
// Check connection status
if (mongoose.connection.readyState === 1) {
  console.log("✅ Connected to MongoDB database");
} else {
  mongoose.connection.once("connected", () => {
    console.log("✅ Connected to MongoDB database");
  });
}

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Routes
app.use("/api/event-types", eventTypesRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/user", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Calendar Clone API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
