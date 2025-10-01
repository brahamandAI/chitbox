# Local PostgreSQL Setup (No Docker)

## 🐘 Install PostgreSQL on Windows

### Method 1: Official Installer (Recommended)
1. Go to [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Download PostgreSQL 15+ installer
3. Run the installer and follow the setup wizard
4. Remember the password you set for the `postgres` user
5. Complete the installation

### Method 2: Using Chocolatey
```bash
# Install Chocolatey first (if not installed)
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install PostgreSQL
choco install postgresql

# Start PostgreSQL service
net start postgresql-x64-15
```

### Method 3: Using Scoop
```bash
# Install Scoop first (if not installed)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install PostgreSQL
scoop install postgresql

# Start PostgreSQL
postgres -D "C:\Users\%USERNAME%\scoop\apps\postgresql\current\data"
```

## 🔧 Set Up Database

### Step 1: Connect to PostgreSQL
```bash
# Open Command Prompt or PowerShell
psql -U postgres
```

### Step 2: Create Database and User
```sql
-- Create database
CREATE DATABASE chitbox;

-- Create user
CREATE USER chitbox_user WITH PASSWORD 'chitbox_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE chitbox TO chitbox_user;

-- Connect to the database
\c chitbox

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO chitbox_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO chitbox_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO chitbox_user;

-- Exit
\q
```

### Step 3: Set Up Schema
```bash
# Run the schema file
psql -U chitbox_user -d chitbox -f backend/src/database/schema.sql
```

### Step 4: Create Environment File
Create `backend/.env`:
```env
# Database Configuration
DATABASE_URL=postgresql://chitbox_user:chitbox_password@localhost:5432/chitbox
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chitbox
DB_USER=chitbox_user
DB_PASSWORD=chitbox_password

# Server Configuration
PORT=3001
NODE_ENV=development

# SMTP Configuration
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

### Step 5: Test Setup
```bash
# Test database connection
npm run test:db

# Start your application
npm run dev
```

## 🔧 Troubleshooting

### PostgreSQL Not Starting
```bash
# Check if PostgreSQL service is running
sc query postgresql-x64-15

# Start the service
net start postgresql-x64-15

# Or restart
net stop postgresql-x64-15
net start postgresql-x64-15
```

### Connection Issues
```bash
# Check if PostgreSQL is listening on port 5432
netstat -an | findstr 5432

# Test connection
psql -U postgres -h localhost -p 5432
```

### Permission Issues
```sql
-- If you get permission errors, run as postgres user
psql -U postgres

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE chitbox TO chitbox_user;
GRANT ALL ON SCHEMA public TO chitbox_user;
```

## 🎯 Quick Commands

```bash
# Start PostgreSQL
net start postgresql-x64-15

# Stop PostgreSQL
net stop postgresql-x64-15

# Connect to database
psql -U chitbox_user -d chitbox

# Test connection
npm run test:db
```

**You're all set with local PostgreSQL!** 🚀
