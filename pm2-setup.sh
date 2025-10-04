#!/bin/bash

# ChitBox PM2 Setup and Start Script
set -e

echo "🚀 Setting up ChitBox with PM2..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to run setup for a service
setup_service() {
    local service_name=$1
    local service_dir=$2
    
    echo "📦 Setting up $service_name..."
    cd $service_dir
    
    # Install dependencies
    echo "Installing dependencies for $service_name..."
    npm install
    
    # Build the service
    echo "Building $service_name..."
    npm run build
    
    cd ..
}

# Setup backend
setup_service "backend" "backend"

# Setup frontend  
setup_service "frontend" "frontend"

# Start PM2 processes
echo "🔄 Starting PM2 processes..."

# Stop any existing processes
pm2 delete ecosystem.config.js 2>/dev/null || true

# Start all processes
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup (optional - run with sudo if needed)
echo "💡 To enable PM2 startup on boot, run: sudo pm2 startup"
echo "💡 Then run: pm2 save"

echo "✅ ChitBox is now running with PM2!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📝 Useful PM2 commands:"
echo "  pm2 status           - Show process status"
echo "  pm2 logs             - Show all logs"
echo "  pm2 logs backend     - Show backend logs"
echo "  pm2 logs frontend    - Show frontend logs"
echo "  pm2 restart all      - Restart all processes"
echo "  pm2 stop all         - Stop all processes"
echo "  pm2 delete all       - Delete all processes"