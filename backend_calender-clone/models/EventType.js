import mongoose from "mongoose";

const eventTypeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: Number,
      required: true, // in minutes
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for better query performance
eventTypeSchema.index({ user_id: 1 });
eventTypeSchema.index({ slug: 1 });
eventTypeSchema.index({ is_active: 1 });

export default mongoose.model("EventType", eventTypeSchema);
