#!/bin/bash

echo "🔒 Setting up Nginx HTTPS for ChitBox..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

# Step 1: Find SSL certificates
echo -e "${YELLOW}📋 Step 1: Locating SSL certificates...${NC}"

SSL_CERT=""
SSL_KEY=""

# Check common locations
if [ -f "/etc/letsencrypt/live/chitbox.co/fullchain.pem" ]; then
    SSL_CERT="/etc/letsencrypt/live/chitbox.co/fullchain.pem"
    SSL_KEY="/etc/letsencrypt/live/chitbox.co/privkey.pem"
    echo -e "${GREEN}✅ Found Let's Encrypt certificates${NC}"
elif [ -f "/etc/ssl/certs/chitbox.co.crt" ]; then
    SSL_CERT="/etc/ssl/certs/chitbox.co.crt"
    SSL_KEY="/etc/ssl/private/chitbox.co.key"
    echo -e "${GREEN}✅ Found custom SSL certificates${NC}"
else
    echo -e "${YELLOW}⚠️  SSL certificates not found in common locations${NC}"
    echo ""
    echo "Please provide the full path to your SSL certificate files:"
    read -p "SSL Certificate (.crt or fullchain.pem): " SSL_CERT
    read -p "SSL Private Key (.key or privkey.pem): " SSL_KEY
    
    if [ ! -f "$SSL_CERT" ] || [ ! -f "$SSL_KEY" ]; then
        echo -e "${RED}❌ Certificate files not found!${NC}"
        echo ""
        echo "Options:"
        echo "1. Install Let's Encrypt certificate: sudo certbot --nginx -d chitbox.co"
        echo "2. Use self-signed certificate (for testing only)"
        echo ""
        read -p "Generate self-signed certificate for testing? (y/n): " GENERATE_SELF
        
        if [ "$GENERATE_SELF" = "y" ]; then
            echo "Generating self-signed certificate..."
            mkdir -p /etc/ssl/private
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout /etc/ssl/private/chitbox.co.key \
                -out /etc/ssl/certs/chitbox.co.crt \
                -subj "/C=US/ST=State/L=City/O=ChitBox/CN=chitbox.co"
            
            SSL_CERT="/etc/ssl/certs/chitbox.co.crt"
            SSL_KEY="/etc/ssl/private/chitbox.co.key"
            echo -e "${GREEN}✅ Self-signed certificate generated${NC}"
            echo -e "${YELLOW}⚠️  Browsers will show security warnings with self-signed certificates${NC}"
        else
            exit 1
        fi
    fi
fi

# Step 2: Update Nginx configuration with actual SSL paths
echo ""
echo -e "${YELLOW}📋 Step 2: Updating Nginx configuration...${NC}"

CONFIG_FILE="nginx-chitbox.conf"
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"

# Update SSL certificate paths in the config
sed -i "s|ssl_certificate .*;|ssl_certificate $SSL_CERT;|g" "$CONFIG_FILE"
sed -i "s|ssl_certificate_key .*;|ssl_certificate_key $SSL_KEY;|g" "$CONFIG_FILE"

echo -e "${GREEN}✅ Configuration updated${NC}"

# Step 3: Copy to Nginx directory
echo ""
echo -e "${YELLOW}📋 Step 3: Installing Nginx configuration...${NC}"

# Backup existing nginx.conf
if [ -f "/etc/nginx/nginx.conf" ]; then
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup-$(date +%Y%m%d)
fi

# Copy ChitBox config
cp "$CONFIG_FILE" /etc/nginx/conf.d/chitbox.conf

echo -e "${GREEN}✅ Configuration installed to /etc/nginx/conf.d/chitbox.conf${NC}"

# Step 4: Test Nginx configuration
echo ""
echo -e "${YELLOW}📋 Step 4: Testing Nginx configuration...${NC}"

nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors!${NC}"
    echo "Restoring backup..."
    rm /etc/nginx/conf.d/chitbox.conf
    exit 1
fi

# Step 5: Reload Nginx
echo ""
echo -e "${YELLOW}📋 Step 5: Reloading Nginx...${NC}"

systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to reload Nginx${NC}"
    exit 1
fi

# Step 6: Update Frontend URLs
echo ""
echo -e "${YELLOW}📋 Step 6: Updating frontend configuration...${NC}"

cd frontend
rm -rf .next

# Build with new URLs (no port numbers, just domain)
NEXT_PUBLIC_API_URL="https://chitbox.co/api" \
NEXT_PUBLIC_SOCKET_URL="https://chitbox.co" \
NODE_ENV=production \
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend rebuilt with correct URLs${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..

# Step 7: Restart PM2
echo ""
echo -e "${YELLOW}📋 Step 7: Restarting services...${NC}"

pm2 restart all

echo ""
echo -e "${GREEN}✅ ✅ ✅ ChitBox HTTPS Setup Complete! ✅ ✅ ✅${NC}"
echo ""
echo -e "${GREEN}🌐 Your ChitBox is now available at:${NC}"
echo -e "   ${GREEN}https://chitbox.co${NC}"
echo ""
echo -e "${GREEN}📊 Check logs:${NC}"
echo "   pm2 logs"
echo "   sudo tail -f /var/log/nginx/chitbox-access.log"
echo "   sudo tail -f /var/log/nginx/chitbox-error.log"
echo ""
echo -e "${GREEN}🧪 Test it:${NC}"
echo "   curl -I https://chitbox.co/api/health"
echo "   Open browser: https://chitbox.co"
echo ""

