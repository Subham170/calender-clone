import mongoose from "../database/db.js";
import User from "../models/User.js";
import EventType from "../models/EventType.js";
import Availability from "../models/Availability.js";
import Booking from "../models/Booking.js";
import bcrypt from "bcryptjs";

async function seedDatabase() {
  try {
    // Wait for MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await new Promise((resolve) => {
        mongoose.connection.once("connected", resolve);
      });
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    let defaultUser = await User.findOne({ email: "admin@example.com" });
    if (!defaultUser) {
      defaultUser = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        timezone: "America/New_York",
      });
      await defaultUser.save();
      console.log("✅ Default user created:", defaultUser._id);
    } else {
      defaultUser.name = "Admin User";
      defaultUser.timezone = "America/New_York";
      await defaultUser.save();
      console.log("✅ Default user updated:", defaultUser._id);
    }

    // Create sample event types
    const eventTypes = [
      {
        title: "30 Min Meeting",
        description: "A quick 30-minute meeting",
        duration: 30,
        slug: "30min",
      },
      {
        title: "15 Min Meeting",
        description: "A brief 15-minute meeting",
        duration: 15,
        slug: "15min",
      },
      {
        title: "60 Min Meeting",
        description: "An hour-long meeting",
        duration: 60,
        slug: "60min",
      },
    ];

    const eventTypeIds = [];
    for (const eventTypeData of eventTypes) {
      let eventType = await EventType.findOne({ slug: eventTypeData.slug });
      if (!eventType) {
        eventType = new EventType({
          user_id: defaultUser._id,
          ...eventTypeData,
          is_active: true,
        });
        await eventType.save();
        console.log(`✅ Event type created: ${eventType.title}`);
      } else {
        eventType.title = eventTypeData.title;
        eventType.description = eventTypeData.description;
        eventType.duration = eventTypeData.duration;
        await eventType.save();
        console.log(`✅ Event type updated: ${eventType.title}`);
      }
      eventTypeIds.push(eventType._id);
    }

    // Create availability (Monday to Friday, 9 AM to 5 PM)
    // Delete existing availability first
    await Availability.deleteMany({ user_id: defaultUser._id });

    const availabilitySlots = [];
    for (let day = 1; day <= 5; day++) {
      // Monday to Friday
      availabilitySlots.push({
        user_id: defaultUser._id,
        day_of_week: day,
        start_time: "09:00:00",
        end_time: "17:00:00",
        timezone: "America/New_York",
      });
    }

    await Availability.insertMany(availabilitySlots);
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
        event_type_id: eventTypeIds[0],
        booker_name: "John Doe",
        booker_email: "john@example.com",
        start_time: tomorrow,
        end_time: new Date(tomorrow.getTime() + 30 * 60000),
        status: "confirmed",
      },
      {
        event_type_id: eventTypeIds[1],
        booker_name: "Jane Smith",
        booker_email: "jane@example.com",
        start_time: nextWeek,
        end_time: new Date(nextWeek.getTime() + 15 * 60000),
        status: "confirmed",
      },
    ];

    // Delete existing bookings to avoid duplicates
    await Booking.deleteMany({});

    for (const bookingData of bookings) {
      // Check if booking already exists for this time slot
      const existingBooking = await Booking.findOne({
        event_type_id: bookingData.event_type_id,
        start_time: bookingData.start_time,
      });

      if (!existingBooking) {
        const booking = new Booking(bookingData);
        await booking.save();
        console.log(`✅ Sample booking created: ${booking.booker_name}`);
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
const __filename = fileURLToPath(import.meta.url);
const runAsScript = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (runAsScript) {
  seedDatabase()
    .then(() => {
      console.log("Seeding complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export default seedDatabase;
