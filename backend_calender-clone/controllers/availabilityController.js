import supabase from "../database/supabase.js";

// Get availability for default user
const getAvailability = async (req, res) => {
  try {
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1);

    if (userError) {
      throw userError;
    }

    if (!users || users.length === 0) {
      return res.status(500).json({ error: "No user found" });
    }

    const defaultUser = users[0];

    // Get availability for this user
    const { data: availability, error: availabilityError } = await supabase
      .from("availability")
      .select("*")
      .eq("user_id", defaultUser.id)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (availabilityError) {
      throw availabilityError;
    }

    // Transform to match expected format (no timezone in schema)
    const formattedAvailability = (availability || []).map((avail) => ({
      id: avail.id,
      user_id: avail.user_id,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time,
      created_at: avail.created_at,
    }));

    res.json({
      timezone: "UTC", // Default timezone since it's not in the schema
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

    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1);

    if (userError) {
      throw userError;
    }

    if (!users || users.length === 0) {
      return res.status(500).json({ error: "No user found" });
    }

    const defaultUser = users[0];

    // Delete existing availability
    const { error: deleteError } = await supabase
      .from("availability")
      .delete()
      .eq("user_id", defaultUser.id);

    if (deleteError) {
      console.error("Error deleting existing availability:", deleteError);
      throw deleteError;
    }

    // Insert new availability slots (no timezone column in schema)
    if (availability && availability.length > 0) {
      const availabilityDocs = availability.map((slot) => ({
        user_id: defaultUser.id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }));

      const { error: insertError } = await supabase
        .from("availability")
        .insert(availabilityDocs);

      if (insertError) {
        console.error("Error inserting availability:", insertError);
        throw insertError;
      }
    }

    // Fetch updated availability
    const { data: updatedAvailability, error: fetchError } = await supabase
      .from("availability")
      .select("*")
      .eq("user_id", defaultUser.id)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    // Transform to match expected format (no timezone in schema)
    const formattedAvailability = (updatedAvailability || []).map((avail) => ({
      id: avail.id,
      user_id: avail.user_id,
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time,
      created_at: avail.created_at,
    }));

    res.json({
      timezone: timezone || "UTC", // Return timezone from request or default
      availability: formattedAvailability,
    });
  } catch (error) {
    console.error("Error setting availability:", error);
    res.status(500).json({
      error: "Failed to set availability",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  getAvailability,
  setAvailability,
};
