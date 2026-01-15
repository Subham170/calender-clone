# Calendar Clone - Frontend

A Cal.com clone frontend built with Next.js, React, and TypeScript.

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **HTTP Client:** Axios

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Features

### Admin Dashboard

- **Event Types Management** (`/`)
  - Create, edit, delete event types
  - Toggle event type active/inactive status
  - Copy booking links
  - View all event types

- **Availability Settings** (`/availability`)
  - Set available days of the week
  - Configure time slots for each day
  - Set timezone preferences

- **Bookings Dashboard** (`/bookings`)
  - View upcoming bookings
  - View past bookings
  - Cancel bookings
  - Filter by status

### Public Booking Page

- **Public Booking Flow** (`/book/[slug]`)
  - Calendar view for date selection
  - Available time slots display
  - Booking form (name, email)
  - Booking confirmation page
  - Prevents double booking

## Project Structure

```
calender-clone/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Event types dashboard
│   ├── availability/     # Availability settings page
│   ├── bookings/          # Bookings dashboard
│   └── book/[slug]/       # Public booking page
├── components/             # React components
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── EventTypeCard.tsx  # Event type card component
├── lib/                   # Utility functions
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
└── public/                # Static assets
```

## Assumptions

- Backend API is running on `http://localhost:5000`
- Default admin user is logged in (no authentication required)
- All dates and times are handled in the user's timezone
- UI closely matches Cal.com's dark theme design

## UI Design

The application follows Cal.com's design patterns:
- Dark theme (`#0a0a0a` background)
- Sidebar navigation with user profile
- Card-based layouts
- Consistent spacing and typography
- Responsive design considerations
