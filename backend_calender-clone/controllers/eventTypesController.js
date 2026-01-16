import EventType from "../models/EventType.js";
import User from "../models/User.js";

// Get all event types for default user
const getAllEventTypes = async (req, res) => {
  try {
    // Get default user (assuming first user is admin)
    const defaultUser = await User.findOne().sort({ createdAt: 1 });
    if (!defaultUser) {
      return res.status(500).json({ error: "No user found. Please seed the database first." });
    }

    const eventTypes = await EventType.find({ user_id: defaultUser._id })
      .populate("user_id", "name")
      .sort({ createdAt: -1 });

    // Transform to match expected format
    const formattedEventTypes = eventTypes.map((et) => ({
      id: et._id,
      user_id: et.user_id._id,
      user_name: et.user_id.name,
      title: et.title,
      description: et.description,
      duration: et.duration,
      slug: et.slug,
      is_active: et.is_active,
      created_at: et.createdAt,
      updated_at: et.updatedAt,
    }));

    res.json(formattedEventTypes);
  } catch (error) {
    console.error("Error fetching event types:", error);
    res.status(500).json({ error: "Failed to fetch event types" });
  }
};

// Get single event type by slug
const getEventTypeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const eventType = await EventType.findOne({ slug, is_active: true }).populate("user_id", "name timezone");

    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    // Transform to match expected format
    const formattedEventType = {
      id: eventType._id,
      user_id: eventType.user_id._id,
      user_name: eventType.user_id.name,
      user_timezone: eventType.user_id.timezone,
      title: eventType.title,
      description: eventType.description,
      duration: eventType.duration,
      slug: eventType.slug,
      is_active: eventType.is_active,
      created_at: eventType.createdAt,
      updated_at: eventType.updatedAt,
    };

    res.json(formattedEventType);
  } catch (error) {
    console.error("Error fetching event type:", error);
    res.status(500).json({ error: "Failed to fetch event type" });
  }
};

// Create event type
const createEventType = async (req, res) => {
  try {
    const { title, description, duration, slug } = req.body;

    if (!title || !duration || !slug) {
      return res.status(400).json({ error: "Title, duration, and slug are required" });
    }

    // Get default user (assuming first user is admin)
    const defaultUser = await User.findOne().sort({ createdAt: 1 });
    if (!defaultUser) {
      return res.status(500).json({ error: "No user found. Please seed the database first." });
    }

    // Check if slug already exists
    const existingEventType = await EventType.findOne({ slug });
    if (existingEventType) {
      return res.status(400).json({ error: "Event type with this slug already exists" });
    }

    const eventType = new EventType({
      user_id: defaultUser._id,
      title,
      description: description || null,
      duration,
      slug,
      is_active: true,
    });

    await eventType.save();

    // Transform to match expected format
    const formattedEventType = {
      id: eventType._id,
      user_id: eventType.user_id,
      title: eventType.title,
      description: eventType.description,
      duration: eventType.duration,
      slug: eventType.slug,
      is_active: eventType.is_active,
      created_at: eventType.createdAt,
      updated_at: eventType.updatedAt,
    };

    res.status(201).json(formattedEventType);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (MongoDB unique constraint)
      return res.status(400).json({ error: "Event type with this slug already exists" });
    }
    console.error("Error creating event type:", error);
    res.status(500).json({
      error: "Failed to create event type",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update event type
const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, slug, is_active } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (slug !== undefined) updateData.slug = slug;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Check if slug already exists (if slug is being updated)
    if (slug) {
      const existingEventType = await EventType.findOne({ slug, _id: { $ne: id } });
      if (existingEventType) {
        return res.status(400).json({ error: "Event type with this slug already exists" });
      }
    }

    const eventType = await EventType.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    // Transform to match expected format
    const formattedEventType = {
      id: eventType._id,
      user_id: eventType.user_id,
      title: eventType.title,
      description: eventType.description,
      duration: eventType.duration,
      slug: eventType.slug,
      is_active: eventType.is_active,
      created_at: eventType.createdAt,
      updated_at: eventType.updatedAt,
    };

    res.json(formattedEventType);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Event type with this slug already exists" });
    }
    console.error("Error updating event type:", error);
    res.status(500).json({ error: "Failed to update event type" });
  }
};

// Delete event type
const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;

    const eventType = await EventType.findByIdAndDelete(id);

    if (!eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    res.json({ message: "Event type deleted successfully" });
  } catch (error) {
    console.error("Error deleting event type:", error);
    res.status(500).json({ error: "Failed to delete event type" });
  }
};

export default {
  getAllEventTypes,
  getEventTypeBySlug,
  createEventType,
  updateEventType,
  deleteEventType,
};
