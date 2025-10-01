#!/bin/bash

# ChitBox VPS Deployment Script
echo "🚀 Deploying ChitBox to VPS with Custom SMTP..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="your-vps-ip-here"
VPS_USER="root"
DOMAIN="chitbox.co"
EMAIL="your-email@example.com"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "   VPS IP: $VPS_IP"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

# Check if required files exist
if [ ! -f "docker-compose.production.yml" ]; then
    echo -e "${RED}❌ docker-compose.production.yml not found!${NC}"
    exit 1
fi

if [ ! -f "production.env.example" ]; then
    echo -e "${RED}❌ production.env.example not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  Before proceeding, make sure you have:${NC}"
echo "   1. Updated VPS_IP, VPS_USER, DOMAIN, EMAIL in this script"
echo "   2. Created production.env from production.env.example"
echo "   3. Updated all passwords and secrets"
echo "   4. Configured DNS records for your domain"
echo ""

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Create deployment package
echo -e "${BLUE}📦 Creating deployment package...${NC}"
tar -czf chitbox-deployment.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    --exclude=dist \
    --exclude=.env \
    .

# Upload to VPS
echo -e "${BLUE}📤 Uploading to VPS...${NC}"
scp chitbox-deployment.tar.gz production.env $VPS_USER@$VPS_IP:/tmp/

# Deploy on VPS
echo -e "${BLUE}🔧 Deploying on VPS...${NC}"
ssh $VPS_USER@$VPS_IP << 'EOF'
    # Update system
    apt update && apt upgrade -y
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    
    # Install Docker Compose
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Create application directory
    mkdir -p /var/www/chitbox
    cd /var/www/chitbox
    
    # Extract application
    tar -xzf /tmp/chitbox-deployment.tar.gz
    
    # Setup environment
    cp /tmp/production.env .env
    
    # Create necessary directories
    mkdir -p nginx/conf.d ssl smtp uploads
    
    # Create basic nginx config
    cat > nginx/conf.d/chitbox.conf << 'NGINX_EOF'
server {
    listen 80;
    server_name chitbox.co www.chitbox.co;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF
    
    # Create basic postfix config
    cat > smtp/postfix.conf << 'POSTFIX_EOF'
myhostname = mail.chitbox.co
mydomain = chitbox.co
myorigin = $mydomain
inet_interfaces = all
inet_protocols = ipv4
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
relayhost =
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.1]/128 [::1]/128
smtpd_banner = $myhostname ESMTP
biff = no
append_dot_mydomain = no
readme_directory = no
smtpd_use_tls = yes
smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous
smtpd_recipient_restrictions = permit_mynetworks,permit_sasl_authenticated,reject_unauth_destination
POSTFIX_EOF
    
    # Start services
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to start
    sleep 30
    
    # Setup database
    docker-compose -f docker-compose.production.yml exec backend node setup-database-with-auth.js
    
    # Get SSL certificate
    apt install certbot -y
    certbot certonly --standalone -d chitbox.co -d www.chitbox.co -d mail.chitbox.co --non-interactive --agree-tos --email $EMAIL
    
    # Update nginx config with SSL
    cat > nginx/conf.d/chitbox.conf << 'SSL_EOF'
server {
    listen 80;
    server_name chitbox.co www.chitbox.co;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chitbox.co www.chitbox.co;
    
    ssl_certificate /etc/letsencrypt/live/chitbox.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chitbox.co/privkey.pem;
    
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
SSL_EOF
    
    # Restart nginx
    docker-compose -f docker-compose.production.yml restart nginx
    
    echo "✅ Deployment completed!"
    echo "🌐 Your application should be available at: https://chitbox.co"
    echo "📧 SMTP server: mail.chitbox.co:587"
    echo "📊 Monitor: https://chitbox.co:3002"
EOF

# Cleanup
rm chitbox-deployment.tar.gz

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "   1. Configure DNS records:"
echo "      A     @      $VPS_IP"
echo "      A     www    $VPS_IP"
echo "      A     mail   $VPS_IP"
echo "      MX    @      mail.chitbox.co"
echo "      TXT   @      \"v=spf1 a mx ~all\""
echo ""
echo "   2. Test your application:"
echo "      Frontend: https://chitbox.co"
echo "      Backend:  https://chitbox.co/api"
echo "      SMTP:     mail.chitbox.co:587"
echo ""
echo "   3. Monitor logs:"
echo "      docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo -e "${GREEN}🚀 ChitBox is now live with custom SMTP!${NC}"
