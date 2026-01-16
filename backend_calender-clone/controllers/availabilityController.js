import Availability from "../models/Availability.js";
import User from "../models/User.js";


// Get availability for default user
const getAvailability = async (req, res) => {
  try {
    const defaultUser = await User.findOne().sort({ createdAt: 1 });
    if (!defaultUser) {
      return res.status(500).json({ error: "No user found" });
    }

    const availability = await Availability.find({ user_id: defaultUser._id }).sort({
      day_of_week: 1,
      start_time: 1,
    });

    // Transform to match expected format
    const formattedAvailability = availability.map((avail) => ({
      id: avail._id,
      user_id: avail.user_id,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time,
      timezone: avail.timezone,
      created_at: avail.createdAt,
    }));

    res.json({
      timezone: defaultUser.timezone,
      availability: formattedAvailability,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
};

// Set availability
const setAvailability = async (req, res) => {
  try {
    const { availability, timezone } = req.body;

    const defaultUser = await User.findOne().sort({ createdAt: 1 });
    if (!defaultUser) {
      return res.status(500).json({ error: "No user found" });
    }

    // Update user timezone if provided
    if (timezone) {
      defaultUser.timezone = timezone;
      await defaultUser.save();
    }

    // Delete existing availability
    await Availability.deleteMany({ user_id: defaultUser._id });

    // Insert new availability slots
    if (availability && availability.length > 0) {
      const availabilityDocs = availability.map((slot) => ({
        user_id: defaultUser._id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        timezone: timezone || defaultUser.timezone || "UTC",
      }));

      await Availability.insertMany(availabilityDocs);
    }

    // Fetch updated availability
    const updatedAvailability = await Availability.find({ user_id: defaultUser._id }).sort({
      day_of_week: 1,
      start_time: 1,
    });

    // Transform to match expected format
    const formattedAvailability = updatedAvailability.map((avail) => ({
      id: avail._id,
      user_id: avail.user_id,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time,
      timezone: avail.timezone,
      created_at: avail.createdAt,
    }));

    res.json({
      timezone: timezone || defaultUser.timezone || "UTC",
      availability: formattedAvailability,
    });
  } catch (error) {
    console.error("Error setting availability:", error);
    res.status(500).json({ error: "Failed to set availability" });
  }
};

export default {
  getAvailability,
  setAvailability,
};
