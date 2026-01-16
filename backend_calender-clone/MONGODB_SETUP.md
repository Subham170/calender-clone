# MongoDB Setup Guide

This guide explains how to set up and use MongoDB for the Calendar Clone backend.

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** and create an account
3. Choose the **Free Tier** (M0) - Perfect for development

### Step 2: Create a Cluster
1. Click **"Build a Database"**
2. Select **"Free"** tier
3. Choose your preferred **Cloud Provider** and **Region**
4. Give your cluster a name (e.g., "calendar-clone")
5. Click **"Create"**
6. Wait 3-5 minutes for cluster to be created

### Step 3: Configure Network Access
1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development) or add your specific IP
4. Click **"Confirm"**

### Step 4: Create Database User
1. Click **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Enter username and password (save these!)
5. Set **Database User Privileges** to **"Atlas admin"** (or **"Read and write to any database"**)
6. Click **"Add User"**

### Step 5: Get Connection String
1. Click **"Databases"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Choose **"Node.js"** as driver and version **"5.5 or later"**
5. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
6. Replace `<username>` and `<password>` with your database user credentials
7. Optionally add database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/calendar_clone?retryWrites=true&w=majority`

### Step 6: Configure Backend
1. Create `.env` file in `backend_calender-clone/` directory:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/calendar_clone?retryWrites=true&w=majority
   PORT=5000
   ```

2. Install dependencies (if not already done):
   ```bash
   cd backend_calender-clone
   npm install
   ```

3. Initialize the database:
   ```bash
   node database/init.js
   ```

4. Seed the database:
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## Option 2: Local MongoDB Installation

### Install MongoDB Community Edition

**Windows:**
1. Download MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose **"Complete"** installation
4. Install as a Windows Service (recommended)
5. Install MongoDB Compass (GUI tool) - optional but helpful

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Configure Backend for Local MongoDB

1. Create `.env` file in `backend_calender-clone/` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/calendar_clone
   PORT=5000
   ```

2. Start MongoDB (if not running as a service):
   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   # or
   mongod --dbpath /path/to/data
   ```

3. Install dependencies:
   ```bash
   cd backend_calender-clone
   npm install
   ```

4. Initialize the database:
   ```bash
   node database/init.js
   ```

5. Seed the database:
   ```bash
   npm run seed
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

## Connection String Format

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

### Local MongoDB
```
mongodb://localhost:27017/database_name
```

### With Authentication (Local)
```
mongodb://username:password@localhost:27017/database_name?authSource=admin
```

## Environment Variables

Create a `.env` file in `backend_calender-clone/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/calendar_clone?retryWrites=true&w=majority

# Server Port
PORT=5000

# Optional: Legacy DB_URL (will be used if MONGODB_URI is not set)
# DB_URL=mongodb://localhost:27017/calendar_clone
```

## Verify Connection

After starting the server, you should see:
```
🔗 Connecting to MongoDB: mongodb+srv://***:***@...
✅ Connected to MongoDB database
Server is running on port 5000
```

## Troubleshooting

### Error: "MongoServerError: bad auth"
- **Cause**: Incorrect username or password
- **Solution**: Double-check your database user credentials in MongoDB Atlas

### Error: "MongoNetworkError: connect ECONNREFUSED"
- **Cause**: MongoDB server not running (for local) or network access not configured (for Atlas)
- **Solution**: 
  - Local: Start MongoDB service
  - Atlas: Add your IP to Network Access whitelist

### Error: "MongoServerError: IP not whitelisted"
- **Cause**: Your IP address is not in the MongoDB Atlas whitelist
- **Solution**: Go to Atlas → Network Access → Add IP Address

### Connection String Issues
- Make sure to URL-encode special characters in password
- Replace `<username>` and `<password>` placeholders
- Check that connection string starts with `mongodb://` or `mongodb+srv://`

## Database Collections

After seeding, your database will have:
- **users** - Default admin user
- **eventtypes** - Sample event types (15min, 30min, 60min)
- **availabilities** - Availability slots (Mon-Fri, 9 AM - 5 PM)
- **bookings** - Sample bookings

## Using MongoDB Compass (GUI)

1. Download from [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. Connect using your connection string
3. Browse collections, documents, and run queries

## Migration from PostgreSQL

All database operations have been migrated from PostgreSQL to MongoDB:
- ✅ Models converted to Mongoose schemas
- ✅ Controllers updated to use MongoDB queries
- ✅ Indexes configured for performance
- ✅ Unique constraints enforced (slugs, double booking prevention)

The API endpoints and response formats remain the same, so the frontend requires no changes.
