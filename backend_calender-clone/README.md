# Backend - Calendar Clone API

Backend API for Cal.com clone built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v5.0 or higher) - Local installation or MongoDB Atlas account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MongoDB:
   - **Option A (Recommended):** Use MongoDB Atlas (cloud) - See [MONGODB_SETUP.md](./MONGODB_SETUP.md)
   - **Option B:** Install MongoDB locally - See [MONGODB_SETUP.md](./MONGODB_SETUP.md)

3. Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/calendar_clone?retryWrites=true&w=majority
PORT=5000
```

   For local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/calendar_clone
PORT=5000
```

4. Initialize the database:
```bash
node database/init.js
```

5. Seed the database with sample data:
```bash
npm run seed
```

### Running the Server

Development mode (with nodemon):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Event Types

- `GET /api/event-types` - Get all event types
- `GET /api/event-types/:slug` - Get event type by slug
- `POST /api/event-types` - Create new event type
- `PUT /api/event-types/:id` - Update event type
- `DELETE /api/event-types/:id` - Delete event type

### Availability

- `GET /api/availability` - Get availability settings
- `POST /api/availability` - Set availability settings

### Bookings

- `GET /api/bookings` - Get all bookings (query: `?status=upcoming` or `?status=past`)
- `GET /api/bookings/slots/:slug?date=YYYY-MM-DD` - Get available time slots
- `POST /api/bookings/:slug` - Create a booking
- `PUT /api/bookings/:id/cancel` - Cancel a booking

### Health Check

- `GET /api/health` - API health check

## Database Schema

The database includes the following collections:

- **users** - User accounts (default admin user)
- **eventtypes** - Event type configurations
- **availabilities** - Availability schedule settings
- **bookings** - Booking records

### Models

All models are defined in the `models/` directory:
- `User.js` - User model
- `EventType.js` - Event type model
- `Availability.js` - Availability model
- `Booking.js` - Booking model

## Features

See [FEATURE_CHECKLIST.md](./FEATURE_CHECKLIST.md) for a complete feature checklist.

### Core Features (All Implemented) ✅

1. **Event Types Management**
   - Create, edit, delete event types
   - Unique slug-based public booking links
   - Active/inactive status toggle

2. **Availability Settings**
   - Set available days of the week
   - Configure time slots for each day
   - Timezone configuration

3. **Public Booking Page**
   - Calendar date selection
   - Available time slots display
   - Booking form (name, email)
   - Double booking prevention
   - Booking confirmation

4. **Bookings Dashboard**
   - View upcoming and past bookings
   - Cancel bookings
   - Filter by status

## Assumptions

- A default admin user is created during seeding (email: `admin@example.com`)
- All admin operations assume a logged-in default user
- Timezone handling uses MongoDB Date type
- Double booking prevention is enforced at the database level with unique indexes

## Documentation

- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Detailed MongoDB setup guide
- [FEATURE_CHECKLIST.md](./FEATURE_CHECKLIST.md) - Complete feature checklist

## Migration Notes

This project was migrated from PostgreSQL to MongoDB. The API endpoints and response formats remain unchanged, ensuring frontend compatibility without modifications.
