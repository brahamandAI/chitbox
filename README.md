# ChitBox - Modern Gmail-like Mail Client

A beautiful, modern email client built with Next.js, Express.js, and PostgreSQL. Features a Gmail-like interface with real-time updates, rich text composition, and full email management capabilities.

## 🚀 Features

### Frontend (Next.js + Tailwind CSS + Shadcn/UI)
- **Modern UI**: Clean, responsive design inspired by Gmail
- **Real-time Updates**: Live email notifications using Socket.IO
- **Rich Text Editor**: Compose emails with formatting options
- **Threaded Conversations**: Clean, organized email threads
- **Search & Filter**: Powerful search and filtering capabilities
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark Mode Ready**: Built with theming support

### Backend (Express.js + Socket.IO)
- **RESTful API**: Clean, well-documented API endpoints
- **Real-time Communication**: Socket.IO for live updates
- **SMTP Integration**: Send emails via SMTP servers
- **Authentication**: JWT-based authentication system
- **File Attachments**: Support for email attachments
- **Database Integration**: PostgreSQL for reliable data storage

### Database (PostgreSQL)
- **Relational Design**: Properly normalized database schema
- **User Management**: Secure user accounts and sessions
- **Email Threading**: Efficient email thread organization
- **Folder System**: Inbox, Sent, Drafts, Spam, Trash folders
- **Attachments**: File storage and management

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/UI** for components
- **Lucide React** for icons
- **Socket.IO Client** for real-time updates

### Backend
- **Express.js** web framework
- **TypeScript** for type safety
- **Socket.IO** for real-time communication
- **Nodemailer** for SMTP integration
- **PostgreSQL** database
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd chitbox
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment file
cp env.example .env

# Edit .env with your database and SMTP settings
# DATABASE_URL=postgresql://username:password@localhost:5432/chitbox
# SMTP_HOST=smtp.gmail.com
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy environment file
cp env.local.example .env.local

# Start the frontend development server
npm run dev
```

### 4. Database Setup
```bash
# Connect to PostgreSQL and create database
createdb chitbox

# Run the schema
psql -d chitbox -f backend/src/database/schema.sql
```

## 🚀 Usage

1. **Start the Backend**: `cd backend && npm run dev`
2. **Start the Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Register/Login**: Create an account or sign in
5. **Start Emailing**: Compose, send, and manage your emails!

## 📁 Project Structure

```
chitbox/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── layout/      # Layout components
│   │   │   ├── mail/        # Mail-related components
│   │   │   └── ui/          # UI components
│   │   ├── lib/             # Utilities and API client
│   │   └── types/           # TypeScript types
│   └── package.json
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── database/        # Database schema and connection
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   └── socket/          # Socket.IO handlers
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/chitbox
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chitbox
DB_USER=username
DB_PASSWORD=password

# Server
PORT=3001
NODE_ENV=development

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ChitBox <your-email@gmail.com>

# JWT
JWT_SECRET=your-super-secret-jwt-key

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## 🎨 UI Features

- **Sidebar Navigation**: Easy folder switching
- **Email List**: Clean, organized email threads
- **Thread View**: Expandable conversation threads
- **Compose Modal**: Rich text email composition
- **Search & Filter**: Find emails quickly
- **Real-time Updates**: Live notifications
- **Responsive Design**: Mobile-friendly interface

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript: `npm run build`
2. Start production server: `npm start`
3. Set up PostgreSQL database
4. Configure environment variables
5. Set up reverse proxy (nginx)

### Frontend Deployment
1. Build the Next.js app: `npm run build`
2. Start production server: `npm start`
3. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Gmail for UI inspiration
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS
- Shadcn/UI for beautiful components
- All open-source contributors

---

**ChitBox** - Where beautiful UI meets powerful email management! 📧✨
