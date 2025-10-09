#!/bin/bash

# ChitBox DNS Verification Script
# Run this after Hostinger sets up your PTR record

echo "🔍 ChitBox DNS Setup Verification"
echo "=================================="
echo ""

DOMAIN="chitbox.co"
IP="31.97.207.118"
MAIL_HOST="mail.chitbox.co"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Checking DNS Records for $DOMAIN${NC}"
echo ""

# 1. Check SPF Record
echo -e "${YELLOW}1. SPF Record:${NC}"
SPF_RESULT=$(dig +short TXT $DOMAIN | grep -i "v=spf1")
if [[ $SPF_RESULT == *"v=spf1"* ]]; then
    echo -e "${GREEN}✅ SPF Record Found${NC}"
    echo "   $SPF_RESULT"
else
    echo -e "${RED}❌ SPF Record Missing${NC}"
fi
echo ""

# 2. Check DKIM Record
echo -e "${YELLOW}2. DKIM Record:${NC}"
DKIM_RESULT=$(dig +short TXT mail._domainkey.$DOMAIN)
if [[ $DKIM_RESULT == *"v=DKIM1"* ]]; then
    echo -e "${GREEN}✅ DKIM Record Found${NC}"
    echo "   $DKIM_RESULT"
else
    echo -e "${RED}❌ DKIM Record Missing${NC}"
fi
echo ""

# 3. Check DMARC Record
echo -e "${YELLOW}3. DMARC Record:${NC}"
DMARC_RESULT=$(dig +short TXT _dmarc.$DOMAIN)
if [[ $DMARC_RESULT == *"v=DMARC1"* ]]; then
    echo -e "${GREEN}✅ DMARC Record Found${NC}"
    echo "   $DMARC_RESULT"
else
    echo -e "${RED}❌ DMARC Record Missing${NC}"
fi
echo ""

# 4. Check MX Record
echo -e "${YELLOW}4. MX Record:${NC}"
MX_RESULT=$(dig +short MX $DOMAIN)
if [[ $MX_RESULT == *"$MAIL_HOST"* ]]; then
    echo -e "${GREEN}✅ MX Record Found${NC}"
    echo "   $MX_RESULT"
else
    echo -e "${RED}❌ MX Record Missing${NC}"
fi
echo ""

# 5. Check PTR Record (Reverse DNS)
echo -e "${YELLOW}5. PTR Record (Reverse DNS):${NC}"
PTR_RESULT=$(dig +short -x $IP)
if [[ $PTR_RESULT == *"$MAIL_HOST"* ]]; then
    echo -e "${GREEN}✅ PTR Record Found${NC}"
    echo "   $IP → $PTR_RESULT"
else
    echo -e "${RED}❌ PTR Record Missing${NC}"
    echo "   Current: $PTR_RESULT"
    echo "   Expected: $MAIL_HOST"
    echo ""
    echo -e "${YELLOW}⚠️  CONTACT HOSTINGER SUPPORT:${NC}"
    echo "   Request PTR record: $IP → $MAIL_HOST"
fi
echo ""

# 6. Overall Status
echo -e "${YELLOW}📊 Overall DNS Status:${NC}"
ALL_GOOD=true

if [[ $SPF_RESULT != *"v=spf1"* ]]; then ALL_GOOD=false; fi
if [[ $DKIM_RESULT != *"v=DKIM1"* ]]; then ALL_GOOD=false; fi
if [[ $DMARC_RESULT != *"v=DMARC1"* ]]; then ALL_GOOD=false; fi
if [[ $MX_RESULT != *"$MAIL_HOST"* ]]; then ALL_GOOD=false; fi
if [[ $PTR_RESULT != *"$MAIL_HOST"* ]]; then ALL_GOOD=false; fi

if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}🎉 All DNS records are properly configured!${NC}"
    echo -e "${GREEN}✅ Your emails should deliver successfully to Gmail, Yahoo, and Outlook${NC}"
else
    echo -e "${YELLOW}⚠️  Some DNS records need attention${NC}"
    echo -e "${YELLOW}📧 Email delivery may be affected until all records are set${NC}"
fi

echo ""
echo -e "${YELLOW}🔗 Additional Testing:${NC}"
echo "• Mail Tester: https://www.mail-tester.com/"
echo "• DNS Checker: https://mxtoolbox.com/"
echo "• DKIM Validator: https://dkimvalidator.com/"

echo ""
echo -e "${YELLOW}📞 Contact Information:${NC}"
echo "• DNS Records: GoDaddy (already configured ✅)"
echo "• PTR Record: Hostinger VPS Support"
echo "• Live Chat: https://hostinger.com"
echo "• Support Ticket: Your Hostinger Control Panel"
echo ""
echo -e "${YELLOW}💡 Note: PTR records are managed by your VPS provider (Hostinger),${NC}"
echo -e "${YELLOW}   not your DNS provider (GoDaddy)${NC}"
echo ""
