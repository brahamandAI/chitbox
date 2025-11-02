# AWS PTR (Reverse DNS) Setup Guide for chitbox.co Mail Server

## ✅ DNS Records Status (GoDaddy)

Your DNS records are properly configured and propagated:

- ✅ **MX Record**: `10 mail.chitbox.co.` 
- ✅ **SPF Record**: `v=spf1 mx ip4:54.90.8.116 ~all`
- ⚠️ **DKIM Record**: Not propagated yet (may take up to 24-48 hours)
- ✅ **A Record**: `mail.chitbox.co` → `54.90.8.116`

Current PTR: `ec2-54-90-8-116.compute-1.amazonaws.com.` (needs update to `mail.chitbox.co`)

---

## 🔧 How to Set PTR Record in AWS

### Option 1: AWS Console (if available for your region)

1. **Go to EC2 Dashboard**
   - Sign in to AWS Console: https://console.aws.amazon.com/ec2/
   - Select region: **US East (N. Virginia)** `us-east-1`

2. **Navigate to Elastic IPs**
   - Left sidebar: Network & Security → **Elastic IPs**
   - Find IP: `54.90.8.116`

3. **Set Reverse DNS**
   - Select the Elastic IP
   - Click **Actions** → **Update reverse DNS**
   - Enter reverse DNS name: `mail.chitbox.co`
   - Click **Update**

4. **Verify**
   ```bash
   dig -x 54.90.8.116 +short
   # Should return: mail.chitbox.co.
   ```

---

### Option 2: AWS Support Request (if Option 1 not available)

If the "Update reverse DNS" option is not available in your console:

1. **Open AWS Support Center**
   - Go to: https://console.aws.amazon.com/support/home
   - Click **Create case**

2. **Case Details**
   - **Case type**: Service limit increase
   - **Limit type**: EC2 Instances
   - **Use case description**:
     ```
     I need to set reverse DNS (PTR record) for my Elastic IP to send emails from my mail server.
     
     Elastic IP: 54.90.8.116
     Instance ID: [your-instance-id - find in EC2 console]
     Region: us-east-1
     Desired PTR Record: mail.chitbox.co
     
     This is for my legitimate mail server chitbox.co.
     ```

3. **Submit and Wait**
   - AWS typically responds within 24 hours
   - They will set the PTR for you

---

### Option 3: AWS CLI (fastest if you have CLI configured)

```bash
# Get your Elastic IP allocation ID
aws ec2 describe-addresses --public-ips 54.90.8.116 --region us-east-1

# Set reverse DNS (replace ALLOCATION_ID with value from above)
aws ec2 modify-address-attribute \
  --allocation-id <ALLOCATION_ID> \
  --domain-name mail.chitbox.co \
  --region us-east-1

# Verify
dig -x 54.90.8.116 +short
```

---

## 🔒 Additional AWS Security Group Check

Ensure your EC2 Security Group allows these ports:

### Inbound Rules
- **Port 25** (SMTP) - TCP - 0.0.0.0/0
- **Port 587** (Submission) - TCP - 0.0.0.0/0
- **Port 143** (IMAP) - TCP - 0.0.0.0/0
- **Port 993** (IMAPS - optional) - TCP - 0.0.0.0/0

### Outbound Rules
- **Port 25** (SMTP) - TCP - 0.0.0.0/0
- **Port 587** (Submission) - TCP - 0.0.0.0/0

### How to Check/Add:
1. EC2 Dashboard → Instances → Select your instance
2. Security tab → Click on Security Group
3. Edit Inbound/Outbound rules
4. Add missing ports

---

## ⚠️ AWS Port 25 Throttling

AWS throttles outbound port 25 by default. To send emails reliably:

### Option A: Request Port 25 Removal (Recommended)
1. Go to: https://aws.amazon.com/forms/ec2-email-limit-rdns-request
2. Fill out form:
   - **Email address**: Your AWS account email
   - **Use case**: Legitimate transactional email for chitbox.co mail server
   - **Elastic IP**: 54.90.8.116
   - **Reverse DNS**: mail.chitbox.co
   - **Describe use case**: Brief description of your mail service
3. AWS usually approves within 24-48 hours

### Option B: Use Port 587 Only (Immediate)
- Your Postfix is already configured for port 587
- Most modern mail servers accept 587
- No AWS restriction on 587

---

## 📋 Backend Configuration Summary

✅ Updated `/home/chitbox/htdocs/chitbox.co/chitbox/backend/.env.production`:

```env
PORT=8001
NODE_ENV=production
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FROM=noreply@chitbox.co
CORS_ORIGIN=http://localhost:3002,https://chitbox.co
```

---

## 🧪 Test Mail Delivery (After PTR is Set)

```bash
# Test from command line
echo "Test email from chitbox.co" | mail -s "Test Subject" your-email@gmail.com

# Check mail logs
sudo tail -f /var/log/mail.log

# Test SMTP connection
telnet localhost 587

# Test your app's mail sending via backend API
```

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Postfix (SMTP) | ✅ Running | Port 25, 587 |
| Dovecot (IMAP) | ✅ Running | Port 143 |
| OpenDKIM | ✅ Running | Keys generated |
| Backend Port | ✅ 8001 | Updated in .env.production |
| Frontend Port | ✅ 3002 | Configured in ecosystem.config.js |
| CORS | ✅ Configured | localhost:3002 + chitbox.co |
| MX Record | ✅ Propagated | mail.chitbox.co |
| SPF Record | ✅ Propagated | Includes your IP |
| DKIM Record | ⏳ Pending | Wait 24-48h for DNS |
| PTR Record | ❌ Needs Setup | Follow guide above |
| AWS SG Ports | ⚠️ Check | Verify 25,587,143 |
| AWS Port 25 | ⚠️ Likely Throttled | Request removal or use 587 |

---

## 🚀 Next Steps

1. ✅ DNS records added to GoDaddy (done)
2. ✅ Backend .env.production updated (done)
3. ⏳ **Set PTR record in AWS** (follow Option 1, 2, or 3 above)
4. ⏳ **Verify AWS Security Group** allows ports 25, 587, 143
5. ⏳ **Request AWS Port 25 throttle removal** (optional but recommended)
6. ⏳ Wait for DKIM DNS propagation (24-48 hours)
7. ⏳ Restart backend: `pm2 restart chitbox-backend`
8. ⏳ Test email sending from your app

---

## 🆘 Troubleshooting

### Email not sending?
```bash
# Check Postfix
sudo systemctl status postfix
sudo tail -50 /var/log/mail.log

# Check if port 25 is throttled by AWS
telnet smtp.gmail.com 25
# If connection refused/timeout → AWS throttling (use 587 or request removal)
```

### Backend not connecting?
```bash
# Check backend is running on 8001
pm2 list
netstat -tlnp | grep 8001

# Check logs
pm2 logs chitbox-backend --lines 50
```

### Frontend can't reach backend?
- Development: Frontend should connect to `http://localhost:8001`
- Production: Ensure reverse proxy (nginx/apache) forwards to 8001
- Check CORS in browser console

---

## 📞 Need Help?

- PTR not working after 24 hours → Open AWS support case
- DKIM not propagating → Wait 48 hours, then check GoDaddy DNS
- Port 25 blocked → Request removal or stick with 587

---

Generated: 2025-10-29
Server IP: 54.90.8.116
Domain: chitbox.co
Mail Server: mail.chitbox.co

