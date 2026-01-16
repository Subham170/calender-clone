import supabase from "../database/supabase.js";

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const now = new Date().toISOString();

    let query = supabase
      .from("bookings")
      .select(`
        *,
        event_types(id, title, duration, slug)
      `);

    if (status === "upcoming") {
      query = query.gt("start_time", now).eq("status", "confirmed");
    } else if (status === "past") {
      // For past bookings, get bookings where start_time < now
      query = query.lt("start_time", now);
    }

    const { data: bookings, error } = await query.order("start_time", { ascending: false });

    if (error) {
      throw error;
    }

    // For past status, also include cancelled bookings
    let filteredBookings = bookings || [];
    if (status === "past") {
      const { data: cancelledBookings } = await supabase
        .from("bookings")
        .select(`
          *,
          event_types(id, title, duration, slug)
        `)
        .eq("status", "cancelled")
        .order("start_time", { ascending: false });
      
      // Merge and deduplicate
      const bookingIds = new Set((bookings || []).map(b => b.id));
      const additionalCancelled = (cancelledBookings || []).filter(b => !bookingIds.has(b.id));
      filteredBookings = [...(bookings || []), ...additionalCancelled].sort((a, b) => 
        new Date(b.start_time) - new Date(a.start_time)
      );
    }

    // Transform to match expected format
    const formattedBookings = filteredBookings.map((booking) => ({
      id: booking.id,
      event_type_id: booking.event_type_id,
      event_title: booking.event_types.title,
      duration: booking.event_types.duration,
      event_slug: booking.event_types.slug,
      booker_name: booking.booker_name,
      booker_email: booking.booker_email,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      created_at: booking.created_at,
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

    // Get event type with user info
    const { data: eventType, error: eventTypeError } = await supabase
      .from("event_types")
      .select(`
        *,
        users!inner(id, timezone)
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (eventTypeError || !eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Get availability for this day
    const { data: availability, error: availabilityError } = await supabase
      .from("availability")
      .select("*")
      .eq("user_id", eventType.user_id)
      .eq("day_of_week", dayOfWeek);

    if (availabilityError) {
      throw availabilityError;
    }

    if (!availability || availability.length === 0) {
      return res.json({ availableSlots: [] });
    }

    // Get existing bookings for this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("start_time")
      .eq("event_type_id", eventType.id)
      .eq("status", "confirmed")
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString());

    if (bookingsError) {
      throw bookingsError;
    }

    const bookedTimes = (existingBookings || []).map((b) => new Date(b.start_time));

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
    const { data: eventType, error: eventTypeError } = await supabase
      .from("event_types")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (eventTypeError || !eventType) {
      return res.status(404).json({ error: "Event type not found" });
    }

    const startTime = new Date(start_time);
    const endTime = new Date(startTime.getTime() + eventType.duration * 60000);

    // Check if slot is already booked
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("event_type_id", eventType.id)
      .eq("start_time", startTime.toISOString())
      .eq("status", "confirmed")
      .single();

    if (existingBooking) {
      return res.status(409).json({ error: "This time slot is already booked" });
    }

    // Create booking
    const { data: booking, error: createError } = await supabase
      .from("bookings")
      .insert({
        event_type_id: eventType.id,
        booker_name,
        booker_email: booker_email.toLowerCase(),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "confirmed",
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === "23505") {
        // PostgreSQL unique constraint violation (double booking prevention)
        return res.status(409).json({ error: "This time slot is already booked" });
      }
      throw createError;
    }

    // Transform to match expected format
    const formattedBooking = {
      id: booking.id,
      event_type_id: booking.event_type_id,
      booker_name: booking.booker_name,
      booker_email: booking.booker_email,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      created_at: booking.created_at,
      event_title: eventType.title,
      duration: eventType.duration,
    };

    res.status(201).json(formattedBooking);
  } catch (error) {
    if (error.code === "23505") {
      // PostgreSQL unique constraint violation (double booking prevention)
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

    const { data: booking, error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();

    if (error || !booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Transform to match expected format
    const formattedBooking = {
      id: booking.id,
      event_type_id: booking.event_type_id,
      booker_name: booking.booker_name,
      booker_email: booking.booker_email,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      created_at: booking.created_at,
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
