import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    day_of_week: {
      type: Number,
      required: true, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      min: 0,
      max: 6,
    },
    start_time: {
      type: String,
      required: true, // Format: "HH:MM:SS" or "HH:MM"
    },
    end_time: {
      type: String,
      required: true, // Format: "HH:MM:SS" or "HH:MM"
    },
    timezone: {
      type: String,
      default: "UTC",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index to prevent duplicate availability slots
availabilitySchema.index(
  { user_id: 1, day_of_week: 1, start_time: 1, end_time: 1 },
  { unique: true }
);

// Index for better query performance
availabilitySchema.index({ user_id: 1 });
availabilitySchema.index({ day_of_week: 1 });

export default mongoose.model("Availability", availabilitySchema);
