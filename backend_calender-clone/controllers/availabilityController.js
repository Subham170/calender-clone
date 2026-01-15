import pool from "../database/db.js";

// Get availability for default user
const getAvailability = async (req, res) => {
  try {
    const userResult = await pool.query('SELECT id, timezone FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      return res.status(500).json({ error: 'No user found' });
    }
    const userId = userResult.rows[0].id;
    const timezone = userResult.rows[0].timezone;

    const result = await pool.query(
      'SELECT * FROM availability WHERE user_id = $1 ORDER BY day_of_week, start_time',
      [userId]
    );
    
    res.json({
      timezone,
      availability: result.rows
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

// Set availability
const setAvailability = async (req, res) => {
  try {
    const { availability, timezone } = req.body;
    
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      return res.status(500).json({ error: 'No user found' });
    }
    const userId = userResult.rows[0].id;

    // Update user timezone if provided
    if (timezone) {
      await pool.query('UPDATE users SET timezone = $1 WHERE id = $2', [timezone, userId]);
    }

    // Delete existing availability
    await pool.query('DELETE FROM availability WHERE user_id = $1', [userId]);

    // Insert new availability slots
    if (availability && availability.length > 0) {
      for (const slot of availability) {
        await pool.query(
          `INSERT INTO availability (user_id, day_of_week, start_time, end_time, timezone)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, slot.day_of_week, slot.start_time, slot.end_time, timezone || 'UTC']
        );
      }
    }

    const result = await pool.query(
      'SELECT * FROM availability WHERE user_id = $1 ORDER BY day_of_week, start_time',
      [userId]
    );

    res.json({
      timezone: timezone || 'UTC',
      availability: result.rows
    });
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ error: 'Failed to set availability' });
  }
};

export default {
  getAvailability,
  setAvailability,
};
