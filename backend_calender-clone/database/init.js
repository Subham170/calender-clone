import mongoose from "./db.js";

// MongoDB doesn't need explicit schema initialization like SQL databases
// The models will create collections automatically on first use
// This file is kept for consistency and can run connection checks

async function initDatabase() {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      console.log("✅ Database connection is active");
      console.log("✅ MongoDB collections will be created automatically when models are used");
    } else {
      console.log("⚠️ Database connection not ready. Waiting for connection...");
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
      console.log("✅ Database connection established");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Run if executed directly (check if this file is the main module)
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const runAsScript = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (runAsScript) {
  initDatabase()
    .then(() => {
      console.log("Database initialization complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database initialization failed:", error);
      process.exit(1);
    });
}

export default initDatabase;
