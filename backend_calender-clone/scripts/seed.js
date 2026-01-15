import pool from "../database/db.js";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

async function seedDatabase() {
  try {
    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const userResult = await pool.query(
      `INSERT INTO users (name, email, password, timezone) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Admin User', 'admin@example.com', hashedPassword, 'America/New_York']
    );
    
    const userId = userResult.rows[0].id;
    console.log('Default user created/updated:', userId);

    // Create sample event types
    const eventTypes = [
      {
        title: '30 Min Meeting',
        description: 'A quick 30-minute meeting',
        duration: 30,
        slug: '30min'
      },
      {
        title: '15 Min Meeting',
        description: 'A brief 15-minute meeting',
        duration: 15,
        slug: '15min'
      },
      {
        title: '60 Min Meeting',
        description: 'An hour-long meeting',
        duration: 60,
        slug: '60min'
      }
    ];

    const eventTypeIds = [];
    for (const eventType of eventTypes) {
      const result = await pool.query(
        `INSERT INTO event_types (user_id, title, description, duration, slug, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, duration = EXCLUDED.duration
         RETURNING id`,
        [userId, eventType.title, eventType.description, eventType.duration, eventType.slug, true]
      );
      eventTypeIds.push(result.rows[0].id);
      console.log(`Event type created: ${eventType.title}`);
    }

    // Create availability (Monday to Friday, 9 AM to 5 PM)
    const availabilitySlots = [];
    for (let day = 1; day <= 5; day++) { // Monday to Friday
      await pool.query(
        `INSERT INTO availability (user_id, day_of_week, start_time, end_time, timezone)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, day_of_week, start_time, end_time) DO NOTHING`,
        [userId, day, '09:00:00', '17:00:00', 'America/New_York']
      );
    }
    console.log('Availability slots created (Mon-Fri, 9 AM - 5 PM)');

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
        booker_name: 'John Doe',
        booker_email: 'john@example.com',
        start_time: tomorrow,
        end_time: new Date(tomorrow.getTime() + 30 * 60000)
      },
      {
        event_type_id: eventTypeIds[1],
        booker_name: 'Jane Smith',
        booker_email: 'jane@example.com',
        start_time: nextWeek,
        end_time: new Date(nextWeek.getTime() + 15 * 60000)
      }
    ];

    for (const booking of bookings) {
      await pool.query(
        `INSERT INTO bookings (event_type_id, booker_name, booker_email, start_time, end_time, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (event_type_id, start_time) DO NOTHING`,
        [booking.event_type_id, booking.booker_name, booking.booker_email, booking.start_time, booking.end_time, 'confirmed']
      );
    }
    console.log('Sample bookings created');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run if executed directly (check if this file is the main module)
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
