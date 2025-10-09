# 🚀 ChitBox Own Mail Server Setup Guide

## ✅ What's Been Installed

Your ChitBox server now has its **OWN SMTP mail server** using Postfix + OpenDKIM! No external dependencies!

### Installed Components:
- ✅ **Postfix** - Professional SMTP mail server
- ✅ **OpenDKIM** - Email authentication (prevents spam filtering)
- ✅ **Email Queue System** - Reliable delivery with retries
- ✅ **DKIM Signing** - Cryptographic email authentication

---

## 📋 DNS Records Required

To ensure your emails reach Gmail, Yahoo, Outlook, etc., you **MUST** add these DNS records to your domain `chitbox.co`:

### 1. MX Record (Mail Exchange)
```
Type: MX
Name: @
Value: mail.chitbox.co
Priority: 10
TTL: 3600
```

### 2. A Record (For mail subdomain)
```
Type: A
Name: mail
Value: YOUR_SERVER_IP (e.g., 123.45.67.89)
TTL: 3600
```

### 3. SPF Record (Sender Policy Framework)
```
Type: TXT
Name: @
Value: v=spf1 mx ip4:YOUR_SERVER_IP ~all
TTL: 3600
```

**Example:** `v=spf1 mx ip4:123.45.67.89 ~all`

### 4. DKIM Record (DomainKeys Identified Mail)
```
Type: TXT
Name: mail._domainkey
Value: v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwV8Gt9S/SlHW5UVqYeF+4KNhbngXRMbbvmVb9N5xRdmrLpUNWCHKBoHfGhHqxBhGkuP8NRHB+DSAeDXxnl+cgBv5tOFgDSrdNYc0C6IHTf/naUthx0A4aqeQ3BZ+rgEdZEWLazQaBKY7lXXHXScNFnZCGhSI2KbsWpOgwobklNubBmKX+Qze0bO5u/Y220IndrgBAtxCyaCLEie7mSX4msmNQ7HWt3CDqgop/mjZExElCQZpxKyCBRLvtBRPM3A6sAXPjM0bKlC30jC9tshhG8OFbWoVK64Hj2Ii49vYyQ4V2rzMd/T8sh5xeQ78UmA3LqHShK6/KuwYJ9wg+FAMowIDAQAB
TTL: 3600
```

### 5. DMARC Record (Domain-based Message Authentication)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:postmaster@chitbox.co; pct=100; adkim=s; aspf=s
TTL: 3600
```

### 6. Reverse DNS (PTR Record)
**Important:** Contact your hosting provider (where your server is hosted) and request them to set up **Reverse DNS (PTR record)**:
```
Your Server IP: 123.45.67.89
PTR Record: mail.chitbox.co
```

This is crucial for Gmail/Yahoo acceptance!

---

## 🔍 How to Add DNS Records

### If you're using **Cloudflare**:
1. Go to your Cloudflare dashboard
2. Select `chitbox.co` domain
3. Click **DNS** → **Records**
4. Click **Add record** and add each record above

### If you're using **GoDaddy/Namecheap/Other**:
1. Login to your domain registrar
2. Find DNS settings
3. Add each TXT, A, and MX record listed above

---

## ✅ Verify Your Setup

After adding DNS records (wait 5-30 minutes for propagation):

### 1. Check MX Record:
```bash
dig MX chitbox.co
```

### 2. Check SPF Record:
```bash
dig TXT chitbox.co
```

### 3. Check DKIM Record:
```bash
dig TXT mail._domainkey.chitbox.co
```

### 4. Test Email Delivery:
Send a test email from ChitBox to:
- Your Gmail
- check-auth@verifier.port25.com (will reply with authentication results)

---

## 🚀 Start Using Your Own Mail Server

### Restart ChitBox Backend:
```bash
cd /home/chitbox/htdocs/chitbox.co/chitbox
pm2 restart chitbox-backend
```

### Check Logs:
```bash
# Backend logs
pm2 logs chitbox-backend

# Postfix logs
tail -f /var/log/mail.log

# Email queue status
mailq
```

---

## 🎯 How It Works Now

1. **User sends email** from ChitBox to anyone (Gmail, Yahoo, Outlook, etc.)
2. **Email queued** in ChitBox database
3. **Background processor** picks up email every 30 seconds
4. **Sent to local Postfix** on port 25
5. **Postfix signs with DKIM** for authentication
6. **Delivers directly** to recipient's mail server (Gmail, Yahoo, etc.)
7. **SPF/DKIM/DMARC checks pass** → Email goes to inbox, not spam!

---

## 🔧 Troubleshooting

### Emails going to spam?
✅ Verify all DNS records are added correctly
✅ Check reverse DNS (PTR) is set up
✅ Test with: https://www.mail-tester.com/

### Emails not sending?
```bash
# Check Postfix status
systemctl status postfix

# Check Postfix logs
tail -f /var/log/mail.log

# Check queue
mailq

# Test Postfix manually
echo "Test email body" | mail -s "Test Subject" recipient@gmail.com
```

### Check DKIM signing:
```bash
# Send test email and check headers
# In Gmail: Show original → Look for "DKIM: PASS"
```

---

## 📊 Email Queue Commands

```bash
# View queue
mailq

# Flush queue (force delivery)
postfix flush

# Delete all queued emails
postsuper -d ALL

# View mail logs
tail -f /var/log/mail.log | grep chitbox
```

---

## 🎉 Success!

You now have a **professional, self-hosted email server** that sends emails directly to any email provider without relying on external SMTP services!

Your emails will be:
✅ Properly authenticated (DKIM, SPF, DMARC)
✅ Delivered to inbox (not spam)
✅ Professional headers
✅ Full control and privacy

**Next Step:** Add the DNS records above and test sending emails to Gmail/Yahoo/Outlook!

