# ChitBox Development Setup Guide

## Quick Start

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   
   **Backend** (`backend/.env`):
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/chitbox
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=chitbox
   DB_USER=username
   DB_PASSWORD=password
   PORT=3001
   NODE_ENV=development
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=ChitBox <your-email@gmail.com>
   JWT_SECRET=your-super-secret-jwt-key
   CORS_ORIGIN=http://localhost:3000
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

3. **Set up PostgreSQL database:**
   ```bash
   # Create database
   createdb chitbox
   
   # Run schema
   psql -d chitbox -f backend/src/database/schema.sql
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## Individual Commands

- **Start both servers:** `npm run dev`
- **Start backend only:** `npm run dev:backend`
- **Start frontend only:** `npm run dev:frontend`
- **Build everything:** `npm run build`
- **Install all dependencies:** `npm run install:all`

## Features Ready to Use

✅ **Authentication System**
- User registration and login
- JWT-based authentication
- Secure password hashing

✅ **Email Management**
- Send and receive emails
- Draft saving
- Email threading
- Folder organization (Inbox, Sent, Drafts, Spam, Trash)

✅ **Real-time Features**
- Live email notifications
- Real-time updates via Socket.IO
- Typing indicators

✅ **Modern UI**
- Gmail-like interface
- Responsive design
- Rich text composition
- Search and filtering
- File attachments

✅ **Database Integration**
- PostgreSQL with proper schema
- Relational data modeling
- Efficient queries and indexing

## Next Steps for Production

1. **Configure SMTP settings** for your email provider
2. **Set up proper environment variables** for production
3. **Configure database** with production credentials
4. **Set up file storage** for attachments (AWS S3, etc.)
5. **Configure reverse proxy** (nginx)
6. **Set up SSL certificates**
7. **Configure monitoring and logging**

## Troubleshooting

- **Database connection issues:** Check PostgreSQL is running and credentials are correct
- **SMTP issues:** Verify email provider settings and app passwords
- **Socket.IO issues:** Check CORS settings and network connectivity
- **Build issues:** Ensure all dependencies are installed with `npm run install:all`

Happy coding! 🚀
