# ChitBox - Avoiding Spam Folder Guide

## 🎯 Why Emails Go to Spam

Your DNS records are perfect (SPF, DKIM, DMARC, PTR), but Gmail/Yahoo/Outlook use **sender reputation** which takes time to build.

---

## ✅ **Immediate Fixes Applied:**

### 1. **Improved Email Headers**
- ✅ Added `List-Unsubscribe` header
- ✅ Added `Importance: normal`
- ✅ Better `Message-ID` format
- ✅ Proper `Return-Path`
- ✅ Added tracking headers

### 2. **DKIM Signing**
OpenDKIM is active and signing all outgoing emails.

---

## 📧 **Domain Warm-Up Strategy (CRITICAL)**

### **Why Warming Up Matters:**
- New domains have **ZERO reputation**
- Gmail treats unknown senders with suspicion
- Reputation builds over **2-4 weeks**

### **Week 1: Build Foundation**
```
Day 1-2:   Send 5-10 emails/day
Day 3-4:   Send 15-20 emails/day
Day 5-7:   Send 30-50 emails/day
```

### **Week 2: Gradual Increase**
```
Day 8-10:  Send 100-150 emails/day
Day 11-14: Send 200-300 emails/day
```

### **Week 3-4: Scale Up**
```
Day 15-21: Send 500-800 emails/day
Day 22-30: Send 1000+ emails/day
```

---

## 🔧 **Best Practices to Follow:**

### 1. **Email Content Tips**
```
✅ DO:
- Use plain text AND HTML versions
- Include your full name and company
- Add physical address in footer
- Keep subject lines under 50 characters
- Personalize emails when possible

❌ DON'T:
- Use ALL CAPS in subject
- Use excessive exclamation marks!!!
- Include too many links (max 2-3)
- Use spam trigger words: "FREE", "URGENT", "BUY NOW"
- Send identical emails repeatedly
```

### 2. **Engagement Metrics**
```
Gmail watches:
- Open rates (aim for >20%)
- Reply rates (higher = better)
- Spam reports (keep <0.1%)
- Unsubscribe rates (keep <0.5%)
```

### 3. **Technical Setup**
```bash
# Verify DKIM is signing
sudo opendkim-testkey -d chitbox.co -s mail -vvv

# Should show: "key OK"
```

---

## 🎯 **Action Plan for Next 30 Days:**

### **Immediate (Today):**
1. ✅ Email headers improved (done)
2. Send test email to: https://www.mail-tester.com/
3. Check score (should be 9-10/10)
4. Mark emails as "Not Spam" in Gmail

### **Day 1-7: Foundation**
```
- Send 5-10 emails per day
- Send to people you know
- Ask them to reply (builds engagement)
- Add to Gmail contacts
- DO NOT send mass emails yet
```

### **Day 8-14: Gradual Increase**
```
- Increase to 50-100 emails/day
- Mix of personal and business emails
- Monitor Gmail Postmaster Tools
- Keep content varied
```

### **Day 15-30: Scale Up**
```
- Increase to 200-500 emails/day
- Watch for spam complaints
- Maintain high engagement
- Full production use ready
```

---

## 🔍 **Monitoring Tools:**

### 1. **Gmail Postmaster Tools**
```
Sign up at: https://postmaster.google.com/
Add domain: chitbox.co

Monitor:
- IP reputation
- Domain reputation
- Spam rate
- Feedback loop
```

### 2. **Email Testing**
```
- Mail Tester: https://www.mail-tester.com/
- DKIM Validator: https://dkimvalidator.com/
- MX Toolbox: https://mxtoolbox.com/SuperTool.aspx
```

### 3. **Check Your Score**
```bash
# Send test email to Mail Tester
# Should score 9-10/10

# Check DKIM signature
dig +short TXT mail._domainkey.chitbox.co
```

---

## 🚨 **Emergency Spam Rescue:**

### **If emails are in spam folder:**

1. **Ask recipients to:**
   ```
   - Mark as "Not Spam"
   - Add sender to contacts
   - Reply to the email
   - Star the email
   ```

2. **Improve email content:**
   ```
   - Add personal greeting
   - Include recipient's name
   - Make content unique (not template)
   - Add your signature with contact info
   ```

3. **Reduce sending volume:**
   ```
   - Cut sending by 50%
   - Focus on engagement
   - Wait 3-5 days
   - Gradually increase again
   ```

---

## 📊 **How to Check Your Current Status:**

### **Test Email Deliverability:**
```bash
# 1. Send test to Mail Tester
Visit: https://www.mail-tester.com/
Copy the test email address
Send from ChitBox
Check your score

# 2. Check DKIM
curl -s https://dkimvalidator.com/
# Send email to the address shown

# 3. Verify DNS
cd /home/chitbox/htdocs/chitbox.co/chitbox
./verify-dns-setup.sh
```

### **Expected Scores:**
```
✅ Mail-Tester: 9-10/10
✅ DKIM: Valid signature
✅ SPF: Pass
✅ DMARC: Pass
✅ DNS: All records present
```

---

## 💡 **Pro Tips:**

### 1. **Content Formatting**
```html
<!-- Good email structure -->
<html>
  <body>
    <p>Hi [Name],</p>
    <p>[Personal message]</p>
    <p>Best regards,<br>
    [Your Name]<br>
    [Your Company]</p>
    <p style="font-size:10px; color:#999;">
      [Company Address]<br>
      <a href="unsubscribe-link">Unsubscribe</a>
    </p>
  </body>
</html>
```

### 2. **Subject Line Best Practices**
```
✅ Good:
- "Quick question about [topic]"
- "Following up on our conversation"
- "[Name], here's what you requested"

❌ Bad:
- "FREE MONEY!!!"
- "URGENT: ACT NOW"
- "You won't believe this..."
```

### 3. **Timing**
```
Best times to send:
- Tuesday-Thursday
- 9 AM - 11 AM local time
- Avoid weekends
- Avoid late nights
```

---

## 🎯 **Quick Checklist:**

Before sending each email campaign:

- [ ] Test email score >9/10
- [ ] Subject line <50 characters
- [ ] No spam trigger words
- [ ] Unsubscribe link included
- [ ] Physical address in footer
- [ ] Plain text + HTML versions
- [ ] Personalization added
- [ ] Links tested
- [ ] Sender name clear
- [ ] Not sending during warmup limit

---

## 📞 **Support Resources:**

- **Mail Tester**: https://www.mail-tester.com/
- **Gmail Postmaster**: https://postmaster.google.com/
- **DKIM Validator**: https://dkimvalidator.com/
- **MX Toolbox**: https://mxtoolbox.com/

---

## 🎉 **Success Criteria:**

After 30 days of following this guide:

✅ Mail-Tester score: 10/10  
✅ Gmail inbox delivery: >95%  
✅ Spam rate: <0.1%  
✅ Sender reputation: Good  
✅ DKIM validation: 100%  

**Be patient! Reputation building takes time but following this guide will get you there!** 🚀

