#!/bin/bash

# ChitBox Restart Script
echo "🔄 Restarting ChitBox services..."

# Navigate to project directory
cd /home/chitbox/htdocs/chitbox.co/chitbox

# Restart PM2 services
echo "📦 Restarting PM2 services..."
pm2 restart chitbox-backend chitbox-frontend

# Show status
echo "📊 Service status:"
pm2 list

echo "✅ ChitBox services restarted!"
echo ""
echo "📋 View logs:"
echo "  Backend:  pm2 logs chitbox-backend"
echo "  Frontend: pm2 logs chitbox-frontend"
echo "  Mail:     tail -f /var/log/mail.log"
echo ""
echo "📬 Email queue:"
echo "  Status:   mailq"
echo "  Flush:    postfix flush"
