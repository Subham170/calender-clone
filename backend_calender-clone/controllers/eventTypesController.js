import supabase from "../database/supabase.js";

// Get all event types for default user
const getAllEventTypes = async (req, res) => {
  try {
    // Get default user (assuming first user is admin)
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, name")
      .order("created_at", { ascending: true })
      .limit(1);

    if (userError) {
      throw userError;
    }

    if (!users || users.length === 0) {
      return res.status(500).json({ error: "No user found. Please seed the database first." });
    }

    const defaultUser = users[0];

    // Get event types for this user
    const { data: eventTypes, error: eventTypesError } = await supabase
      .from("event_types")
      .select("*")
      .eq("user_id", defaultUser.id)
      .order("created_at", { ascending: false });

    if (eventTypesError) {
      if (eventTypesError.code === "PGRST116" || eventTypesError.message?.includes("relation") || eventTypesError.message?.includes("does not exist")) {
        console.error("❌ event_types table does not exist. Please run the SQL migration.");
        return res.status(500).json({ 
          error: "Database table 'event_types' does not exist. Please create it first.",
          details: process.env.NODE_ENV === "development" ? eventTypesError.message : undefined
        });
      }
      throw eventTypesError;
    }

    // Transform to match expected format
    const formattedEventTypes = (eventTypes || []).map((et) => ({
      id: et.id,
      user_id: et.user_id,
      user_name: defaultUser.name,
      title: et.title,
      description: et.description,
      duration: et.duration,
      slug: et.slug,
      is_active: et.is_active,
      created_at: et.created_at,
      updated_at: et.updated_at || et.created_at,
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

    // Get user info
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("name, timezone")
      .eq("id", eventType.user_id)
      .single();

    if (userError) {
      throw userError;
    }

    // Transform to match expected format
    const formattedEventType = {
      id: eventType.id,
      user_id: eventType.user_id,
      user_name: user?.name || "",
      user_timezone: user?.timezone || "UTC",
      title: eventType.title,
      description: eventType.description,
      duration: eventType.duration,
      slug: eventType.slug,
      is_active: eventType.is_active,
      created_at: eventType.created_at,
      updated_at: eventType.updated_at || eventType.created_at,
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
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1);

    if (userError) {
      throw userError;
    }

    if (!users || users.length === 0) {
      return res.status(500).json({ error: "No user found. Please seed the database first." });
    }

    const defaultUser = users[0];

    // Check if slug already exists
    const { data: existingEventType } = await supabase
      .from("event_types")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingEventType) {
      return res.status(400).json({ error: "Event type with this slug already exists" });
    }

    // Create event type
    const { data: eventType, error: createError } = await supabase
      .from("event_types")
      .insert({
        user_id: defaultUser.id,
        title,
        description: description || null,
        duration,
        slug,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === "23505") {
        // PostgreSQL unique constraint violation
        return res.status(400).json({ error: "Event type with this slug already exists" });
      }
      if (createError.code === "PGRST116" || createError.message?.includes("relation") || createError.message?.includes("does not exist")) {
        console.error("❌ event_types table does not exist. Please run the SQL migration:");
        console.error("   See: database/create_event_types_table.sql");
        return res.status(500).json({ 
          error: "Database table 'event_types' does not exist. Please create it first.",
          details: process.env.NODE_ENV === "development" ? createError.message : undefined
        });
      }
      console.error("❌ Error creating event type:", createError);
      throw createError;
    }

    // Transform to match expected format
    const formattedEventType = {
      id: eventType.id,
      user_id: eventType.user_id,
      title: eventType.title,
      description: eventType.description,
      duration: eventType.duration,
      slug: eventType.slug,
      is_active: eventType.is_active,
      created_at: eventType.created_at,
      updated_at: eventType.updated_at || eventType.created_at,
    };

    res.status(201).json(formattedEventType);
  } catch (error) {
    if (error.code === "23505") {
      // PostgreSQL unique constraint violation
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
    updateData.updated_at = new Date().toISOString();

    // Check if slug already exists (if slug is being updated)
    if (slug) {
      const { data: existingEventType } = await supabase
        .from("event_types")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (existingEventType) {
        return res.status(400).json({ error: "Event type with this slug already exists" });
      }
    }

    // Update event type
    const { data: eventType, error: updateError } = await supabase
      .from("event_types")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !eventType) {
      if (updateError?.code === "23505") {
        return res.status(400).json({ error: "Event type with this slug already exists" });
      }
      return res.status(404).json({ error: "Event type not found" });
    }

    // Transform to match expected format
    const formattedEventType = {
      id: eventType.id,
      user_id: eventType.user_id,
      title: eventType.title,
      description: eventType.description,
      duration: eventType.duration,
      slug: eventType.slug,
      is_active: eventType.is_active,
      created_at: eventType.created_at,
      updated_at: eventType.updated_at || eventType.created_at,
    };

    res.json(formattedEventType);
  } catch (error) {
    if (error.code === "23505") {
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

    const { data: eventType, error } = await supabase
      .from("event_types")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error || !eventType) {
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
