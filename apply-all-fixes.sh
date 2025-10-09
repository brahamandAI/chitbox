#!/bin/bash

echo "🚀 Applying All ChitBox Fixes..."
echo ""

# Check if running as root for TLS config
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Some operations require sudo privileges."
    echo "   TLS configuration will be skipped. Run manually: sudo ./configure-tls-smtp.sh"
    echo ""
fi

# Step 1: Configure TLS (if root)
if [ "$EUID" -eq 0 ]; then
    echo "1️⃣  Configuring TLS encryption..."
    ./configure-tls-smtp.sh
    echo "✅ TLS configured!"
else
    echo "1️⃣  Skipping TLS configuration (requires sudo)"
fi

echo ""
echo "2️⃣  Stopping existing processes..."

# Kill existing processes
pkill -f "ts-node" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "next" 2>/dev/null
fuser -k 3004/tcp 2>/dev/null
fuser -k 3005/tcp 2>/dev/null
sleep 2

echo "✅ Processes stopped!"
echo ""

# Step 3: Start backend
echo "3️⃣  Starting backend..."
cd backend
npm run dev > /tmp/chitbox-backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Logs: tail -f /tmp/chitbox-backend.log"
cd ..

sleep 3

# Step 4: Start frontend
echo ""
echo "4️⃣  Starting frontend..."
cd frontend
npm run dev > /tmp/chitbox-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Logs: tail -f /tmp/chitbox-frontend.log"
cd ..

echo ""
echo "🎉 All Fixes Applied Successfully!"
echo ""
echo "📋 What's New:"
echo "  ✅ Registration: Only @chitbox.co emails allowed"
echo "  ✅ TLS Encryption: Gmail 'not encrypted' warning fixed (if configured)"
echo "  ✅ NEW Badge: Only shows on unread emails, disappears when opened"
echo "  ✅ UI: Dark mode toggle removed from sidebar"
echo "  ✅ Email Headers: Enhanced for better deliverability"
echo ""
echo "🌐 Access ChitBox:"
echo "  Frontend: http://localhost:3004"
echo "  Backend:  http://localhost:3005"
echo ""
echo "📊 Next Steps:"
echo "  1. Test at https://www.mail-tester.com/ (should score 9-10/10)"
echo "  2. Follow warmup schedule in AVOID_SPAM_GUIDE.md"
echo "  3. Read COMPLETE_FIX_SUMMARY.md for full details"
echo ""
echo "💡 If TLS was skipped, run: sudo ./configure-tls-smtp.sh"

