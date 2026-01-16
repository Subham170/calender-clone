import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    event_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventType",
      required: true,
    },
    booker_name: {
      type: String,
      required: true,
    },
    booker_email: {
      type: String,
      required: true,
      lowercase: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index to prevent double booking
bookingSchema.index(
  { event_type_id: 1, start_time: 1 },
  { unique: true }
);

// Indexes for better query performance
bookingSchema.index({ event_type_id: 1 });
bookingSchema.index({ start_time: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ booker_email: 1 });

export default mongoose.model("Booking", bookingSchema);
