#!/bin/bash

# ChitBox Mail Server Setup Script
# This script configures Postfix and OpenDKIM for sending emails from chitbox.co

set -e

echo "🚀 Setting up ChitBox Mail Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="chitbox.co"
HOSTNAME="srv908380.hstgr.cloud"
DKIM_SELECTOR="mail"

echo -e "${GREEN}Domain: $DOMAIN${NC}"
echo -e "${GREEN}Hostname: $HOSTNAME${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

# 1. Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
apt-get update
apt-get install -y postfix opendkim opendkim-tools mailutils

# 2. Configure Postfix
echo -e "${YELLOW}📧 Configuring Postfix...${NC}"

# Backup original config
cp /etc/postfix/main.cf /etc/postfix/main.cf.backup.$(date +%Y%m%d)

# Configure Postfix main.cf
cat > /etc/postfix/main.cf << EOF
# Main Postfix configuration for chitbox.co

# Basic settings
myhostname = $HOSTNAME
mydomain = $DOMAIN
myorigin = \$mydomain
mydestination = localhost.\$mydomain, localhost, \$myhostname
relayhost = 
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
mailbox_size_limit = 0
recipient_delimiter = +
inet_interfaces = all
inet_protocols = ipv4

# SMTP settings
smtpd_banner = \$myhostname ESMTP ChitBox Mail Server
smtpd_tls_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
smtpd_use_tls=yes
smtpd_tls_session_cache_database = btree:\${data_directory}/smtpd_scache
smtp_tls_session_cache_database = btree:\${data_directory}/smtp_scache

# DKIM/SPF settings
smtpd_milters = inet:127.0.0.1:8891
non_smtpd_milters = \$smtpd_milters
milter_default_action = accept
milter_protocol = 6

# Message size limit (50MB)
message_size_limit = 52428800

# Sender restrictions
smtpd_sender_restrictions = 
    permit_mynetworks,
    reject_unknown_sender_domain

# Relay restrictions
smtpd_relay_restrictions = 
    permit_mynetworks,
    permit_sasl_authenticated,
    defer_unauth_destination

# Disable local delivery (we only send)
local_transport = error:local delivery disabled
EOF

# 3. Configure OpenDKIM
echo -e "${YELLOW}🔐 Configuring OpenDKIM...${NC}"

# Create OpenDKIM directories
mkdir -p /etc/opendkim/keys/$DOMAIN
chown -R opendkim:opendkim /etc/opendkim
chmod 750 /etc/opendkim/keys

# Configure OpenDKIM
cat > /etc/opendkim.conf << EOF
# OpenDKIM Configuration

# Logging
Syslog yes
SyslogSuccess yes
LogWhy yes

# Common settings
Canonicalization relaxed/simple
Mode sv
SubDomains no

# Signing
Domain $DOMAIN
Selector $DKIM_SELECTOR
KeyFile /etc/opendkim/keys/$DOMAIN/$DKIM_SELECTOR.private

# Socket
Socket inet:8891@localhost

# Other
AutoRestart yes
AutoRestartRate 10/1M
Background yes
DNSTimeout 5
SignatureAlgorithm rsa-sha256
UserID opendkim

# Trusted hosts
ExternalIgnoreList /etc/opendkim/trusted.hosts
InternalHosts /etc/opendkim/trusted.hosts
EOF

# Create trusted hosts file
cat > /etc/opendkim/trusted.hosts << EOF
127.0.0.1
localhost
$HOSTNAME
$DOMAIN
*.$DOMAIN
EOF

# 4. Generate DKIM keys
echo -e "${YELLOW}🔑 Generating DKIM keys...${NC}"
cd /etc/opendkim/keys/$DOMAIN
opendkim-genkey -b 2048 -d $DOMAIN -s $DKIM_SELECTOR
chown opendkim:opendkim $DKIM_SELECTOR.private
chmod 600 $DKIM_SELECTOR.private

# 5. Update backend .env
echo -e "${YELLOW}⚙️  Updating backend configuration...${NC}"
BACKEND_ENV="/home/chitbox/htdocs/chitbox.co/chitbox/backend/.env"

if [ -f "$BACKEND_ENV" ]; then
    # Update SMTP settings
    sed -i 's/^SMTP_HOST=.*/SMTP_HOST=localhost/' $BACKEND_ENV
    sed -i 's/^SMTP_PORT=.*/SMTP_PORT=25/' $BACKEND_ENV
    sed -i 's/^SMTP_USER=.*/# SMTP_USER=/' $BACKEND_ENV
    sed -i 's/^SMTP_PASS=.*/# SMTP_PASS=/' $BACKEND_ENV
    sed -i "s/^SMTP_FROM=.*/SMTP_FROM=ChitBox <noreply@$DOMAIN>/" $BACKEND_ENV
fi

# 6. Restart services
echo -e "${YELLOW}🔄 Restarting services...${NC}"
systemctl restart opendkim
systemctl restart postfix

# Enable services
systemctl enable opendkim
systemctl enable postfix

# 7. Extract DKIM public key for DNS
echo ""
echo -e "${GREEN}✅ Mail server setup complete!${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 DNS RECORDS REQUIRED${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# SPF Record
echo -e "${GREEN}1. SPF Record (TXT):${NC}"
echo "   Name: @"
echo "   Value: v=spf1 ip4:$(curl -s ifconfig.me) a mx ~all"
echo ""

# DKIM Record
echo -e "${GREEN}2. DKIM Record (TXT):${NC}"
echo "   Name: $DKIM_SELECTOR._domainkey"
DKIM_VALUE=$(cat /etc/opendkim/keys/$DOMAIN/$DKIM_SELECTOR.txt | grep -oP 'p=\K[^"]+')
echo "   Value: v=DKIM1; k=rsa; p=$DKIM_VALUE"
echo ""

# DMARC Record
echo -e "${GREEN}3. DMARC Record (TXT):${NC}"
echo "   Name: _dmarc"
echo "   Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@$DOMAIN; pct=100; adkim=s; aspf=s"
echo ""

# MX Record
echo -e "${GREEN}4. MX Record:${NC}"
echo "   Name: @"
echo "   Value: $HOSTNAME"
echo "   Priority: 10"
echo ""

# PTR Record (Reverse DNS)
echo -e "${GREEN}5. PTR Record (Contact your hosting provider):${NC}"
echo "   IP: $(curl -s ifconfig.me)"
echo "   Points to: $HOSTNAME"
echo ""

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📝 DNS records saved to: /home/chitbox/htdocs/chitbox.co/chitbox/DNS_RECORDS.txt${NC}"

# Save DNS records to file
cat > /home/chitbox/htdocs/chitbox.co/chitbox/DNS_RECORDS.txt << DNSEOF
ChitBox Mail Server - DNS Records
==================================

Add these DNS records to your domain (chitbox.co):

1. SPF Record (TXT)
   Name: @
   Value: v=spf1 ip4:$(curl -s ifconfig.me) a mx ~all

2. DKIM Record (TXT)
   Name: $DKIM_SELECTOR._domainkey
   Value: v=DKIM1; k=rsa; p=$DKIM_VALUE

3. DMARC Record (TXT)
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@$DOMAIN; pct=100; adkim=s; aspf=s

4. MX Record
   Name: @
   Value: $HOSTNAME
   Priority: 10

5. PTR Record (Contact Hostinger Support)
   IP: $(curl -s ifconfig.me)
   Points to: $HOSTNAME

Important Notes:
- DNS changes can take up to 48 hours to propagate
- PTR record must be set by your hosting provider (Hostinger)
- Test your setup at: https://www.mail-tester.com/
DNSEOF

chown chitbox:chitbox /home/chitbox/htdocs/chitbox.co/chitbox/DNS_RECORDS.txt

echo -e "${GREEN}🎉 Setup complete! Restart your backend to apply changes.${NC}"
echo -e "${YELLOW}⚠️  Important: Add the DNS records above to avoid spam filters!${NC}"
