#!/bin/bash

echo "🔧 ChitBox Production Communication Fix & Deploy"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📋 Issues Fixed:${NC}"
echo "  ✅ Backend CORS - Now allows production domain"
echo "  ✅ Frontend URLs - Production environment configured"
echo "  ✅ SMTP Config - Local Postfix properly set up"
echo "  ✅ Socket.IO - Real-time communication enabled"
echo ""

echo -e "${YELLOW}🔍 Current Configuration:${NC}"
echo "  Backend CORS: $(grep CORS_ORIGIN backend/.env | cut -d'=' -f2)"
echo "  Frontend API: $(grep NEXT_PUBLIC_API_URL frontend/.env.production 2>/dev/null | cut -d'=' -f2 || echo 'Not set')"
echo ""

echo -e "${YELLOW}Choose deployment option:${NC}"
echo "  1) Full Production Deployment (build + deploy)"
echo "  2) Quick Restart (no rebuild)"
echo "  3) Development Mode"
echo "  4) View Current Status"
echo "  5) Exit"
echo ""

read -p "Enter choice [1-5]: " choice

case $choice in
  1)
    echo ""
    echo -e "${GREEN}🚀 Starting Full Production Deployment...${NC}"
    ./deploy-production.sh
    ;;
  2)
    echo ""
    echo -e "${GREEN}🔄 Quick Restart...${NC}"
    pm2 restart all
    pm2 status
    ;;
  3)
    echo ""
    echo -e "${GREEN}🛠️  Starting Development Mode...${NC}"
    
    # Kill any existing processes
    pkill -f "ts-node" 2>/dev/null
    pkill -f "nodemon" 2>/dev/null
    pkill -f "next" 2>/dev/null
    fuser -k 3004/tcp 2>/dev/null
    fuser -k 3005/tcp 2>/dev/null
    sleep 2
    
    # Start backend
    echo "  → Starting backend..."
    cd backend
    npm run dev > /tmp/chitbox-backend.log 2>&1 &
    cd ..
    
    sleep 3
    
    # Start frontend  
    echo "  → Starting frontend..."
    cd frontend
    npm run dev > /tmp/chitbox-frontend.log 2>&1 &
    cd ..
    
    echo ""
    echo -e "${GREEN}✅ Development servers started!${NC}"
    echo "  Frontend: http://localhost:3004"
    echo "  Backend:  http://localhost:3005"
    echo ""
    echo "  Backend logs: tail -f /tmp/chitbox-backend.log"
    echo "  Frontend logs: tail -f /tmp/chitbox-frontend.log"
    ;;
  4)
    echo ""
    echo -e "${BLUE}📊 Current Status:${NC}"
    echo ""
    pm2 status
    echo ""
    echo -e "${BLUE}Recent Backend Logs:${NC}"
    pm2 logs chitbox-backend --lines 10 --nostream
    ;;
  5)
    echo "Exiting..."
    exit 0
    ;;
  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✨ Done!${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  Full guide: cat PRODUCTION_FIX.md"
echo "  All fixes:  cat COMPLETE_FIX_SUMMARY.md"

