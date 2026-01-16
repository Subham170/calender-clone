import supabase from "../database/supabase.js";

// Get current user (default user)
const getCurrentUser = async (req, res) => {
  try {
    // Get default user (assuming first user is admin)
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      throw error;
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Return user without password (matching actual schema: id, name, email, role, created_at)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
      timezone: "UTC", // Default since timezone is not in the schema
      created_at: user.created_at,
      updated_at: user.created_at, // Use created_at since updated_at doesn't exist in schema
    };

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Update current user
const updateCurrentUser = async (req, res) => {
  try {
    const { name, email, timezone } = req.body;

    // Get default user
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1);

    if (fetchError) {
      throw fetchError;
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Build update object (only update fields that exist in schema: name, email, role)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      // Check if email already exists (for other users)
      const { data: existingUsers } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase())
        .neq("id", user.id)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        return res.status(400).json({ error: "Email already in use" });
      }
      updateData.email = email.toLowerCase();
    }
    // Note: timezone is not in the schema, so we skip updating it
    // The frontend can still send it, but we won't store it

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      // No changes, return current user
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        timezone: "UTC", // Default since not in schema
        created_at: user.created_at,
        updated_at: user.created_at,
      };
      return res.json(userData);
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === "23505") {
        // PostgreSQL unique constraint violation
        return res.status(400).json({ error: "Email already in use" });
      }
      console.error("Error updating user:", updateError);
      throw updateError;
    }

    // Return updated user (matching actual schema)
    const userData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role || "user",
      timezone: "UTC", // Default since not in schema
      created_at: updatedUser.created_at,
      updated_at: updatedUser.created_at, // Use created_at since updated_at doesn't exist
    };

    res.json(userData);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Email already in use" });
    }
    console.error("Error updating user:", error);
    res.status(500).json({
      error: "Failed to update user",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  getCurrentUser,
  updateCurrentUser,
};
