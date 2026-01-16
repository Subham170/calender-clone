# Supabase Database Setup Guide

This guide walks you through creating a Supabase database and connecting your backend application to it.

## Step 1: Create a Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign in"** if you already have an account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: Choose a name (e.g., "calendar-clone")
   - **Database Password**: Create a strong password (save this, you'll need it!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for development

5. Click **"Create new project"**
6. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Get Your Database Connection String

Once your project is ready:

1. Go to your Supabase project dashboard
2. Click on **"Settings"** (gear icon) in the left sidebar
3. Click on **"Database"** in the settings menu
4. Scroll down to **"Connection string"** section
5. Select **"Connection pooling"** or **"Direct connection"** tab:
   - **Connection pooling** (recommended for serverless/apps): Uses `pgbouncer` pooler
   - **Direct connection** (recommended for this backend): Direct PostgreSQL connection
6. Copy the connection string. It will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 3: Format Your Connection String

Your connection string should look like this:
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with the password you set when creating the project
- If your password contains special characters like `@`, `#`, `%`, etc., they need to be URL-encoded:
  - `@` → `%40`
  - `#` → `%23`
  - `%` → `%25`
  - `&` → `%26`
  - `/` → `%2F`
  - `?` → `%3F`
  - `=` → `%3D`
  - ` ` (space) → `%20`

**Example:**
If your password is `Iliboned@1707`, the connection string should be:
```
postgresql://postgres:Iliboned%401707@db.wprdenbhnvhiysnnzgwq.supabase.co:5432/postgres
```

## Step 4: Configure Your Backend

1. Create a `.env` file in `backend_calender-clone/` directory (if it doesn't exist)

2. Add your connection string to the `.env` file:
   ```env
   DB_URL=postgresql://postgres:YOUR_ENCODED_PASSWORD@db.xxxxx.supabase.co:5432/postgres
   PORT=5000
   ```

   **Example:**
   ```env
   DB_URL=postgresql://postgres:Iliboned%401707@db.wprdenbhnvhiysnnzgwq.supabase.co:5432/postgres
   PORT=5000
   ```

3. **Alternative:** You can also use individual variables (if you prefer):
   ```env
   DB_HOST=db.xxxxx.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=YOUR_PASSWORD
   PORT=5000
   ```

## Step 5: Initialize Your Database

1. Make sure your `.env` file is configured correctly
2. Run the database initialization script:
   ```bash
   cd backend_calender-clone
   node database/init.js
   ```

3. This will create all the necessary tables in your Supabase database

4. (Optional) Seed the database with sample data:
   ```bash
   npm run seed
   ```

## Step 6: Test the Connection

1. Start your server:
   ```bash
   npm run dev
   ```

2. You should see:
   ```
   🔗 Connecting to Supabase: db.xxxxx.supabase.co:5432/postgres
   Connected to PostgreSQL database
   Server is running on port 5000
   ```

3. If you see connection errors:
   - Verify your `.env` file exists and has the correct `DB_URL`
   - Check that your password is URL-encoded if it contains special characters
   - Ensure your Supabase project is active (not paused)
   - Verify your IP is not blocked (Supabase allows all IPs by default)

## Troubleshooting

### Error: "connect ETIMEDOUT"
- **Cause**: Wrong host or connection string not parsed correctly
- **Solution**: 
  - Double-check your `DB_URL` format
  - Make sure you're using the direct connection string (not connection pooling URI)
  - Verify the host starts with `db.` not `aws-0-us-`

### Error: "password authentication failed"
- **Cause**: Incorrect password or username
- **Solution**: 
  - Verify your password in Supabase dashboard (Settings → Database → Database password)
  - Make sure special characters are URL-encoded
  - Check that `postgres` is the correct user (it should be for Supabase)

### Error: "SSL connection required"
- **Cause**: Missing SSL configuration
- **Solution**: The code already includes SSL configuration. Make sure you're using the updated `db.js` file

### Password with Special Characters
If your password contains special characters, you have two options:

**Option 1: URL-encode the password (Recommended)**
```env
# Password: Iliboned@1707
DB_URL=postgresql://postgres:Iliboned%401707@db.xxxxx.supabase.co:5432/postgres
```

**Option 2: Use individual variables (no encoding needed)**
```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=Iliboned@1707
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Database Connection](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
