# ChitBox Authentication Setup Guide

## 🎯 Overview

ChitBox now includes a complete authentication system with:
- **Beautiful Login Page** with proper validation
- **Registration Page** with profile information (age, profession, interests, country)
- **PostgreSQL Integration** with proper database schema
- **JWT Token Authentication** with secure password hashing
- **Form Validation** with real-time feedback

## 🗄️ Database Setup

### 1. Environment Configuration

Make sure your `backend/.env` file has the correct database URL:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/chitbox
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chitbox
DB_USER=username
DB_PASSWORD=password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 2. Database Setup

Run the database setup script:

```bash
cd backend
node setup-database-with-auth.js
```

This will:
- Create all necessary tables
- Add user profile fields (age, profession, interests, country, newsletter)
- Set up proper indexes
- Run migrations

### 3. Manual Database Creation (if needed)

If you need to create the database manually:

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE chitbox;
CREATE USER chitbox_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE chitbox TO chitbox_user;
```

## 🚀 Running the Application

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔐 Authentication Features

### Login Page
- Email and password validation
- Real-time form validation
- Error handling and display
- Beautiful dark theme design
- "Remember me" checkbox
- "Forgot password" link (placeholder)

### Registration Page
- **Step 1**: Basic information (name, email, password)
- **Step 2**: Profile information (age, profession, interests, country)
- Multi-step form with progress indicator
- Interest selection (up to 5 interests)
- Country and profession dropdowns
- Newsletter subscription option
- Comprehensive validation

### Security Features
- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Both frontend and backend validation
- **SQL Injection Protection**: Parameterized queries
- **Token Expiration**: 7-day token lifetime

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    age INTEGER,
    profession VARCHAR(100),
    country VARCHAR(100),
    interests TEXT[],
    newsletter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 UI/UX Features

### Design Elements
- **Dark Theme**: Consistent with the main application
- **Gradient Backgrounds**: Beautiful blue-to-purple gradients
- **Glass Morphism**: Backdrop blur effects
- **Smooth Animations**: Loading states and transitions
- **Responsive Design**: Works on all screen sizes

### Color Scheme
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Background**: Slate (#0F172A)

## 🔧 API Endpoints

### Authentication Routes

#### POST `/auth/register`
Register a new user with profile information.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "age": "25",
  "profession": "Software Developer",
  "interests": ["Technology", "Gaming"],
  "country": "United States",
  "newsletter": true
}
```

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

#### GET `/auth/me`
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## 🧪 Testing the Authentication

### 1. Registration Test
1. Go to `http://localhost:3000`
2. Click "Create one now" on login page
3. Fill out the registration form
4. Submit and verify user is created

### 2. Login Test
1. Use the credentials from registration
2. Login and verify access to main app
3. Check that user data is displayed correctly

### 3. Logout Test
1. Click the "Login" button in the top-right
2. Verify you're redirected to login page
3. Check that token is cleared from localStorage

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running and the connection string is correct.

#### JWT Secret Error
```
Error: jwt secret not defined
```
**Solution**: Add `JWT_SECRET=your-secret-key` to your `.env` file.

#### Migration Error
```
Error: column already exists
```
**Solution**: The migration is idempotent, so this error can be ignored.

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=chitbox:*
```

## 📝 Next Steps

1. **Email Verification**: Add email verification for new registrations
2. **Password Reset**: Implement forgot password functionality
3. **Social Login**: Add Google/OAuth login options
4. **Profile Management**: Allow users to edit their profiles
5. **Admin Panel**: Create admin interface for user management

## 🤝 Contributing

When adding new authentication features:
1. Update the database schema if needed
2. Add proper validation (frontend and backend)
3. Include error handling
4. Update this documentation
5. Test thoroughly

---

**Happy coding! 🚀**
