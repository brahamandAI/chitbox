# ChitBox Mail Server Setup Guide

## 🎯 Overview

This guide will help you set up ChitBox to send emails directly from your own server without relying on external SMTP services like Gmail. This ensures better deliverability and control.

## 📋 Prerequisites

- Root/sudo access to your server
- Domain name: `chitbox.co`
- Access to DNS management (Hostinger)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Run the Setup Script

```bash
cd /home/chitbox/htdocs/chitbox.co/chitbox
sudo ./setup-mail-server.sh
```

This script will:
- ✅ Install Postfix and OpenDKIM
- ✅ Configure email authentication (DKIM)
- ✅ Generate DKIM keys
- ✅ Update backend configuration
- ✅ Generate DNS records

### Step 2: Add DNS Records

After running the script, you'll see DNS records to add. Go to **Hostinger DNS Management**:

#### 1. **SPF Record** (Prevents spoofing)
```
Type: TXT
Name: @
Value: v=spf1 ip4:YOUR_SERVER_IP a mx ~all
```

#### 2. **DKIM Record** (Email authentication)
```
Type: TXT
Name: mail._domainkey
Value: v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY
```

#### 3. **DMARC Record** (Email policy)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@chitbox.co; pct=100; adkim=s; aspf=s
```

#### 4. **MX Record** (Mail server)
```
Type: MX
Name: @
Value: srv908380.hstgr.cloud
Priority: 10
```

#### 5. **PTR Record** (Reverse DNS)
**Contact Hostinger Support** to set up:
```
IP: YOUR_SERVER_IP
Points to: srv908380.hstgr.cloud
```

### Step 3: Verify Configuration

After adding DNS records (wait 1-2 hours for propagation):

1. **Test DKIM:**
```bash
sudo opendkim-testkey -d chitbox.co -s mail -vvv
```

2. **Test email sending:**
```bash
echo "Test email from ChitBox" | mail -s "Test" your-email@gmail.com
```

3. **Check spam score:**
Send an email and check at: https://www.mail-tester.com/

---

## 🔧 Backend Configuration

The setup script automatically updates `backend/.env`:

```env
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_FROM=ChitBox <noreply@chitbox.co>
```

No SMTP username/password needed - it uses local Postfix!

---

## 📊 Monitoring & Troubleshooting

### Check Postfix Logs
```bash
sudo tail -f /var/log/mail.log
```

### Check Email Queue
```bash
sudo mailq
```

### Check OpenDKIM Status
```bash
sudo systemctl status opendkim
```

### Check Postfix Status
```bash
sudo systemctl status postfix
```

### View Failed Emails
```bash
sudo postcat -q QUEUE_ID
```

### Flush Queue (retry sending)
```bash
sudo postqueue -f
```

---

## 🛡️ Avoiding Spam Filters

### ✅ Checklist for High Deliverability

1. **SPF Record Added** ✓
2. **DKIM Configured** ✓
3. **DMARC Policy Set** ✓
4. **PTR Record (Reverse DNS)** - Contact Hostinger
5. **Proper Email Headers** - Already configured
6. **Authentication** - OpenDKIM signing enabled
7. **Warm-up Period** - Start with low volume

### 📈 Best Practices

1. **Start Slowly**: Don't send 1000 emails immediately
   - Day 1-3: Send 10-20 emails
   - Week 1: Gradually increase to 100
   - Week 2+: Full volume

2. **Monitor Bounce Rates**: Keep below 5%

3. **Avoid Spam Triggers**:
   - Don't use ALL CAPS in subject
   - Avoid too many links
   - Include unsubscribe option
   - Use proper formatting

4. **Regular Testing**: Use https://www.mail-tester.com/ weekly

---

## 🔍 Verification Commands

### Test SMTP Connection
```bash
telnet localhost 25
```

### Test DKIM Signing
```bash
sudo opendkim-testkey -d chitbox.co -s mail -vvv
```

### Send Test Email
```bash
echo "Test from ChitBox Mail Server" | \
  mail -s "Test Email" \
  -a "From: ChitBox <noreply@chitbox.co>" \
  your-email@gmail.com
```

### Check DNS Records
```bash
dig chitbox.co TXT
dig mail._domainkey.chitbox.co TXT
dig _dmarc.chitbox.co TXT
dig chitbox.co MX
```

---

## 📝 Important Files

```
/etc/postfix/main.cf              - Postfix configuration
/etc/opendkim.conf                - OpenDKIM configuration
/etc/opendkim/keys/chitbox.co/    - DKIM keys
/var/log/mail.log                 - Email logs
backend/.env                      - Backend SMTP config
```

---

## 🆘 Common Issues

### Issue: Emails going to spam

**Solution:**
1. Verify all DNS records are added
2. Wait 24-48 hours for DNS propagation
3. Check https://www.mail-tester.com/ score
4. Ensure PTR record is set (contact Hostinger)

### Issue: "Connection refused" error

**Solution:**
```bash
sudo systemctl start postfix
sudo systemctl start opendkim
```

### Issue: DKIM verification failed

**Solution:**
```bash
# Regenerate DKIM keys
cd /etc/opendkim/keys/chitbox.co/
sudo opendkim-genkey -b 2048 -d chitbox.co -s mail
sudo chown opendkim:opendkim mail.private
sudo systemctl restart opendkim
```

### Issue: Emails stuck in queue

**Solution:**
```bash
# View queue
sudo mailq

# Flush queue
sudo postqueue -f

# Delete specific email
sudo postsuper -d QUEUE_ID
```

---

## 🎯 Expected Results

After proper configuration:

✅ **Mail-Tester Score**: 8-10/10  
✅ **Gmail Delivery**: Inbox  
✅ **Outlook Delivery**: Inbox  
✅ **Spam Rate**: < 1%  
✅ **Bounce Rate**: < 2%  

---

## 📞 Support Contacts

- **Hostinger DNS Support**: For PTR record setup
- **ChitBox Logs**: `/var/log/mail.log`
- **Email Testing**: https://www.mail-tester.com/

---

**Setup Date**: $(date)  
**Server**: srv908380.hstgr.cloud  
**Domain**: chitbox.co  

