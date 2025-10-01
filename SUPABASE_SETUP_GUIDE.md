# Supabase Setup Guide for ChitBox

## 🎯 Overview
Configure ChitBox to use Supabase (PostgreSQL cloud database) instead of local PostgreSQL.

## 📋 Prerequisites
- ✅ Supabase account (free tier available)
- ✅ Supabase project created
- ✅ Database password set

## 🚀 Step 1: Create Supabase Project

### 1.1 Sign up/Login to Supabase
1. Go to [supabase.com](https://supabase.com)
2. Sign up or login to your account
3. Click "New Project"

### 1.2 Create New Project
1. **Organization**: Select your organization
2. **Project Name**: `chitbox-email`
3. **Database Password**: Generate a secure password (save it!)
4. **Region**: Choose closest to your location
5. **Pricing Plan**: Free tier is sufficient for development
6. Click "Create new project"

### 1.3 Wait for Project Setup
- Project creation takes 1-2 minutes
- You'll see "Setting up your project..." message
- Wait until status shows "Active"

## 🔧 Step 2: Get Connection Details

### 2.1 Access Project Settings
1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection Info**

### 2.2 Copy Connection Details
You'll see:
```
Host: db.[PROJECT-REF].supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: [YOUR-PASSWORD]
```

### 2.3 Build Connection String
Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

Example: `postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres`

## 📝 Step 3: Configure Environment

### 3.1 Create Environment File
```bash
cd backend
cp supabase.env.example .env
```

### 3.2 Update .env File
```env
# Method 1: Connection String (Recommended)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Method 2: Individual Parameters (Alternative)
DB_HOST=db.YOUR_PROJECT_REF.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR_PASSWORD
DB_SSL=true

# Server Configuration
PORT=3001
NODE_ENV=development

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ChitBox <your-email@gmail.com>

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key-here
```

## 🗄️ Step 4: Setup Database Schema

### 4.1 Run Database Setup
```bash
cd backend
node setup-supabase.js
```

This will:
- ✅ Test connection to Supabase
- ✅ Create all required tables
- ✅ Run migrations for user profile fields
- ✅ Verify database structure

### 4.2 Expected Output
```
🚀 Setting up ChitBox database in Supabase...
📊 Connection details:
   Host: db.abcdefghijklmnop.supabase.co
   Database: postgres
   User: postgres

🔍 Testing connection...
✅ Connection successful!
   Current time: 2024-01-15 10:30:45.123456+00
   PostgreSQL version: PostgreSQL

📋 Creating tables...
🔄 Running migrations...
📊 Verifying database structure...
✅ Tables created:
   - attachments
   - folders
   - mail_messages
   - mail_threads
   - user_sessions
   - users

👥 Users table structure:
   - id: integer
   - email: character varying
   - name: character varying
   - password_hash: character varying
   - avatar_url: character varying
   - age: integer
   - profession: character varying
   - interests: text[]
   - country: character varying
   - newsletter: boolean
   - created_at: timestamp without time zone
   - updated_at: timestamp without time zone

🎯 Setup completed successfully!
```

## 🧪 Step 5: Test Your Setup

### 5.1 Start Backend
```bash
cd backend
npm run dev
```

### 5.2 Expected Output
```
🚀 Starting ChitBox backend server...
✅ Database connection successful
🌐 Server running on http://localhost:3001
📧 SMTP server configured
🔐 JWT authentication ready
```

### 5.3 Test Database Connection
```bash
# Test connection script
node -e "
const { testConnection } = require('./setup-supabase.js');
testConnection().then(connected => {
  console.log(connected ? '✅ Connection working!' : '❌ Connection failed');
  process.exit(connected ? 0 : 1);
});
"
```

## 🎯 Step 6: Verify in Supabase Dashboard

### 6.1 Check Tables
1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `users` (with profile fields)
   - `folders`
   - `mail_threads`
   - `mail_messages`
   - `attachments`
   - `user_sessions`

### 6.2 Test User Registration
1. Start your frontend: `cd frontend && npm run dev`
2. Go to `http://localhost:3000`
3. Click "Create one now" to register
4. Fill out the registration form
5. Check Supabase **Table Editor** → `users` table
6. You should see your new user record

## 🚀 Step 7: Start Full Application

### 7.1 Start Backend
```bash
cd backend
npm run dev
```

### 7.2 Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

### 7.3 Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Supabase Dashboard**: https://supabase.com/dashboard

## 🔍 Troubleshooting

### Connection Issues
```bash
# Test connection manually
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT NOW()').then(res => {
  console.log('✅ Connected:', res.rows[0]);
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
"
```

### Common Issues

#### 1. **SSL Connection Error**
```env
# Add to .env
DB_SSL=true
```

#### 2. **Connection String Format**
Make sure your connection string follows this format:
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

#### 3. **Password Issues**
- Ensure password doesn't contain special characters that need URL encoding
- Use a simple alphanumeric password for development

#### 4. **Project Not Active**
- Check Supabase dashboard
- Wait for project to be fully active
- Try refreshing the connection

### Useful Commands
```bash
# Test database connection
node setup-supabase.js

# Reset database (WARNING: deletes all data)
# In Supabase dashboard: Settings → Database → Reset database

# View logs
# In Supabase dashboard: Logs → Database logs

# Monitor usage
# In Supabase dashboard: Settings → Usage
```

## 📊 Supabase Features You Can Use

### 1. **Real-time Subscriptions**
```javascript
// Subscribe to user changes
const subscription = supabase
  .channel('users')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'users' },
    (payload) => console.log('User changed:', payload)
  )
  .subscribe();
```

### 2. **Row Level Security (RLS)**
```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
```

### 3. **Database Functions**
```sql
-- Create function for email search
CREATE OR REPLACE FUNCTION search_emails(search_term TEXT)
RETURNS TABLE(id INTEGER, subject TEXT, preview TEXT)
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.subject, m.body_text
  FROM mail_messages m
  WHERE m.body_text ILIKE '%' || search_term || '%'
  OR m.subject ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql;
```

### 4. **Backups**
- Automatic daily backups (paid plans)
- Manual backups via dashboard
- Point-in-time recovery

## 🎉 Success!

Your ChitBox application is now running on Supabase! 

### What's Working:
- ✅ Cloud PostgreSQL database
- ✅ User authentication and registration
- ✅ Email management features
- ✅ AI-powered features
- ✅ Real-time capabilities (if needed)
- ✅ Automatic backups
- ✅ Scalable infrastructure

### Next Steps:
1. **Deploy to VPS**: Use the VPS deployment guide
2. **Setup SMTP**: Configure your custom SMTP server
3. **Add Features**: Extend with more AI capabilities
4. **Monitor**: Use Supabase dashboard for monitoring

---

**🎯 Your ChitBox email application is now cloud-ready!**
