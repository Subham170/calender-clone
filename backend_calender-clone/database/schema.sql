-- Database Schema for Cal.com Clone

-- Users table (for admin - default user)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    timezone VARCHAR(100) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Types table
CREATE TABLE IF NOT EXISTS event_types (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability table (stores availability settings)
CREATE TABLE IF NOT EXISTS availability (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day_of_week, start_time, end_time)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
    booker_name VARCHAR(255) NOT NULL,
    booker_email VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_type_id, start_time) -- Prevent double booking
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_types_user_id ON event_types(user_id);
CREATE INDEX IF NOT EXISTS idx_event_types_slug ON event_types(slug);
CREATE INDEX IF NOT EXISTS idx_availability_user_id ON availability(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_type_id ON bookings(event_type_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
