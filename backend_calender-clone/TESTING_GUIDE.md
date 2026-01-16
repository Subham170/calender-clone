# Testing Guide - Calendar Clone

This guide provides step-by-step instructions for testing all features of the Calendar Clone application.

## Prerequisites

1. **Backend server running:**
   ```bash
   cd backend_calender-clone
   npm install
   # Set up MongoDB (see MONGODB_SETUP.md)
   node database/init.js
   npm run seed
   npm run dev
   ```
   Server should be running on `http://localhost:5000`

2. **Frontend server running:**
   ```bash
   cd calender-clone
   npm install
   npm run dev
   ```
   Frontend should be running on `http://localhost:3000`

3. **Tools for API testing (optional):**
   - Postman
   - Thunder Client (VS Code extension)
   - curl (command line)
   - Browser DevTools

## Testing Methods

### Method 1: Frontend UI Testing (Recommended)
Test features through the web interface.

### Method 2: API Testing
Test API endpoints directly using tools like Postman or curl.

---

## Feature 1: Event Types Management

### Test 1.1: View All Event Types

**Frontend:**
1. Open `http://localhost:3000`
2. You should see the Event Types dashboard
3. Verify sample event types are displayed (15min, 30min, 60min from seed data)

**API:**
```bash
curl http://localhost:5000/api/event-types
```

**Expected Response:**
```json
[
  {
    "id": "...",
    "title": "30 Min Meeting",
    "description": "A quick 30-minute meeting",
    "duration": 30,
    "slug": "30min",
    "is_active": true
  },
  ...
]
```

### Test 1.2: Create New Event Type

**Frontend:**
1. Click **"New"** button on Event Types page
2. Fill in the form:
   - Title: "45 Min Consultation"
   - Description: "A 45-minute consultation call"
   - Duration: 45
   - Slug: "45min" (auto-generated from title)
3. Click **"Create"**
4. Verify new event type appears in the list

**API:**
```bash
curl -X POST http://localhost:5000/api/event-types \
  -H "Content-Type: application/json" \
  -d '{
    "title": "45 Min Consultation",
    "description": "A 45-minute consultation call",
    "duration": 45,
    "slug": "45min"
  }'
```

**Expected Response:**
```json
{
  "id": "...",
  "title": "45 Min Consultation",
  "description": "A 45-minute consultation call",
  "duration": 45,
  "slug": "45min",
  "is_active": true
}
```

### Test 1.3: Edit Event Type

**Frontend:**
1. Click **"Edit"** on any event type
2. Modify title, description, or duration
3. Click **"Update"**
4. Verify changes are reflected

**API:**
```bash
curl -X PUT http://localhost:5000/api/event-types/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "duration": 60
  }'
```

### Test 1.4: Toggle Event Type Active/Inactive

**Frontend:**
1. Toggle the switch on any event type
2. Verify the status changes
3. Inactive event types should not appear in public booking

**API:**
```bash
curl -X PUT http://localhost:5000/api/event-types/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

### Test 1.5: Delete Event Type

**Frontend:**
1. Click **"Delete"** on any event type
2. Confirm deletion
3. Verify event type is removed from list

**API:**
```bash
curl -X DELETE http://localhost:5000/api/event-types/{id}
```

**Expected Response:**
```json
{
  "message": "Event type deleted successfully"
}
```

### Test 1.6: Get Event Type by Slug & UI Actions

**Frontend:**
1. Click the **three-dot menu (⋮)** on any event type card
2. Test **"View public page"** / **"Open in new tab"**:
   - Opens booking page in new tab
   - Verify event details are displayed correctly
3. Test **"Copy public page link"** / **"Copy link"**:
   - Click the option
   - Paste in a new tab (Ctrl+V / Cmd+V)
   - Verify the URL is correct (e.g., `http://localhost:3000/book/30min`)
4. Test **"Edit"**:
   - Opens edit modal
   - Verify form is pre-filled with event type data
5. Test **"Delete"**:
   - Shows confirmation dialog
   - Verify deletion works after confirmation

**API:**
```bash
curl http://localhost:5000/api/event-types/30min
```

**Expected Response:**
```json
{
  "id": "...",
  "title": "30 Min Meeting",
  "description": "A quick 30-minute meeting",
  "duration": 30,
  "slug": "30min",
  "is_active": true,
  "user_name": "Admin User",
  "user_timezone": "America/New_York"
}
```

### Test 1.7: Unique Slug Validation

**API:**
```bash
# Try to create event type with existing slug
curl -X POST http://localhost:5000/api/event-types \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Duplicate",
    "duration": 30,
    "slug": "30min"
  }'
```

**Expected Response:** `400 Bad Request` with error message about duplicate slug

---

## Feature 2: Availability Settings

### Test 2.1: View Current Availability

**Frontend:**
1. Navigate to `/availability` page
2. Verify current availability settings are displayed
3. Should show Mon-Fri, 9 AM - 5 PM (from seed data)

**API:**
```bash
curl http://localhost:5000/api/availability
```

**Expected Response:**
```json
{
  "timezone": "America/New_York",
  "availability": [
    {
      "id": "...",
      "day_of_week": 1,
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "timezone": "America/New_York"
    },
    ...
  ]
}
```

### Test 2.2: Set Availability

**Frontend:**
1. Go to `/availability` page
2. Configure availability:
   - Select days (e.g., Monday, Wednesday, Friday)
   - Set time slots (e.g., 10:00 AM - 4:00 PM)
   - Set timezone (e.g., "America/New_York")
3. Click **"Save"**
4. Verify settings are saved

**API:**
```bash
curl -X POST http://localhost:5000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "timezone": "America/New_York",
    "availability": [
      {
        "day_of_week": 1,
        "start_time": "09:00:00",
        "end_time": "17:00:00"
      },
      {
        "day_of_week": 3,
        "start_time": "10:00:00",
        "end_time": "16:00:00"
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "timezone": "America/New_York",
  "availability": [...]
}
```

### Test 2.3: Update Timezone

**API:**
```bash
curl -X POST http://localhost:5000/api/availability \
  -H "Content-Type: application/json" \
  -d '{
    "timezone": "Europe/London",
    "availability": [...]
  }'
```

Verify timezone is updated in response.

---

## Feature 3: Public Booking Page

### Test 3.1: Access Booking Page

**Frontend:**
1. Navigate to `http://localhost:3000/book/30min` (or any event type slug)
2. Verify event details are displayed:
   - Event title
   - Duration
   - Description

**API:**
```bash
curl http://localhost:5000/api/event-types/30min
```

### Test 3.2: Select Date

**Frontend:**
1. On booking page, click a date in the calendar
2. Verify date is selected
3. Verify available time slots appear for that date

### Test 3.3: View Available Time Slots

**Frontend:**
1. Select a date (e.g., tomorrow, Monday-Friday)
2. Verify available time slots are displayed
3. Slots should be based on:
   - Event duration (e.g., 30 minutes)
   - Availability settings (e.g., 9 AM - 5 PM)
   - Existing bookings (booked slots should not appear)

**API:**
```bash
# Get slots for a specific date
curl "http://localhost:5000/api/bookings/slots/30min?date=2024-01-15"
```

**Expected Response:**
```json
{
  "availableSlots": [
    {
      "start": "2024-01-15T09:00:00.000Z",
      "end": "2024-01-15T09:30:00.000Z"
    },
    {
      "start": "2024-01-15T09:30:00.000Z",
      "end": "2024-01-15T10:00:00.000Z"
    },
    ...
  ]
}
```

### Test 3.4: Test No Availability

**API:**
```bash
# Try a date with no availability (e.g., Sunday)
curl "http://localhost:5000/api/bookings/slots/30min?date=2024-01-14"
```

**Expected Response:**
```json
{
  "availableSlots": []
}
```

### Test 3.5: Create Booking

**Frontend:**
1. Select a date
2. Select a time slot
3. Fill in booking form:
   - Name: "John Doe"
   - Email: "john@example.com"
4. Click **"Confirm"**
5. Verify booking confirmation page appears with:
   - Event details
   - Date and time
   - Booker information

**API:**
```bash
curl -X POST http://localhost:5000/api/bookings/30min \
  -H "Content-Type: application/json" \
  -d '{
    "booker_name": "John Doe",
    "booker_email": "john@example.com",
    "start_time": "2024-01-15T10:00:00.000Z"
  }'
```

**Expected Response:**
```json
{
  "id": "...",
  "event_type_id": "...",
  "booker_name": "John Doe",
  "booker_email": "john@example.com",
  "start_time": "2024-01-15T10:00:00.000Z",
  "end_time": "2024-01-15T10:30:00.000Z",
  "status": "confirmed",
  "event_title": "30 Min Meeting",
  "duration": 30
}
```

### Test 3.6: Double Booking Prevention

**API:**
```bash
# Create first booking
curl -X POST http://localhost:5000/api/bookings/30min \
  -H "Content-Type: application/json" \
  -d '{
    "booker_name": "John Doe",
    "booker_email": "john@example.com",
    "start_time": "2024-01-15T10:00:00.000Z"
  }'

# Try to create duplicate booking (same time slot)
curl -X POST http://localhost:5000/api/bookings/30min \
  -H "Content-Type: application/json" \
  -d '{
    "booker_name": "Jane Smith",
    "booker_email": "jane@example.com",
    "start_time": "2024-01-15T10:00:00.000Z"
  }'
```

**Expected Response:** `409 Conflict` with error: "This time slot is already booked"

**Frontend:**
1. Create a booking for a time slot
2. Try to create another booking for the same time slot
3. Verify error message appears

### Test 3.7: Verify Booked Slot Not Available

**API:**
```bash
# After creating a booking, check available slots
curl "http://localhost:5000/api/bookings/slots/30min?date=2024-01-15"
```

**Expected:** The booked time slot should not appear in available slots.

---

## Feature 4: Bookings Dashboard

### Test 4.1: View All Bookings

**Frontend:**
1. Navigate to `/bookings` page
2. Verify all bookings are displayed

**API:**
```bash
curl http://localhost:5000/api/bookings
```

**Expected Response:**
```json
[
  {
    "id": "...",
    "event_title": "30 Min Meeting",
    "booker_name": "John Doe",
    "booker_email": "john@example.com",
    "start_time": "2024-01-15T10:00:00.000Z",
    "end_time": "2024-01-15T10:30:00.000Z",
    "status": "confirmed"
  },
  ...
]
```

### Test 4.2: View Upcoming Bookings

**Frontend:**
1. On `/bookings` page, select **"Upcoming"** filter
2. Verify only future bookings are shown

**API:**
```bash
curl "http://localhost:5000/api/bookings?status=upcoming"
```

**Expected:** Only bookings with `start_time > now` and `status = 'confirmed'`

### Test 4.3: View Past Bookings

**Frontend:**
1. On `/bookings` page, select **"Past"** filter
2. Verify only past bookings are shown

**API:**
```bash
curl "http://localhost:5000/api/bookings?status=past"
```

**Expected:** Only bookings with `start_time < now` or `status = 'cancelled'`

### Test 4.4: Cancel Booking

**Frontend:**
1. On `/bookings` page, find an upcoming booking
2. Click **"Cancel"** button
3. Confirm cancellation
4. Verify booking status changes to "cancelled"
5. Verify cancelled booking appears in "Past" filter

**API:**
```bash
curl -X PUT http://localhost:5000/api/bookings/{id}/cancel
```

**Expected Response:**
```json
{
  "id": "...",
  "status": "cancelled",
  ...
}
```

### Test 4.5: Verify Cancelled Booking Slot Available Again

**API:**
```bash
# Cancel a booking
curl -X PUT http://localhost:5000/api/bookings/{id}/cancel

# Check available slots - the cancelled booking's slot should be available
curl "http://localhost:5000/api/bookings/slots/30min?date=2024-01-15"
```

**Expected:** The cancelled booking's time slot should appear in available slots.

---

## Integration Testing Scenarios

### Scenario 1: Complete Booking Flow

1. **Set Availability:**
   - Set Mon-Fri, 9 AM - 5 PM

2. **Create Event Type:**
   - Create "30 Min Meeting" with slug "30min"

3. **Create Booking:**
   - Book a slot for tomorrow at 10:00 AM
   - Verify booking appears in dashboard

4. **Verify Slot Not Available:**
   - Check available slots for same date/time
   - Verify booked slot doesn't appear

5. **Cancel Booking:**
   - Cancel the booking
   - Verify slot becomes available again

### Scenario 2: Multiple Event Types

1. Create multiple event types with different durations
2. Set availability
3. Create bookings for different event types
4. Verify each event type shows correct available slots based on duration

### Scenario 3: Inactive Event Type

1. Create an event type
2. Set it to inactive
3. Try to access booking page: `/book/{slug}`
4. Verify event type is not accessible (404 or inactive message)

---

## API Testing with Postman

### Import Collection

Create a Postman collection with these requests:

1. **GET** `/api/event-types` - Get all event types
2. **GET** `/api/event-types/:slug` - Get event type by slug
3. **POST** `/api/event-types` - Create event type
4. **PUT** `/api/event-types/:id` - Update event type
5. **DELETE** `/api/event-types/:id` - Delete event type
6. **GET** `/api/availability` - Get availability
7. **POST** `/api/availability` - Set availability
8. **GET** `/api/bookings` - Get all bookings
9. **GET** `/api/bookings?status=upcoming` - Get upcoming bookings
10. **GET** `/api/bookings?status=past` - Get past bookings
11. **GET** `/api/bookings/slots/:slug?date=YYYY-MM-DD` - Get available slots
12. **POST** `/api/bookings/:slug` - Create booking
13. **PUT** `/api/bookings/:id/cancel` - Cancel booking
14. **GET** `/api/health` - Health check

### Environment Variables

Create a Postman environment:
- `base_url`: `http://localhost:5000/api`
- `event_type_id`: (set after creating event type)
- `booking_id`: (set after creating booking)
- `slug`: `30min`

---

## Browser Testing Checklist

### Desktop (1920x1080)
- [ ] Event Types page displays correctly
- [ ] Event Type card dropdown menu works (View, Copy, Edit, Delete)
- [ ] Copy link functionality works (clipboard API)
- [ ] Availability page displays correctly
- [ ] Bookings page displays correctly
- [ ] Booking page displays correctly
- [ ] All modals/forms work
- [ ] Navigation works
- [ ] Sidebar footer actions work (View public page, Copy link, Settings)

### Tablet (768x1024)
- [ ] Responsive layout works
- [ ] All features accessible
- [ ] Forms are usable

### Mobile (375x667)
- [ ] Responsive layout works
- [ ] Calendar is usable
- [ ] Forms are usable
- [ ] Navigation menu works

---

## Error Testing

### Test Invalid Inputs

1. **Create Event Type without required fields:**
   ```bash
   curl -X POST http://localhost:5000/api/event-types \
     -H "Content-Type: application/json" \
     -d '{"title": "Test"}'
   ```
   **Expected:** 400 Bad Request

2. **Get non-existent event type:**
   ```bash
   curl http://localhost:5000/api/event-types/nonexistent
   ```
   **Expected:** 404 Not Found

3. **Create booking without required fields:**
   ```bash
   curl -X POST http://localhost:5000/api/bookings/30min \
     -H "Content-Type: application/json" \
     -d '{"booker_name": "John"}'
   ```
   **Expected:** 400 Bad Request

4. **Cancel non-existent booking:**
   ```bash
   curl -X PUT http://localhost:5000/api/bookings/000000000000000000000000/cancel
   ```
   **Expected:** 404 Not Found

---

## Performance Testing

### Test with Multiple Bookings

1. Create 10+ bookings for different dates
2. Verify dashboard loads quickly
3. Verify available slots calculation is fast

### Test with Multiple Event Types

1. Create 10+ event types
2. Verify event types list loads quickly
3. Verify filtering works

---

## Automated Testing (Optional)

### Using Jest

Create test files:
- `tests/eventTypes.test.js`
- `tests/availability.test.js`
- `tests/bookings.test.js`

Example:
```javascript
import request from 'supertest';
import app from '../server.js';

describe('Event Types API', () => {
  test('GET /api/event-types', async () => {
    const response = await request(app)
      .get('/api/event-types')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

---

## Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "Testing Event Types..."
curl -s $BASE_URL/event-types | jq '.[0]'

echo -e "\nTesting Availability..."
curl -s $BASE_URL/availability | jq '.timezone'

echo -e "\nTesting Bookings..."
curl -s "$BASE_URL/bookings?status=upcoming" | jq 'length'

echo -e "\nTesting Health..."
curl -s $BASE_URL/health | jq '.'

echo -e "\n✅ All tests completed!"
```

Run: `chmod +x test-api.sh && ./test-api.sh`

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** Check MongoDB is running and `MONGODB_URI` is correct in `.env`

### Issue: "No available slots"
**Solution:** 
- Check availability is set for the selected day
- Check date is in the future
- Check no bookings exist for that time

### Issue: "Event type not found"
**Solution:** 
- Verify slug is correct
- Check event type is active (`is_active: true`)

### Issue: "Double booking error"
**Solution:** This is expected behavior - the slot is already booked

---

## Success Criteria

✅ All API endpoints return correct status codes
✅ All CRUD operations work correctly
✅ Double booking prevention works
✅ Unique slug enforcement works
✅ Available slots calculation is correct
✅ Booking cancellation works
✅ Frontend displays all data correctly
✅ Responsive design works on all devices
✅ UI interactions work (dropdown menus, copy to clipboard, modals)
✅ Event type card actions work (View, Copy, Edit, Delete)
✅ Sidebar navigation and footer actions work

---

## Next Steps After Testing

1. Fix any bugs found
2. Add error handling improvements
3. Add input validation
4. Consider adding automated tests
5. Document any issues found
