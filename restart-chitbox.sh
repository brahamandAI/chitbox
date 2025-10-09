#!/bin/bash

# ChitBox Restart Script
# This script cleanly restarts both frontend and backend

echo "🔄 Restarting ChitBox..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Kill existing processes
echo -e "${YELLOW}Stopping existing processes...${NC}"
sudo fuser -k 2525/tcp 2>/dev/null
lsof -ti:3005 | xargs kill -9 2>/dev/null
lsof -ti:3004 | xargs kill -9 2>/dev/null
pkill -f nodemon
pkill -f "next dev"

sleep 2

# Restart mail services
echo -e "${YELLOW}Restarting mail services...${NC}"
sudo systemctl restart postfix
sudo systemctl restart opendkim

# Start Backend
echo -e "${YELLOW}Starting Backend on port 3005...${NC}"
cd /home/chitbox/htdocs/chitbox.co/chitbox/backend
nohup npm run dev > /tmp/chitbox-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"

sleep 3

# Start Frontend
echo -e "${YELLOW}Starting Frontend on port 3004...${NC}"
cd /home/chitbox/htdocs/chitbox.co/chitbox/frontend
nohup npm run dev > /tmp/chitbox-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"

sleep 3

# Verify
echo -e "\n${YELLOW}Checking services...${NC}"
if lsof -ti:3005 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running on port 3005${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo "Check logs: tail -f /tmp/chitbox-backend.log"
fi

if lsof -ti:3004 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend running on port 3004${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo "Check logs: tail -f /tmp/chitbox-frontend.log"
fi

if lsof -ti:2525 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ SMTP server running on port 2525${NC}"
else
    echo -e "${RED}❌ SMTP server not running${NC}"
fi

echo -e "\n${GREEN}🎉 ChitBox is ready!${NC}"
echo -e "${YELLOW}Frontend: http://localhost:3004${NC}"
echo -e "${YELLOW}Backend: http://localhost:3005${NC}"
echo -e "\n${YELLOW}View logs:${NC}"
echo "  Backend: tail -f /tmp/chitbox-backend.log"
echo "  Frontend: tail -f /tmp/chitbox-frontend.log"

