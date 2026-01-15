# Calendar Clone - Cal.com Assignment

A full-stack scheduling and booking web application that replicates Cal.com's design and functionality.

## Project Structure

```
.
├── backend_calender-clone/    # Backend API (Node.js + Express + PostgreSQL)
└── calender-clone/            # Frontend (Next.js + React + TypeScript)
```

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Raw SQL queries with pg library

### Frontend
- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **HTTP Client:** Axios

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend_calender-clone
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calendar_clone
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-in-production
```

5. Create the PostgreSQL database:
```bash
createdb calendar_clone
```

6. Initialize the database schema:
```bash
node database/init.js
```

7. Seed the database with sample data:
```bash
npm run seed
```

8. Start the backend server:
```bash
npm run dev
```

The backend API will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd calender-clone
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features Implemented

### Core Features (Must Have)

✅ **Event Types Management**
- Create event types with title, description, duration, and URL slug
- Edit and delete existing event types
- List all event types on a dashboard
- Each event type has a unique public booking link
- Toggle event types active/inactive

✅ **Availability Settings**
- Set available days of the week (Monday to Friday by default)
- Set available time slots for each day (e.g., 9:00 AM - 5:00 PM)
- Set timezone for availability schedule

✅ **Public Booking Page**
- Calendar view for users to select a date
- Display available time slots based on configured availability
- Booking form to collect booker's name and email
- Prevents double booking of the same time slot
- Booking confirmation page displaying event details

✅ **Bookings Dashboard**
- View upcoming bookings
- View past bookings
- Cancel existing bookings
- Filter bookings by status

### Bonus Features (Good to Have)

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark theme UI matching Cal.com's design
- ✅ Clean and modern user interface

## Database Schema

The database includes the following tables:

- **users** - User accounts (default admin user)
- **event_types** - Event type configurations
- **availability** - Availability schedule settings
- **bookings** - Booking records

See `backend_calender-clone/database/schema.sql` for the complete schema.

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

## Assumptions

1. **No Authentication Required**: A default admin user is assumed to be logged in for admin operations. The public booking page is accessible without login.

2. **Default User**: The database is seeded with a default admin user (email: `admin@example.com`).

3. **Timezone Handling**: All times are stored in UTC in the database. The frontend displays times in the configured timezone.

4. **Double Booking Prevention**: Enforced at both the database level (unique constraint) and application level.

5. **Sample Data**: The database is seeded with:
   - 3 sample event types (15min, 30min, 60min)
   - Availability set for Monday-Friday, 9 AM - 5 PM
   - 2 sample bookings

## UI Design

The application closely follows Cal.com's design patterns:
- Dark theme with `#0a0a0a` background
- Sidebar navigation with user profile
- Card-based layouts
- Consistent spacing and typography
- Modern, clean interface

## Deployment

### Backend Deployment

The backend can be deployed to services like:
- Railway
- Render
- Heroku
- AWS EC2
- DigitalOcean

Make sure to:
1. Set environment variables in your hosting platform
2. Update database connection string
3. Run database migrations and seeding

### Frontend Deployment

The frontend can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- Render

Make sure to:
1. Set `NEXT_PUBLIC_API_URL` environment variable
2. Build the application: `npm run build`

## Evaluation Criteria Coverage

✅ **Functionality**: All core features working correctly
✅ **UI/UX**: Visual similarity to Cal.com's design and UX patterns
✅ **Database Design**: Well-structured schema with proper relationships
✅ **Code Quality**: Clean, readable, and well-organized code
✅ **Code Modularity**: Proper separation of concerns, reusable components
✅ **Code Understanding**: Well-commented code ready for explanation

## License

This project is created for educational purposes as part of an assignment.
