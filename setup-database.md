# ChitBox Database Setup Guide

## 🚀 Quick Start Options

### Option 1: Docker (Easiest - Recommended for Development)

```bash
# Start PostgreSQL with Docker
docker-compose up postgres -d

# Check if it's running
docker ps

# Connect to database
docker exec -it chitbox_postgres_1 psql -U chitbox_user -d chitbox
```

**Environment variables for Docker:**
```env
DATABASE_URL=postgresql://chitbox_user:chitbox_password@localhost:5432/chitbox
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chitbox
DB_USER=chitbox_user
DB_PASSWORD=chitbox_password
```

### Option 2: Local PostgreSQL Installation

**Windows:**
```bash
# Download from: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Start service
net start postgresql-x64-13
```

**macOS:**
```bash
# Install with Homebrew
brew install postgresql
brew services start postgresql

# Or use Postgres.app from: https://postgresapp.com/
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Create database:**
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE chitbox;
CREATE USER chitbox_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE chitbox TO chitbox_user;
\q
```

### Option 3: Cloud PostgreSQL (Production Ready)

#### Supabase (Free tier available)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Use these values:

```env
# Supabase connection
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DB_HOST=db.[PROJECT-REF].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR-PASSWORD]
```

#### Railway
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy connection details from Variables

#### Neon (Serverless)
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard

## 🔧 Database Schema Setup

After setting up PostgreSQL, run the schema:

```bash
# If using local PostgreSQL
psql -U chitbox_user -d chitbox -f backend/src/database/schema.sql

# If using Docker
docker exec -i chitbox_postgres_1 psql -U chitbox_user -d chitbox < backend/src/database/schema.sql

# If using cloud (replace with your connection details)
psql "postgresql://username:password@host:port/database" -f backend/src/database/schema.sql
```

## 🧪 Test Database Connection

Create a test script to verify your connection:

```bash
# Create test file
cat > test-db.js << 'EOF'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully!');
    console.log('Current time:', result.rows[0].now);
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF

# Run test
node test-db.js
```

## 🔒 Production Security Checklist

### Environment Variables
- [ ] Use strong, unique passwords
- [ ] Store secrets in environment variables (not code)
- [ ] Use different credentials for dev/staging/production
- [ ] Rotate passwords regularly

### Database Security
- [ ] Enable SSL connections in production
- [ ] Restrict database access by IP
- [ ] Use connection pooling
- [ ] Regular backups
- [ ] Monitor database performance

### Application Security
- [ ] Use HTTPS in production
- [ ] Validate all inputs
- [ ] Use parameterized queries (already implemented)
- [ ] Regular security updates

## 🚀 Deployment Examples

### Vercel + Supabase
```env
# Vercel environment variables
DATABASE_URL=postgresql://postgres:password@db.abc123.supabase.co:5432/postgres
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
```

### Railway
```env
# Railway automatically provides DATABASE_URL
# Just add your other environment variables
NODE_ENV=production
JWT_SECRET=your-production-secret
```

### Docker Production
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: chitbox
      POSTGRES_USER: chitbox_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://chitbox_user:${DB_PASSWORD}@postgres:5432/chitbox
      NODE_ENV: production
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

## 🆘 Troubleshooting

### Common Issues

**Connection refused:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS
net start postgresql-x64-13  # Windows
```

**Authentication failed:**
```bash
# Check user permissions
psql -U postgres -c "\du"

# Reset password
psql -U postgres -c "ALTER USER chitbox_user PASSWORD 'new_password';"
```

**Database doesn't exist:**
```sql
-- Create database
psql -U postgres -c "CREATE DATABASE chitbox;"
```

**Permission denied:**
```sql
-- Grant permissions
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE chitbox TO chitbox_user;"
```

## 📊 Monitoring & Maintenance

### Database Monitoring
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('chitbox'));

-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'chitbox';

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Backup Commands
```bash
# Create backup
pg_dump -U chitbox_user -h localhost chitbox > backup.sql

# Restore backup
psql -U chitbox_user -h localhost chitbox < backup.sql

# Cloud backup (Supabase)
# Use Supabase dashboard or CLI
```

---

## 🎯 Recommended Setup

**For Development:** Use Docker (easiest setup)
**For Production:** Use Supabase or Railway (managed, reliable)

**ChitBox is now ready with a production-grade database setup!** 🚀
