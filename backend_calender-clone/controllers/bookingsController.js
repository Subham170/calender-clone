import Booking from "../models/Booking.js";
import EventType from "../models/EventType.js";
import User from "../models/User.js";
import Availability from "../models/Availability.js";

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const now = new Date();

    let query = {};
    if (status === "upcoming") {
      query = {
        start_time: { $gt: now },
        status: "confirmed",
      };
    } else if (status === "past") {
      query = {
        $or: [{ start_time: { $lt: now } }, { status: "cancelled" }],
      };
    }

    const bookings = await Booking.find(query)
      .populate("event_type_id", "title duration slug")
      .sort({ start_time: -1 });

    // Transform to match expected format
    const formattedBookings = bookings.map((booking) => ({
      id: booking._id,
      event_type_id: booking.event_type_id._id,
      event_title: booking.event_type_id.title,
      duration: booking.event_type_id.duration,
      event_slug: booking.event_type_id.slug,
      booker_name: booking.booker_name,
      booker_email: booking.booker_email,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      created_at: booking.createdAt,
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Get available time slots for a specific event type and date
const getAvailableSlots = async (req, res) => {
  try {
    const { slug } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Get event type
    const eventType = await EventType.findOne({ slug, is_active: true }).populate("user_id", "timezone");

    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get availability for this day
    const availability = await Availability.find({
      user_id: eventType.user_id._id,
      day_of_week: dayOfWeek,
    });

    if (availability.length === 0) {
      return res.json({ availableSlots: [] });
    }

    // Get existing bookings for this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      event_type_id: eventType._id,
      start_time: { $gte: startOfDay, $lte: endOfDay },
      status: "confirmed",
    });

    const bookedTimes = existingBookings.map((b) => new Date(b.start_time));

    // Generate available slots
    const availableSlots = [];
    for (const avail of availability) {
      const [startHour, startMin] = avail.start_time.split(":").map(Number);
      const [endHour, endMin] = avail.end_time.split(":").map(Number);

      const slotStart = new Date(selectedDate);
      slotStart.setHours(startHour, startMin, 0, 0);

      const slotEnd = new Date(selectedDate);
      slotEnd.setHours(endHour, endMin, 0, 0);

      let currentSlot = new Date(slotStart);
      while (currentSlot.getTime() + eventType.duration * 60000 <= slotEnd.getTime()) {
        const slotEndTime = new Date(currentSlot.getTime() + eventType.duration * 60000);

        // Check if this slot is already booked
        const isBooked = bookedTimes.some((bt) => {
          const bookingEnd = new Date(bt.getTime() + eventType.duration * 60000);
          return currentSlot < bookingEnd && slotEndTime > bt;
        });

        if (!isBooked) {
          availableSlots.push({
            start: currentSlot.toISOString(),
            end: slotEndTime.toISOString(),
          });
        }

        currentSlot = new Date(currentSlot.getTime() + eventType.duration * 60000);
      }
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
};

// Create booking
const createBooking = async (req, res) => {
  try {
    const { slug } = req.params;
    const { booker_name, booker_email, start_time } = req.body;

    if (!booker_name || !booker_email || !start_time) {
      return res.status(400).json({ error: "Booker name, email, and start time are required" });
    }

    // Get event type
    const eventType = await EventType.findOne({ slug, is_active: true });

    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    const startTime = new Date(start_time);
    const endTime = new Date(startTime.getTime() + eventType.duration * 60000);

    // Check if slot is already booked
    const existingBooking = await Booking.findOne({
      event_type_id: eventType._id,
      start_time: startTime,
      status: "confirmed",
    });

    if (existingBooking) {
      return res.status(409).json({ error: "This time slot is already booked" });
    }

    // Create booking
    const booking = new Booking({
      event_type_id: eventType._id,
      booker_name,
      booker_email,
      start_time: startTime,
      end_time: endTime,
      status: "confirmed",
    });

    await booking.save();

    // Transform to match expected format
    const formattedBooking = {
      id: booking._id,
      event_type_id: booking.event_type_id,
      booker_name: booking.booker_name,
      booker_email: booking.booker_email,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      created_at: booking.createdAt,
      event_title: eventType.title,
      duration: eventType.duration,
    };

    res.status(201).json(formattedBooking);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (double booking prevention)
      return res.status(409).json({ error: "This time slot is already booked" });
    }
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(id, { status: "cancelled" }, { new: true });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Transform to match expected format
    const formattedBooking = {
      id: booking._id,
      event_type_id: booking.event_type_id,
      booker_name: booking.booker_name,
      booker_email: booking.booker_email,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      created_at: booking.createdAt,
    };

    res.json(formattedBooking);
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

export default {
  getAllBookings,
  getAvailableSlots,
  createBooking,
  cancelBooking,
};
