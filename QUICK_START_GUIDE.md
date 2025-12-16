# 🚀 ChitBox Quick Start Guide

**Last Updated:** December 16, 2025

---

## ⚡ CRITICAL - Do This First!

### 🔴 Update SPF DNS Record (URGENT!)

Your SPF record currently has the **OLD IP address**. Update it immediately:

**Go to your DNS provider (GoDaddy/Cloudflare) and change:**

```
❌ OLD: v=spf1 mx ip4:54.90.8.116 ~all
✅ NEW: v=spf1 mx ip4:31.97.207.118 ~all
```

**Steps:**
1. Login to your DNS provider
2. Find the TXT record for `@` (root) with SPF value
3. **Edit** it (don't create new)
4. Change `54.90.8.116` to `31.97.207.118`
5. Save and wait 5-30 minutes

**Verify it worked:**
```bash
dig TXT chitbox.co +short
# Should show: "v=spf1 mx ip4:31.97.207.118 ~all"
```

---

## 📋 Quick Setup Summary

### ✅ What's Already Done

- ✅ PostgreSQL installed and configured locally
- ✅ Database `chitbox` created with user `chitbox_user`
- ✅ Backend `.env.production` configured (port 8001)
- ✅ Frontend `.env.production` configured (port 3002)
- ✅ Frontend `.env.local` created for development
- ✅ Postfix configured for `mail.chitbox.co`
- ✅ All DNS records correct **except SPF** (update above!)
- ✅ PTR record perfect: `31.97.207.118` → `mail.chitbox.co`

### 🔧 What You Need to Do

1. **Update SPF DNS record** (see above) ⚠️
2. **Build & start applications:**
   ```bash
   cd /home/ubuntu/htdocs/chitbox/chitbox
   
   # Build backend
   cd backend
   npm install
   npm run build
   cd ..
   
   # Build frontend
   cd frontend
   npm install
   npm run build
   cd ..
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Optional - Enable AI Features:**
   ```bash
   # Get API key from: https://platform.openai.com/api-keys
   nano backend/.env.production
   # Add: OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   # Then: pm2 restart chitbox-backend
   ```

---

## 🌐 Your Setup At A Glance

### Ports & URLs

| Component | Port | Access |
|-----------|------|--------|
| **Frontend** | 3002 | https://chitbox.co |
| **Backend API** | 8001 | https://chitbox.co/api |
| **PostgreSQL** | 5432 | localhost only |
| **SMTP (Send)** | 587 | localhost only |
| **SMTP (Receive)** | 2525 | localhost only |
| **Postfix** | 25 | Public (internet) |

### Database

```
Host: localhost
Port: 5432
Database: chitbox
User: chitbox_user
Password: ChitBox2025Secure!
```

### DNS Status

```
✅ MX:    mail.chitbox.co (priority 10)
✅ A:     mail.chitbox.co → 31.97.207.118
❌ SPF:   v=spf1 mx ip4:54.90.8.116 ~all (NEEDS UPDATE!)
✅ DKIM:  mail._domainkey.chitbox.co (configured)
✅ DMARC: _dmarc.chitbox.co (configured)
✅ PTR:   31.97.207.118 → mail.chitbox.co
```

---

## 🧪 Quick Tests

### Test Backend
```bash
curl http://localhost:8001/api/health
# Should return: {"status":"ok","database":"connected",...}
```

### Test Frontend
```bash
curl http://localhost:3002
# Should return HTML
```

### Test Database
```bash
sudo -u postgres psql -d chitbox -c "SELECT COUNT(*) FROM users;"
```

### Test Mail
```bash
# Check Postfix is running
sudo systemctl status postfix

# Check mail logs
sudo tail -20 /var/log/mail.log
```

### Check PM2 Status
```bash
pm2 list
pm2 logs
```

---

## 📧 Mail System Overview

### Sending Emails
```
User → ChitBox Backend → Postfix (587) → Internet
```

### Receiving Emails
```
Internet → Postfix (25) → ChitBox SMTP (2525) → Database → User
```

### Configuration
- **Send via:** localhost:587 (Postfix)
- **Receive on:** Port 2525 (ChitBox internal SMTP)
- **From address:** noreply@chitbox.co
- **Mail server:** mail.chitbox.co

---

## 🎨 Features

### Core Features
- ✅ User authentication & management
- ✅ Send & receive emails
- ✅ Email folders (inbox, sent, drafts, trash, etc.)
- ✅ Email threading
- ✅ Attachments
- ✅ Real-time updates (Socket.IO)
- ✅ Email queue with retry logic

### AI Features (Requires OpenAI API Key)
- ✨ Smart Compose
- 💬 Smart Reply
- 📝 Email Summarization
- 🧵 Thread Summarization
- 🎯 Priority Inbox
- 🎭 Tone Rewriter
- ✨ Polish, Elaborate, Shorten, Formalize
- ✅ Spell Check

---

## 🚨 Troubleshooting

### Backend won't start?
```bash
pm2 logs chitbox-backend
# Check for errors in database connection or port conflicts
```

### Frontend can't connect?
- Check CORS settings in `backend/.env.production`
- Verify reverse proxy configuration
- Test: `curl http://localhost:8001/api/health`

### Emails going to spam?
1. Update SPF record (see top of this guide)
2. Test with: https://www.mail-tester.com/
3. Check DKIM signing: https://dkimvalidator.com/

### Port already in use?
```bash
# Find what's using port 8001
sudo lsof -i :8001
# Kill it if needed
sudo kill -9 PID
```

---

## 📞 Need More Info?

See **CHITBOX_COMPLETE_SETUP_SUMMARY.md** for:
- Complete architecture details
- Full configuration reference
- Detailed troubleshooting
- Security best practices
- Testing procedures
- And much more!

---

## ✅ Deployment Checklist

- [ ] Update SPF DNS record
- [ ] Build backend (`npm run build`)
- [ ] Build frontend (`npm run build`)
- [ ] Start with PM2 (`pm2 start ecosystem.config.js`)
- [ ] Verify PM2 status (`pm2 list`)
- [ ] Test backend health
- [ ] Test frontend loads
- [ ] Send test email
- [ ] Receive test email
- [ ] Check mail-tester.com score
- [ ] Optional: Add OpenAI API key

---

**🎉 Once SPF is updated and apps are running, you're good to go!**

Questions? Check `CHITBOX_COMPLETE_SETUP_SUMMARY.md` for detailed documentation.

