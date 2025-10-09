#!/bin/bash

echo "🔓 Opening ChitBox Ports in Firewall..."
echo ""

# Check current firewall status
echo "📊 Current firewall status:"
sudo ufw status numbered

echo ""
echo "🔓 Opening required ports..."

# Open port 3004 (Frontend)
sudo ufw allow 3004/tcp comment 'ChitBox Frontend'
echo "✅ Port 3004 opened (Frontend)"

# Open port 3005 (Backend API)
sudo ufw allow 3005/tcp comment 'ChitBox Backend API'
echo "✅ Port 3005 opened (Backend API)"

# Open port 2525 (SMTP Server - optional, only if receiving external email)
# sudo ufw allow 2525/tcp comment 'ChitBox SMTP Server'
# echo "✅ Port 2525 opened (SMTP Server)"

echo ""
echo "🔄 Reloading firewall..."
sudo ufw reload

echo ""
echo "✅ Done! Firewall configured."
echo ""
echo "📊 New firewall status:"
sudo ufw status numbered

echo ""
echo "🧪 Test backend connectivity:"
echo "   curl -I https://chitbox.co:3005/api/health"
echo ""
echo "✅ Ports are now open! Try login/registration again."

