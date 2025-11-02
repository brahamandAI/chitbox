# 🚨 PENDING DNS RECORDS - Add to GoDaddy

**Domain:** chitbox.co  
**Server IP:** 54.90.8.116

---

## ❌ MISSING DNS Records to Add

### 1. DKIM (DomainKeys Identified Mail) - **CRITICAL**

**Type:** TXT  
**Name:** `default._domainkey`  
**Value:** `"v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0fA+KfbCfhCIcKIbTUJlTBV0YOw/rAVGWoNws1rbamTbywLAKNySYetCZ9Kfgvml1Cs2MCxBEEKLO2okQMyuH34wuvYrVgOTHX/ifNWeHXJvAePPx0p9kgSdE5PWnm9slHj2lRGT3RFt0OhFr1hDQ3qqUYK1BKMxLxO20Wiu3n2De1MyDP+TaS9V0pLMjOhc83JDhT11AIsbH4DHE+1DcYG8JpAUbO80bo+YYMZZ/FA/Aie8OQif5lKX0qmBpGkbjXz7oqe2wYt52u0G0qMXfJA4a04zDutrHSVhPFerBuX4+j0NFrNjpuMqV2CVxU1iEzKCNG+E6fZDA07AbalQjQIDAQAB"`  
**TTL:** 3600 (1 hour)

**How to add in GoDaddy:**
1. Go to GoDaddy DNS Management
2. Click **Add**
3. **Type:** TXT
4. **Name:** `default._domainkey`
5. **Value:** Copy the entire value above (including quotes)
6. **TTL:** 1 Hour
7. **Save**

**Status:** ⚠️ **NOT ADDED YET** - Email will go to spam without this!

---

### 2. DMARC (Domain-based Message Authentication) - **RECOMMENDED**

**Type:** TXT  
**Name:** `_dmarc`  
**Value:** `"v=DMARC1; p=quarantine; rua=mailto:dmarc@chitbox.co; ruf=mailto:dmarc@chitbox.co; pct=100; adkim=s; aspf=s"`  
**TTL:** 3600 (1 hour)

**How to add in GoDaddy:**
1. Go to GoDaddy DNS Management
2. Click **Add**
3. **Type:** TXT
4. **Name:** `_dmarc`
5. **Value:** `v=DMARC1; p=quarantine; rua=mailto:dmarc@chitbox.co; ruf=mailto:dmarc@chitbox.co; pct=100; adkim=s; aspf=s`
6. **TTL:** 1 Hour
7. **Save**

**Status:** ⚠️ **NOT ADDED YET** - Important for email deliverability

---

## ✅ Already Added DNS Records (Verified Working)

### MX Record ✅
- **Type:** MX
- **Name:** @
- **Value:** `10 mail.chitbox.co.`
- **Status:** ✅ **WORKING**

### SPF Record ✅
- **Type:** TXT
- **Name:** @
- **Value:** `"v=spf1 mx ip4:54.90.8.116 ~all"`
- **Status:** ✅ **WORKING**

### A Record ✅
- **Type:** A
- **Name:** mail
- **Value:** `54.90.8.116`
- **Status:** ✅ **WORKING**

---

## 🔧 PTR Record (Reverse DNS) - **Set in AWS, NOT GoDaddy**

**Current Status:** ❌ `ec2-54-90-8-116.compute-1.amazonaws.com` (AWS default)  
**Should Be:** `mail.chitbox.co`

**How to Fix:**
1. Go to AWS Console → EC2 → Elastic IPs
2. Find IP: `54.90.8.116`
3. Select it → Actions → Update reverse DNS
4. Enter: `mail.chitbox.co`
5. Click Update

**OR if option not available:**
- Open AWS Support case requesting PTR record for IP 54.90.8.116
- Or follow guide in `AWS_PTR_SETUP_GUIDE.md`

---

## 📋 Quick Copy-Paste Summary for GoDaddy

### Record 1: DKIM (Add This!)
```
Type: TXT
Name: default._domainkey
Value: "v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0fA+KfbCfhCIcKIbTUJlTBV0YOw/rAVGWoNws1rbamTbywLAKNySYetCZ9Kfgvml1Cs2MCxBEEKLO2okQMyuH34wuvYrVgOTHX/ifNWeHXJvAePPx0p9kgSdE5PWnm9slHj2lRGT3RFt0OhFr1hDQ3qqUYK1BKMxLxO20Wiu3n2De1MyDP+TaS9V0pLMjOhc83JDhT11AIsbH4DHE+1DcYG8JpAUbO80bo+YYMZZ/FA/Aie8OQif5lKX0qmBpGkbjXz7oqe2wYt52u0G0qMXfJA4a04zDutrHSVhPFerBuX4+j0NFrNjpuMqV2CVxU1iEzKCNG+E6fZDA07AbalQjQIDAQAB"
TTL: 1 Hour
```

### Record 2: DMARC (Optional but Recommended)
```
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@chitbox.co; ruf=mailto:dmarc@chitbox.co; pct=100; adkim=s; aspf=s"
TTL: 1 Hour
```

---

## 🧪 How to Verify After Adding

After adding DKIM, wait 15-30 minutes, then run these commands:

```bash
# Check DKIM
dig TXT default._domainkey.chitbox.co +short
# Should show: "v=DKIM1; h=sha256; k=rsa; p=MIIBIj..."

# Check DMARC
dig TXT _dmarc.chitbox.co +short
# Should show: "v=DMARC1; p=quarantine..."

# Check PTR (from AWS)
dig -x 54.90.8.116 +short
# Should show: mail.chitbox.co (after AWS update)
```

---

## ⚠️ CRITICAL NOTES

1. **DKIM is ESSENTIAL** - Without it, emails will be marked as spam
2. **TTL of 1 hour** is recommended for faster changes
3. **Wait 24-48 hours** for full DNS propagation worldwide
4. **PTR must be set in AWS** - GoDaddy cannot set PTR records

---

## 📞 Need Help?

- **DKIM guide:** https://www.dmarcanalyzer.com/what-is-dkim/
- **DMARC guide:** https://dmarc.org/wiki/FAQ
- **PTR setup:** See `AWS_PTR_SETUP_GUIDE.md`

---

**Priority Order:**
1. ✅ Add DKIM record (CRITICAL)
2. ✅ Set PTR in AWS (IMPORTANT)
3. ⚠️ Add DMARC record (RECOMMENDED)

---

Generated: November 1, 2025

