import supabase, { testConnection } from "./supabase.js";

// Initialize Supabase connection
console.log("🔗 Connecting to Supabase...");

// Test connection on startup
testConnection().catch((error) => {
  console.error("❌ Failed to connect to Supabase:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Supabase connection closed through app termination");
  process.exit(0);
});

export default supabase;
