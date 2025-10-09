#!/bin/bash

echo "🚀 Deploying ChitBox to Production..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}❌ Error: ecosystem.config.js not found. Run this from the chitbox root directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Stopping current services...${NC}"
pm2 stop all 2>/dev/null || true
sleep 2

echo ""
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"

# Backend dependencies
echo "  → Installing backend dependencies..."
cd backend
npm install --production=false
cd ..

# Frontend dependencies  
echo "  → Installing frontend dependencies..."
cd frontend
npm install --production=false
cd ..

echo ""
echo -e "${YELLOW}🔨 Step 3: Building backend...${NC}"
cd backend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend build failed!${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Backend built successfully${NC}"

echo ""
echo -e "${YELLOW}🔨 Step 4: Building frontend...${NC}"
cd frontend

# Fix permissions on .next if it exists
if [ -d ".next" ]; then
    echo "  → Cleaning old .next folder..."
    sudo rm -rf .next 2>/dev/null || rm -rf .next
fi

# Build with production env
NODE_ENV=production npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✅ Frontend built successfully${NC}"

echo ""
echo -e "${YELLOW}🔐 Step 5: Fixing permissions...${NC}"
sudo chown -R chitbox:chitbox . 2>/dev/null || chown -R chitbox:chitbox .
sudo chmod -R 755 backend/dist frontend/.next 2>/dev/null || chmod -R 755 backend/dist frontend/.next
echo -e "${GREEN}✅ Permissions fixed${NC}"

echo ""
echo -e "${YELLOW}🚀 Step 6: Starting services with PM2...${NC}"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📊 Service Status:"
pm2 status

echo ""
echo "🌐 Your ChitBox is now live:"
echo "  Frontend: https://chitbox.co:3004"
echo "  Backend:  https://chitbox.co:3005"
echo ""
echo "📋 Useful Commands:"
echo "  View logs:    pm2 logs"
echo "  Check status: pm2 status"
echo "  Restart:      pm2 restart all"
echo "  Stop:         pm2 stop all"
echo ""
echo "🔍 Verify CORS configuration:"
echo "  Backend .env CORS_ORIGIN: $(grep CORS_ORIGIN backend/.env)"
echo ""

