import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Supabase client initialization
// Using hardcoded values - update these or set in .env file
const supabaseUrl = "https://tzcxruklkbqmmhqqsxxe.supabase.co";
const supabaseServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Y3hydWtsa2JxbW1ocXFzeHhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU0ODUwMywiZXhwIjoyMDg0MTI0NTAzfQ.uf6MlAOwT9b_adISooFhNMAtXc6-Na9hF_hvHKgrW3I"; // SERVER ONLY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing Supabase credentials!");
  console.error("SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing");
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceRoleKey ? "✓ Set" : "✗ Missing"
  );
  throw new Error(
    "Missing Supabase credentials. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file"
  );
}

// Log URL (masked for security)
if (supabaseUrl) {
  const urlParts = supabaseUrl.split("//");
  const maskedUrl =
    urlParts.length > 1
      ? `${urlParts[0]}//***${urlParts[1].substring(urlParts[1].indexOf("."))}`
      : "***";
  console.log(`🔗 Using Supabase URL: ${maskedUrl}`);
}

// Create Supabase client with service role key (bypasses RLS - use with caution)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("users").select("id").limit(1);
    if (error && error.code !== "PGRST116") {
      // PGRST116 is "relation does not exist" - table might not be created yet
      console.error("❌ Error connecting to Supabase:", error);
      throw error;
    }
    console.log("✅ Connected to Supabase database");
    return true;
  } catch (error) {
    console.error("❌ Error testing Supabase connection:", error);
    return false;
  }
};

export default supabase;
export { testConnection };
