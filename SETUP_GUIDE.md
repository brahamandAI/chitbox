# ChitBox Setup Guide with AI Features

## 🚀 Quick Start

### 1. Environment Setup

**Backend Environment (`backend/.env`):**
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/chitbox
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chitbox
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# Server Configuration
PORT=3001
NODE_ENV=development

# SMTP Configuration (for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ChitBox <your-email@gmail.com>

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# AI Configuration (Optional - for AI features)
OPENAI_API_KEY=your-openai-api-key-here
```

**Frontend Environment (`frontend/.env.local`):**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME=ChitBox
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Database Setup

1. **Install PostgreSQL** (if not already installed)
2. **Create Database:**
   ```sql
   CREATE DATABASE chitbox;
   CREATE USER chitbox_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE chitbox TO chitbox_user;
   ```
3. **Run the schema:**
   ```bash
   psql -d chitbox -f backend/src/database/schema.sql
   ```

### 3. Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api

## 🤖 AI Features Setup

### OpenAI API Key (Optional)

To enable AI features, you need an OpenAI API key:

1. **Get API Key**: Visit https://platform.openai.com/api-keys
2. **Add to Backend**: Add your key to `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

### AI Features Available

#### ✅ Smart Compose
- **What it does**: Auto-completes sentences as you type
- **Where**: In the compose email modal
- **How it works**: Analyzes your text and suggests natural completions
- **Fallback**: Works without API key using basic suggestions

#### ✅ Smart Reply
- **What it does**: Generates quick reply suggestions
- **Where**: Below each email message
- **How it works**: Analyzes email content and suggests appropriate responses
- **Fallback**: Uses predefined quick replies without API key

#### ✅ Email Summarization
- **What it does**: Creates TL;DR summaries of emails
- **Where**: In email thread view
- **How it works**: Extracts key points and action items
- **Fallback**: Basic text truncation without API key

#### ✅ Thread Summarization
- **What it does**: Summarizes entire email conversations
- **Where**: In email thread view
- **How it works**: Analyzes all messages in a thread
- **Fallback**: Basic thread info without API key

## 📧 SMTP Setup (for sending emails)

### Gmail Setup
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use in .env**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### Other Email Providers
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Custom SMTP**: Use your provider's settings

## 🎯 Features Overview

### Core Email Features
- ✅ Send/Receive emails
- ✅ Draft management
- ✅ Email threading
- ✅ Folder organization (Inbox, Sent, Drafts, Spam, Trash)
- ✅ Search and filtering
- ✅ File attachments
- ✅ Real-time updates

### AI-Powered Features
- ✅ **Smart Compose**: Auto-complete sentences
- ✅ **Smart Reply**: Quick response suggestions
- ✅ **Email Summary**: TL;DR for individual emails
- ✅ **Thread Summary**: Conversation overview
- ✅ **Fallback Mode**: Works without AI API key

### UI/UX Features
- ✅ Gmail-like interface
- ✅ Responsive design
- ✅ Real-time notifications
- ✅ Rich text composition
- ✅ Smooth animations
- ✅ Loading states

## 🔧 Troubleshooting

### Database Issues
```bash
# Check PostgreSQL is running
pg_ctl status

# Test connection
psql -d chitbox -c "SELECT NOW();"
```

### SMTP Issues
- Verify email provider settings
- Check app password (not regular password)
- Ensure 2FA is enabled for Gmail

### AI Features Not Working
- Check OpenAI API key is valid
- Verify API key has credits
- Check console for error messages
- Features work in fallback mode without API key

### Port Conflicts
- Backend: Change `PORT=3001` in `.env`
- Frontend: Change port in `package.json` scripts

## 🚀 Production Deployment

### Environment Variables
- Use strong, unique JWT secrets
- Set `NODE_ENV=production`
- Use production database credentials
- Configure proper CORS origins

### Security
- Enable HTTPS
- Use environment variables for secrets
- Set up proper firewall rules
- Regular security updates

### Performance
- Use connection pooling for database
- Enable gzip compression
- Set up CDN for static assets
- Monitor API response times

## 📱 Mobile Support

ChitBox is fully responsive and works on:
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iPhone, Android phones)

## 🎉 You're Ready!

Once you've completed the setup:

1. **Register** a new account
2. **Login** to access your inbox
3. **Compose** emails with Smart Compose
4. **Reply** using Smart Reply suggestions
5. **Summarize** long emails and threads
6. **Enjoy** your modern Gmail-like experience!

**ChitBox - Where beautiful UI meets AI-powered email management!** 📧✨🤖
