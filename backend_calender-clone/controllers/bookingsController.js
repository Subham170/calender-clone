import pool from "../database/db.js";

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT b.*, et.title as event_title, et.duration, et.slug as event_slug
      FROM bookings b
      JOIN event_types et ON b.event_type_id = et.id
    `;
    const params = [];
    
    if (status === 'upcoming') {
      query += ' WHERE b.start_time > CURRENT_TIMESTAMP AND b.status = $1';
      params.push('confirmed');
    } else if (status === 'past') {
      query += ' WHERE b.start_time < CURRENT_TIMESTAMP OR b.status = $1';
      params.push('cancelled');
    }
    
    query += ' ORDER BY b.start_time DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get available time slots for a specific event type and date
const getAvailableSlots = async (req, res) => {
  try {
    const { slug } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    // Get event type
    const eventTypeResult = await pool.query(
      `SELECT et.*, u.timezone as user_timezone
       FROM event_types et 
       JOIN users u ON et.user_id = u.id 
       WHERE et.slug = $1 AND et.is_active = true`,
      [slug]
    );

    if (eventTypeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    const eventType = eventTypeResult.rows[0];
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get availability for this day
    const availabilityResult = await pool.query(
      'SELECT * FROM availability WHERE day_of_week = $1',
      [dayOfWeek]
    );

    if (availabilityResult.rows.length === 0) {
      return res.json({ availableSlots: [] });
    }

    // Get existing bookings for this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookingsResult = await pool.query(
      `SELECT start_time FROM bookings 
       WHERE event_type_id = $1 
       AND start_time >= $2 
       AND start_time <= $3 
       AND status = 'confirmed'`,
      [eventType.id, startOfDay, endOfDay]
    );

    const bookedTimes = bookingsResult.rows.map(b => new Date(b.start_time));

    // Generate available slots
    const availableSlots = [];
    for (const avail of availabilityResult.rows) {
      const [startHour, startMin] = avail.start_time.split(':').map(Number);
      const [endHour, endMin] = avail.end_time.split(':').map(Number);
      
      const slotStart = new Date(selectedDate);
      slotStart.setHours(startHour, startMin, 0, 0);
      
      const slotEnd = new Date(selectedDate);
      slotEnd.setHours(endHour, endMin, 0, 0);

      let currentSlot = new Date(slotStart);
      while (currentSlot.getTime() + eventType.duration * 60000 <= slotEnd.getTime()) {
        const slotEndTime = new Date(currentSlot.getTime() + eventType.duration * 60000);
        
        // Check if this slot is already booked
        const isBooked = bookedTimes.some(bt => {
          const bookingEnd = new Date(bt.getTime() + eventType.duration * 60000);
          return (currentSlot < bookingEnd && slotEndTime > bt);
        });

        if (!isBooked) {
          availableSlots.push({
            start: currentSlot.toISOString(),
            end: slotEndTime.toISOString()
          });
        }

        currentSlot = new Date(currentSlot.getTime() + eventType.duration * 60000);
      }
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

// Create booking
const createBooking = async (req, res) => {
  try {
    const { slug } = req.params;
    const { booker_name, booker_email, start_time } = req.body;

    if (!booker_name || !booker_email || !start_time) {
      return res.status(400).json({ error: 'Booker name, email, and start time are required' });
    }

    // Get event type
    const eventTypeResult = await pool.query(
      'SELECT * FROM event_types WHERE slug = $1 AND is_active = true',
      [slug]
    );

    if (eventTypeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    const eventType = eventTypeResult.rows[0];
    const startTime = new Date(start_time);
    const endTime = new Date(startTime.getTime() + eventType.duration * 60000);

    // Check if slot is already booked
    const existingBooking = await pool.query(
      `SELECT id FROM bookings 
       WHERE event_type_id = $1 
       AND start_time = $2 
       AND status = 'confirmed'`,
      [eventType.id, startTime]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    // Create booking
    const result = await pool.query(
      `INSERT INTO bookings (event_type_id, booker_name, booker_email, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [eventType.id, booker_name, booker_email, startTime, endTime, 'confirmed']
    );

    res.status(201).json({
      ...result.rows[0],
      event_title: eventType.title,
      duration: eventType.duration
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'This time slot is already booked' });
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

export default {
  getAllBookings,
  getAvailableSlots,
  createBooking,
  cancelBooking,
};
