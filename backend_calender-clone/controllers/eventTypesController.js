import pool from "../database/db.js";

// Get all event types for default user
const getAllEventTypes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT et.*, u.name as user_name 
       FROM event_types et 
       JOIN users u ON et.user_id = u.id 
       ORDER BY et.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching event types:", error);
    res.status(500).json({ error: "Failed to fetch event types" });
  }
};

// Get single event type by slug
const getEventTypeBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT et.*, u.name as user_name, u.timezone as user_timezone
       FROM event_types et 
       JOIN users u ON et.user_id = u.id 
       WHERE et.slug = $1 AND et.is_active = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event type not found" });
    }

    res.json(result.rows[0]);
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
      return res
        .status(400)
        .json({ error: "Title, duration, and slug are required" });
    }

    // Get default user (assuming first user is admin)
    const userResult = await pool.query("SELECT id FROM users LIMIT 1");
    if (userResult.rows.length === 0) {
      return res
        .status(500)
        .json({ error: "No user found. Please seed the database first." });
    }
    const userId = userResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO event_types (user_id, title, description, duration, slug, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title, description || null, duration, slug, true]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      // Unique violation
      return res
        .status(400)
        .json({ error: "Event type with this slug already exists" });
    }
    console.error("Error creating event type:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: "Failed to create event type",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update event type
const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, slug, is_active } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (duration !== undefined) {
      updates.push(`duration = $${paramCount++}`);
      values.push(duration);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramCount++}`);
      values.push(slug);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE event_types SET ${updates.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Event type not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(400)
        .json({ error: "Event type with this slug already exists" });
    }
    console.error("Error updating event type:", error);
    res.status(500).json({ error: "Failed to update event type" });
  }
};

// Delete event type
const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM event_types WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
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
