import User from "../models/User.js";

// Get current user (default user)
const getCurrentUser = async (req, res) => {
  try {
    // Get default user (assuming first user is admin)
    const user = await User.findOne().sort({ createdAt: 1 });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
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
    const user = await User.findOne().sort({ createdAt: 1 });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) {
      // Check if email already exists (for other users)
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      user.email = email.toLowerCase();
    }
    if (timezone !== undefined) user.timezone = timezone;

    await user.save();

    // Return updated user without password
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };

    res.json(userData);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already in use" });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export default {
  getCurrentUser,
  updateCurrentUser,
};
