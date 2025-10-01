#!/bin/bash

# ChitBox Setup Script
echo "🚀 Setting up ChitBox Email Application..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
fi

# Setup database
echo "   Setting up database..."
node setup-database-with-auth.js

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd ../frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "   Installing frontend dependencies..."
    npm install
fi

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🎯 To start the application:"
echo "   1. Backend:  cd backend && npm run dev"
echo "   2. Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🧪 To test authentication:"
echo "   cd frontend && node test-auth.js"
echo ""
echo "📚 Documentation:"
echo "   See AUTHENTICATION_SETUP.md for detailed setup instructions"
echo ""
echo "Happy coding! 🚀"
