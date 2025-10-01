# Deploy ChitBox to VPS with Custom SMTP

## 🎯 Overview
Deploy ChitBox to your VPS (chitbox.co) with custom SMTP server setup.

## 📋 Prerequisites Checklist
- ✅ Domain: chitbox.co
- ✅ VPS Server
- ✅ SSH access to VPS
- ✅ Domain DNS control

## 🚀 Step 1: VPS Preparation

### 1.1 Connect to your VPS
```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### 1.2 Update system
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install required software
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

## 🗄️ Step 2: Database Setup

### 2.1 Configure PostgreSQL
```bash
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE chitbox;
CREATE USER chitbox_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE chitbox TO chitbox_user;
\q
```

### 2.2 Create environment file
```bash
sudo nano /var/www/chitbox/backend/.env
```

Add your production environment variables:
```env
# Database Configuration
DATABASE_URL=postgresql://chitbox_user:your_secure_password@localhost:5432/chitbox
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chitbox
DB_USER=chitbox_user
DB_PASSWORD=your_secure_password

# Server Configuration
PORT=3001
NODE_ENV=production

# JWT Secret (generate a secure one)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# SMTP Configuration (we'll configure this next)
SMTP_HOST=mail.chitbox.co
SMTP_PORT=587
SMTP_USER=noreply@chitbox.co
SMTP_PASS=your_smtp_password
SMTP_FROM=ChitBox <noreply@chitbox.co>

# CORS Configuration
CORS_ORIGIN=https://chitbox.co

# AI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key-here
```

## 📧 Step 3: SMTP Server Setup (Postfix)

### 3.1 Install Postfix
```bash
sudo apt install postfix mailutils -y
```

During installation, select:
- **General type of mail configuration**: Internet Site
- **System mail name**: chitbox.co

### 3.2 Configure Postfix
```bash
sudo nano /etc/postfix/main.cf
```

Add/update these configurations:
```conf
# Basic configuration
myhostname = mail.chitbox.co
mydomain = chitbox.co
myorigin = $mydomain
inet_interfaces = all
inet_protocols = ipv4

# Network settings
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
relayhost =
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.1]/128 [::1]/128

# Security settings
smtpd_banner = $myhostname ESMTP $mail_name
biff = no
append_dot_mydomain = no
readme_directory = no

# TLS settings
smtpd_tls_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
smtpd_use_tls=yes
smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache

# SASL authentication
smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous
smtpd_sasl_local_domain = $myhostname
broken_sasl_auth_clients = yes
smtpd_recipient_restrictions = permit_mynetworks,permit_sasl_authenticated,reject_unauth_destination

# Mailbox settings
home_mailbox = Maildir/
mailbox_command = 
```

### 3.3 Configure SASL authentication
```bash
sudo nano /etc/postfix/sasl/smtpd.conf
```

Add:
```conf
pwcheck_method: auxprop
auxprop_plugin: sasldb
mech_list: PLAIN LOGIN
```

### 3.4 Create SMTP user
```bash
sudo saslpasswd2 -c -u chitbox.co noreply
# Enter password when prompted
sudo chown postfix:sasl /etc/sasldb2
sudo chmod 660 /etc/sasldb2
```

### 3.5 Restart Postfix
```bash
sudo systemctl restart postfix
sudo systemctl enable postfix
```

## 🌐 Step 4: DNS Configuration

### 4.1 Add DNS records in your domain control panel:

```
Type    Name    Value               TTL
A       @       your-vps-ip         3600
A       www     your-vps-ip         3600
A       mail    your-vps-ip         3600
MX      @       mail.chitbox.co     3600
TXT     @       "v=spf1 a mx ~all"  3600
TXT     _dmarc  "v=DMARC1; p=quarantine; rua=mailto:dmarc@chitbox.co" 3600
```

### 4.2 Verify DNS propagation
```bash
dig chitbox.co
dig mail.chitbox.co
nslookup -type=MX chitbox.co
```

## 🔒 Step 5: SSL Certificate

### 5.1 Get SSL certificate for your domain
```bash
sudo certbot --nginx -d chitbox.co -d www.chitbox.co -d mail.chitbox.co
```

## 📁 Step 6: Deploy ChitBox Application

### 6.1 Create application directory
```bash
sudo mkdir -p /var/www/chitbox
sudo chown -R $USER:$USER /var/www/chitbox
cd /var/www/chitbox
```

### 6.2 Clone or upload your ChitBox code
```bash
# If using Git
git clone https://github.com/yourusername/chitbox.git .

# Or upload via SCP
# scp -r /path/to/chitbox/* user@your-vps:/var/www/chitbox/
```

### 6.3 Install dependencies
```bash
# Backend
cd backend
npm install --production
npm run build

# Frontend
cd ../frontend
npm install --production
npm run build
```

### 6.4 Setup database
```bash
cd backend
node setup-database-with-auth.js
```

## ⚙️ Step 7: Nginx Configuration

### 7.1 Create Nginx configuration
```bash
sudo nano /etc/nginx/sites-available/chitbox
```

Add:
```nginx
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

    # Frontend
    location / {
        root /var/www/chitbox/frontend/out;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7.2 Enable site
```bash
sudo ln -s /etc/nginx/sites-available/chitbox /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🚀 Step 8: Start Services

### 8.1 Create PM2 ecosystem file
```bash
nano /var/www/chitbox/ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [
    {
      name: 'chitbox-backend',
      script: './backend/dist/index.js',
      cwd: '/var/www/chitbox',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/chitbox/backend-error.log',
      out_file: '/var/log/chitbox/backend-out.log',
      log_file: '/var/log/chitbox/backend-combined.log'
    }
  ]
};
```

### 8.2 Start application
```bash
cd /var/www/chitbox
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🧪 Step 9: Test SMTP

### 9.1 Test local SMTP
```bash
echo "Test email body" | mail -s "Test Subject" your-email@gmail.com
```

### 9.2 Test from ChitBox
- Register a new user
- Send a test email
- Check logs: `sudo tail -f /var/log/mail.log`

## 🔧 Step 10: Monitoring & Maintenance

### 10.1 Setup log rotation
```bash
sudo nano /etc/logrotate.d/chitbox
```

Add:
```
/var/log/chitbox/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

### 10.2 Setup firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 25
sudo ufw allow 587
sudo ufw enable
```

## 📊 Step 11: Verify Everything

### 11.1 Check services
```bash
sudo systemctl status postfix
sudo systemctl status nginx
pm2 status
```

### 11.2 Test endpoints
- https://chitbox.co (Frontend)
- https://chitbox.co/api/auth/me (Backend)
- SMTP: mail.chitbox.co:587

## 🎯 Final Checklist

- ✅ VPS configured with Node.js, PostgreSQL, Nginx
- ✅ Domain DNS pointing to VPS
- ✅ SSL certificates installed
- ✅ SMTP server (Postfix) configured
- ✅ ChitBox application deployed
- ✅ Database setup complete
- ✅ Services running with PM2
- ✅ Firewall configured
- ✅ Email delivery working

## 🚨 Troubleshooting

### Common Issues:

1. **DNS not propagating**: Wait 24-48 hours, check with `dig`
2. **SMTP not working**: Check firewall, Postfix config, DNS MX records
3. **SSL issues**: Verify certificate with `sudo certbot certificates`
4. **App not starting**: Check PM2 logs with `pm2 logs`
5. **Database connection**: Verify PostgreSQL is running and credentials

### Useful Commands:
```bash
# Check mail queue
sudo mailq

# Test SMTP
telnet mail.chitbox.co 587

# Check logs
sudo tail -f /var/log/mail.log
pm2 logs chitbox-backend

# Restart services
sudo systemctl restart postfix
pm2 restart chitbox-backend
```

---

**🎉 Congratulations! Your ChitBox email application with custom SMTP is now live at https://chitbox.co**
