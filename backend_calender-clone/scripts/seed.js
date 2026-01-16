import { randomUUID } from "crypto";
import supabase from "../database/supabase.js";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if user already exists
    const { data: existingUsers } = await supabase
      .from("users")
      .select("*")
      .eq("email", "admin@example.com")
      .limit(1);

    let defaultUser;

    if (!existingUsers || existingUsers.length === 0) {
      // Create new user with UUID
      const userId = randomUUID();
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          id: userId,
          name: "Admin User",
          email: "admin@example.com",
          role: "user",
        })
        .select()
        .single();

      if (userError) {
        throw userError;
      }
      defaultUser = newUser;
      console.log("✅ Default user created:", defaultUser.id);
    } else {
      defaultUser = existingUsers[0];
      console.log("✅ Using existing admin user:", defaultUser.id);
    }

    // Create availability (Monday to Friday, 9 AM to 5 PM)
    // Delete existing availability first
    const { error: deleteAvailError } = await supabase
      .from("availability")
      .delete()
      .eq("user_id", defaultUser.id);

    if (deleteAvailError) {
      throw deleteAvailError;
    }

    const availabilitySlots = [];
    for (let day = 1; day <= 5; day++) {
      // Monday to Friday (1 = Monday, 5 = Friday)
      availabilitySlots.push({
        user_id: defaultUser.id,
        day_of_week: day,
        start_time: "09:00:00",
        end_time: "17:00:00",
      });
    }

    const { error: availError } = await supabase
      .from("availability")
      .insert(availabilitySlots);

    if (availError) {
      throw availError;
    }
    console.log("✅ Availability slots created (Mon-Fri, 9 AM - 5 PM)");

    // Create sample bookings
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    const bookings = [
      {
        host_id: defaultUser.id,
        guest_email: "john@example.com",
        start_time: tomorrow.toISOString(),
        end_time: new Date(tomorrow.getTime() + 30 * 60000).toISOString(),
        status: "confirmed",
      },
      {
        host_id: defaultUser.id,
        guest_email: "jane@example.com",
        start_time: nextWeek.toISOString(),
        end_time: new Date(nextWeek.getTime() + 60 * 60000).toISOString(),
        status: "confirmed",
      },
    ];

    // Delete existing bookings for this host to avoid duplicates
    const { error: deleteBookingsError } = await supabase
      .from("bookings")
      .delete()
      .eq("host_id", defaultUser.id);

    if (deleteBookingsError) {
      console.warn(
        "⚠️ Warning: Could not delete existing bookings:",
        deleteBookingsError
      );
    }

    for (const bookingData of bookings) {
      // Check if booking already exists for this time slot
      const { data: existingBooking } = await supabase
        .from("bookings")
        .select("id")
        .eq("host_id", bookingData.host_id)
        .eq("start_time", bookingData.start_time)
        .single();

      if (!existingBooking) {
        const { data: newBooking, error: bookingError } = await supabase
          .from("bookings")
          .insert(bookingData)
          .select()
          .single();

        if (bookingError) {
          console.warn(
            `⚠️ Could not create booking for ${bookingData.guest_email}:`,
            bookingError
          );
        } else {
          console.log(
            `✅ Sample booking created for: ${newBooking.guest_email}`
          );
        }
      } else {
        console.log(`ℹ️ Booking already exists for ${bookingData.guest_email}`);
      }
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if executed directly
import { fileURLToPath } from "url";
import { testConnection } from "../database/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const runAsScript =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (runAsScript) {
  // Test connection first
  testConnection()
    .then((connected) => {
      if (!connected) {
        console.error("❌ Failed to connect to Supabase");
        process.exit(1);
      }
      return seedDatabase();
    })
    .then(() => {
      console.log("✅ Seeding complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export default seedDatabase;
