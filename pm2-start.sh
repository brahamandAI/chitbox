#!/bin/bash

# Quick PM2 start script for ChitBox
set -e

echo "🚀 Starting ChitBox with PM2..."

# Create logs directory
mkdir -p logs

# Stop any existing processes
pm2 delete ecosystem.config.js 2>/dev/null || true

# Start processes
pm2 start ecosystem.config.js --env production

# Show status
pm2 status

echo "✅ ChitBox started successfully!"
echo ""
echo "📝 Useful commands:"
echo "  pm2 logs             - Show all logs"
echo "  pm2 restart all      - Restart all processes"
echo "  pm2 stop all         - Stop all processes"