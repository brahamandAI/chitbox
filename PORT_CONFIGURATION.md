# Port Configuration - ChitBox

## ✅ Standardized Ports

**Frontend**: `3004`  
**Backend**: `3005`  
**SMTP Server**: `2525`

---

## Development Mode

### Backend (Port 3005)
**File**: `backend/.env`
```env
PORT=3005
CORS_ORIGIN=http://localhost:3004
```

### Frontend (Port 3004)
**File**: `frontend/package.json`
```json
"scripts": {
  "dev": "next dev --turbopack -p 3004"
}
```

**File**: `frontend/next.config.js`
```javascript
NEXT_PUBLIC_API_URL: 'http://localhost:3005/api'
NEXT_PUBLIC_SOCKET_URL: 'http://localhost:3005'
```

**File**: `frontend/src/lib/api.ts`
```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';
```

---

## Production Mode

### Backend (Port 3005)
**File**: `ecosystem.config.js`
```javascript
{
  name: 'chitbox-backend',
  env: {
    NODE_ENV: 'production',
    PORT: 3005,
    CORS_ORIGIN: 'https://chitbox.co'
  }
}
```

### Frontend (Port 3004)
**File**: `ecosystem.config.js`
```javascript
{
  name: 'chitbox-frontend',
  env: {
    NODE_ENV: 'production',
    PORT: 3004,
    NEXT_PUBLIC_API_URL: 'https://chitbox.co:3005/api',
    NEXT_PUBLIC_SOCKET_URL: 'https://chitbox.co:3005'
  }
}
```

---

## Quick Commands

### Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev    # Runs on port 3005

# Terminal 2 - Frontend  
cd frontend
npm run dev    # Runs on port 3004
```

### Production
```bash
# Build and start with PM2
cd /home/chitbox/htdocs/chitbox.co/chitbox
pm2 start ecosystem.config.js
pm2 save

# Backend: http://localhost:3005
# Frontend: http://localhost:3004
```

### Kill Ports (if needed)
```bash
# Kill backend port
lsof -ti:3005 | xargs kill -9

# Kill frontend port
lsof -ti:3004 | xargs kill -9
```

---

## Verification

✅ Backend .env: PORT=3005  
✅ Frontend package.json: -p 3004  
✅ Frontend next.config.js: localhost:3005  
✅ Frontend api.ts: localhost:3005/api  
✅ Ecosystem backend: PORT 3005  
✅ Ecosystem frontend: PORT 3004  
✅ CORS configured for port 3004  

**Status**: All configurations are consistent across development and production! 🎉

