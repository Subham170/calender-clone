# Backend - Calendar Clone API

Backend API for Cal.com clone built with Node.js, Express, and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Raw SQL queries with pg library

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your database credentials:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendar_clone
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-in-production
```

4. Create the PostgreSQL database:
```bash
createdb calendar_clone
```

5. Initialize the database schema:
```bash
node database/init.js
```

6. Seed the database with sample data:
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

## Database Schema

The database includes the following tables:
- `users` - User accounts (default admin user)
- `event_types` - Event type configurations
- `availability` - Availability schedule settings
- `bookings` - Booking records

## Assumptions

- A default admin user is created during seeding (email: `admin@example.com`)
- All admin operations assume a logged-in default user
- Timezone handling uses PostgreSQL TIMESTAMP type
- Double booking prevention is enforced at the database level
