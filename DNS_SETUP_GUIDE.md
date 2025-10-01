# DNS Setup Guide for ChitBox SMTP Server

## 🎯 Overview
Configure DNS records for chitbox.co to support email delivery and web hosting.

## 📋 Required DNS Records

### **A Records (IPv4)**
```
Type: A
Name: @
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600

Type: A  
Name: www
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600

Type: A
Name: mail
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600

Type: A
Name: api
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600
```

### **MX Record (Mail Exchange)**
```
Type: MX
Name: @
Value: mail.chitbox.co
Priority: 10
TTL: 3600
```

### **TXT Records (Email Authentication)**
```
Type: TXT
Name: @
Value: "v=spf1 a mx ~all"
TTL: 3600

Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@chitbox.co"
TTL: 3600

Type: TXT
Name: mail._domainkey
Value: "v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY"
TTL: 3600
```

### **CNAME Records (Optional)**
```
Type: CNAME
Name: app
Value: chitbox.co
TTL: 3600

Type: CNAME
Name: admin
Value: chitbox.co
TTL: 3600
```

## 🔧 Step-by-Step Setup

### **Step 1: Access Your DNS Management**
1. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Navigate to DNS management or DNS settings
3. Find your domain: chitbox.co

### **Step 2: Add A Records**
Add these A records pointing to your VPS IP:

```
@          A    YOUR_VPS_IP    3600
www        A    YOUR_VPS_IP    3600  
mail       A    YOUR_VPS_IP    3600
api        A    YOUR_VPS_IP    3600
```

### **Step 3: Add MX Record**
```
@          MX   mail.chitbox.co    10    3600
```

### **Step 4: Add SPF Record**
```
@          TXT  "v=spf1 a mx ~all"    3600
```

### **Step 5: Add DMARC Record**
```
_dmarc     TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@chitbox.co"    3600
```

### **Step 6: Generate and Add DKIM Record**
On your VPS, generate DKIM keys:
```bash
# Install OpenDKIM
sudo apt install opendkim opendkim-tools -y

# Generate DKIM key
sudo mkdir -p /etc/opendkim/keys/chitbox.co
sudo opendkim-genkey -D /etc/opendkim/keys/chitbox.co -d chitbox.co -s mail
sudo chown opendkim:opendkim /etc/opendkim/keys/chitbox.co/mail.private
sudo chmod 600 /etc/opendkim/keys/chitbox.co/mail.private

# Get the public key
sudo cat /etc/opendkim/keys/chitbox.co/mail.txt
```

Add the DKIM record:
```
mail._domainkey    TXT    "v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY"    3600
```

## 🧪 Testing DNS Configuration

### **Test A Records**
```bash
dig chitbox.co
dig www.chitbox.co
dig mail.chitbox.co
```

### **Test MX Record**
```bash
dig MX chitbox.co
nslookup -type=MX chitbox.co
```

### **Test TXT Records**
```bash
dig TXT chitbox.co
dig TXT _dmarc.chitbox.co
dig TXT mail._domainkey.chitbox.co
```

### **Online DNS Checkers**
- [MXToolbox](https://mxtoolbox.com/)
- [DNSChecker](https://dnschecker.org/)
- [What's My DNS](https://whatsmydns.net/)

## 📧 Email Testing

### **Test SMTP Connection**
```bash
telnet mail.chitbox.co 587
# or
telnet mail.chitbox.co 25
```

### **Test Email Delivery**
```bash
# Send test email
echo "Test email body" | mail -s "Test Subject" your-email@gmail.com

# Check mail queue
sudo mailq

# Check logs
sudo tail -f /var/log/mail.log
```

### **Email Deliverability Test**
Use these tools to test email deliverability:
- [Mail Tester](https://www.mail-tester.com/)
- [MXToolbox Deliverability](https://mxtoolbox.com/deliverability/)

## 🚨 Common Issues & Solutions

### **Issue: DNS Not Propagating**
**Solution**: DNS propagation can take 24-48 hours. Check with multiple DNS checkers.

### **Issue: Emails Going to Spam**
**Solutions**:
1. Ensure SPF record is correct
2. Add DKIM authentication
3. Configure DMARC policy
4. Use dedicated IP for sending
5. Warm up your IP reputation

### **Issue: SMTP Connection Refused**
**Solutions**:
1. Check firewall settings (ports 25, 587, 465)
2. Verify Postfix is running
3. Check DNS MX record
4. Ensure port forwarding is configured

### **Issue: SSL Certificate Issues**
**Solutions**:
1. Verify domain DNS is pointing to VPS
2. Check if ports 80 and 443 are open
3. Ensure Nginx is configured correctly
4. Try certbot renew

## 📊 DNS Propagation Timeline

| Record Type | Typical Propagation Time |
|-------------|-------------------------|
| A Records   | 5-30 minutes           |
| MX Records  | 1-24 hours             |
| TXT Records | 5 minutes - 2 hours    |
| CNAME       | 5-30 minutes           |

## 🔍 Verification Checklist

- [ ] A records pointing to correct VPS IP
- [ ] MX record pointing to mail.chitbox.co
- [ ] SPF record configured
- [ ] DKIM record added (if using)
- [ ] DMARC record configured
- [ ] SSL certificate obtained
- [ ] SMTP server responding on ports 25/587
- [ ] Email delivery working
- [ ] Web application accessible
- [ ] DNS propagation complete

## 🛠️ Advanced Configuration

### **Multiple MX Records (Redundancy)**
```
@    MX    mail1.chitbox.co    10    3600
@    MX    mail2.chitbox.co    20    3600
```

### **Subdomain Email**
```
support    MX    mail.chitbox.co    10    3600
sales      MX    mail.chitbox.co    10    3600
```

### **CAA Records (Certificate Authority Authorization)**
```
@    CAA    0 issue "letsencrypt.org"
@    CAA    0 issuewild "letsencrypt.org"
```

---

## 🎯 Quick Setup Summary

1. **Add A Records**: Point @, www, mail, api to your VPS IP
2. **Add MX Record**: Point @ to mail.chitbox.co
3. **Add SPF Record**: "v=spf1 a mx ~all"
4. **Add DMARC Record**: Basic quarantine policy
5. **Test Everything**: Use online tools to verify
6. **Wait for Propagation**: Up to 24-48 hours
7. **Test Email**: Send and receive test emails

Your ChitBox email application with custom SMTP server will be ready! 🚀
