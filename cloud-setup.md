# ChitBox Cloud Database Setup (No Docker Required)

## 🚀 Quick Setup with Supabase (Free)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Create a new project

### Step 2: Get Database Credentials
1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Copy the connection string (it looks like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Step 3: Update Your Environment File
Create `backend/.env` with these values:

```env
# Database Configuration (from Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DB_HOST=db.[PROJECT-REF].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR-PASSWORD]

# Server Configuration
PORT=3001
NODE_ENV=development

# SMTP Configuration (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ChitBox <your-email@gmail.com>

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key-here
```

### Step 4: Set Up Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy and paste the contents of `backend/src/database/schema.sql`
4. Click **Run** to execute the schema

### Step 5: Test Your Setup
```bash
# Test database connection
npm run test:db

# Start your application
npm run dev
```

## 🎯 Alternative Cloud Providers

### Railway (Also Free)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Railway automatically provides `DATABASE_URL`
5. Copy the connection string to your `.env` file

### Neon (Serverless PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard
4. Use in your `.env` file

## ✅ Benefits of Cloud Setup
- ✅ No Docker installation required
- ✅ Always available (24/7)
- ✅ Automatic backups
- ✅ SSL encryption
- ✅ Easy to scale
- ✅ Free tiers available
- ✅ Production ready

## 🔧 Troubleshooting

### Connection Issues
```bash
# Test your connection string
psql "postgresql://postgres:password@host:port/database"

# Or use the test script
npm run test:db
```

### Common Issues
1. **Wrong password**: Double-check your Supabase password
2. **Network issues**: Check your internet connection
3. **SSL required**: Add `?sslmode=require` to connection string
4. **Firewall**: Some corporate networks block database ports

### SSL Connection (if needed)
If you get SSL errors, add this to your connection string:
```
postgresql://postgres:password@host:port/database?sslmode=require
```

## 🚀 Next Steps
1. Set up your cloud database
2. Update your `.env` file
3. Run `npm run test:db` to verify
4. Start your app with `npm run dev`

**You're all set! No Docker required!** 🎉
