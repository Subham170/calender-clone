# Troubleshooting Guide

## Backend and Frontend Connection Issues

### Common Issues and Solutions

### 1. "Failed to create event type" Error

**Possible Causes:**

#### A. Backend Server Not Running

- **Check:** Open `http://localhost:5000/api/health` in your browser
- **Solution:**
  ```bash
  cd backend_calender-clone
  npm run dev
  ```
  You should see: `Server is running on port 5000`

#### B. Database Not Initialized

- **Check:** Look for database connection errors in backend console
- **Solution:**
  ```bash
  cd backend_calender-clone
  # Make sure PostgreSQL is running
  createdb calendar_clone  # If database doesn't exist
  node database/init.js   # Initialize schema
  npm run seed            # Seed sample data
  ```

#### C. CORS Issues

- **Check:** Open browser DevTools → Network tab → Check for CORS errors
- **Solution:** The backend CORS is configured to allow `http://localhost:3000`. Make sure:
  - Frontend is running on `localhost:3000`
  - Backend is running on `localhost:5000`
  - No firewall blocking the connection

#### D. Environment Variables Not Set

- **Check:** Backend `.env` file exists and has correct values
- **Solution:**
  ```bash
  cd backend_calender-clone
  cp .env.example .env
  # Edit .env with your database credentials
  ```

#### E. Port Mismatch

- **Check:** Frontend API URL matches backend port
- **Solution:**
  - Backend default: `http://localhost:5000`
  - Frontend `.env.local` should have: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
  - Or frontend will default to `http://localhost:5000/api`

### 2. Database Connection Errors

**Error:** `Error: connect ECONNREFUSED` or `password authentication failed`

**Solutions:**

1. **PostgreSQL Not Running:**

   ```bash
   # Windows (if installed as service)
   net start postgresql-x64-XX

   # Or start PostgreSQL manually
   ```

2. **Wrong Credentials:**

   - Check `backend_calender-clone/.env` file
   - Verify `DB_USER`, `DB_PASSWORD`, `DB_NAME` match your PostgreSQL setup

3. **Database Doesn't Exist:**
   ```bash
   createdb calendar_clone
   ```

### 3. Module Not Found Errors (ES Modules)

**Error:** `Cannot find module '...'`

**Solution:** Make sure all imports have `.js` extension:

```javascript
// ✅ Correct
import something from "./file.js";

// ❌ Wrong
import something from "./file";
```

### 4. Frontend Can't Connect to Backend

**Checklist:**

1. ✅ Backend server is running (`npm run dev` in backend folder)
2. ✅ Backend shows: `Server is running on port 5000`
3. ✅ Frontend `.env.local` has correct API URL
4. ✅ No firewall blocking ports 3000 or 5000
5. ✅ Browser console shows connection errors (check Network tab)

**Test Connection:**

```bash
# In browser, open:
http://localhost:5000/api/health

# Should return:
{"status":"OK","message":"Calendar Clone API is running"}
```

### 5. Database Schema Errors

**Error:** `relation "users" does not exist` or similar

**Solution:**

```bash
cd backend_calender-clone
node database/init.js
npm run seed
```

### Quick Debug Steps

1. **Check Backend:**

   ```bash
   cd backend_calender-clone
   npm run dev
   # Should see: "Server is running on port 5000"
   ```

2. **Check Database:**

   ```bash
   psql -U postgres -d calendar_clone -c "SELECT COUNT(*) FROM users;"
   # Should return a number > 0
   ```

3. **Check Frontend:**

   ```bash
   cd calender-clone
   npm run dev
   # Should see: "Ready on http://localhost:3000"
   ```

4. **Test API:**

   - Open browser: `http://localhost:5000/api/health`
   - Should see JSON response

5. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab for failed requests

### Still Having Issues?

1. Check backend console logs for detailed error messages
2. Check browser console for frontend errors
3. Verify all dependencies are installed:

   ```bash
   # Backend
   cd backend_calender-clone
   npm install

   # Frontend
   cd calender-clone
   npm install
   ```

4. Make sure you're using the correct Node.js version (v18+)
