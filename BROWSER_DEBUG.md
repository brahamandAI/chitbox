# 🔍 ChitBox Browser Debugging Guide

## Problem: Click on Sign In/Register does NOTHING

This means React isn't fully loading or the JavaScript is failing silently.

---

## ✅ **Step 1: Check JavaScript Console**

### **Open Developer Tools:**
1. Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. Click on the **Console** tab
3. Look for **ANY** red errors

### **Common Errors:**

| Error | Meaning | Fix |
|-------|---------|-----|
| `Uncaught ReferenceError` | JavaScript not loading | Rebuild needed |
| `Hydration failed` | Server/client mismatch | Clear cache + reload |
| `Failed to fetch` | Can't reach backend | Backend not accessible |
| `CORS policy` | Wrong CORS config | Backend .env wrong |

---

## ✅ **Step 2: Check Network Tab**

### **In Developer Tools:**
1. Click **Network** tab
2. **Refresh the page** (F5)
3. Look at the requests

### **What to check:**

**Should see these files loading:**
- ✅ `page-560d35fe12f49362.js` (or similar)
- ✅ `webpack-xxx.js`
- ✅ `main-app-xxx.js`

**Check their status:**
- ✅ All should be `200 OK`
- ❌ If any show `404` or `500` → rebuild needed

---

## ✅ **Step 3: Check Environment Variables**

### **In Browser Console, type:**
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Socket URL:', process.env.NEXT_PUBLIC_SOCKET_URL);
```

### **Expected output:**
```
API URL: https://chitbox.co:3005/api
Socket URL: https://chitbox.co:3005
```

### **If you see `undefined`:**
The environment variables weren't baked into the build. Rebuild needed!

---

## ✅ **Step 4: Test JavaScript Execution**

### **In Browser Console, type:**
```javascript
console.log('React version:', React.version);
```

**If you see an error:** React isn't loading at all!

---

## ✅ **Step 5: Force Reload**

Sometimes the browser caches old files.

### **Clear cache and hard reload:**
- **Windows/Linux:** `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`

Then try clicking Sign In again.

---

## ✅ **Step 6: Check if Page is Still "Loading"**

### **Look at the page:**

**If you see:**
```
ChitBox
Loading your modern email experience...
```

**This means:** The React app is stuck in the "loading" state.

### **In Browser Console, type:**
```javascript
// Check local storage
console.log('User:', localStorage.getItem('user'));
console.log('Token:', localStorage.getItem('token'));
```

**If there's old data:** Clear it!
```javascript
localStorage.clear();
location.reload();
```

---

## 🔧 **Quick Fixes to Try:**

### **Fix 1: Clear Browser Cache**
1. Open DevTools (F12)
2. Right-click the reload button
3. Choose "Empty Cache and Hard Reload"

### **Fix 2: Clear Local Storage**
**In Browser Console:**
```javascript
localStorage.clear();
location.reload();
```

### **Fix 3: Test in Incognito/Private Window**
This will tell us if it's a caching issue.

---

## 🚨 **Most Likely Issues:**

### **Issue 1: React App Not Hydrating**

**Symptoms:**
- Page loads HTML
- No console errors
- Clicks do nothing
- Stuck on loading screen

**Solution:**
```bash
cd /home/chitbox/htdocs/chitbox.co/chitbox/frontend
rm -rf .next
NEXT_PUBLIC_API_URL="https://chitbox.co:3005/api" \
NEXT_PUBLIC_SOCKET_URL="https://chitbox.co:3005" \
NODE_ENV=production \
npm run build

pm2 restart chitbox-frontend
```

### **Issue 2: JavaScript Files 404**

**Symptoms:**
- Network tab shows red 404s
- JavaScript files not loading
- Console shows "Failed to load resource"

**Solution:**
Check if `.next` folder exists and has files:
```bash
ls -lh /home/chitbox/htdocs/chitbox.co/chitbox/frontend/.next/static/chunks/
```

If empty or missing, rebuild:
```bash
cd /home/chitbox/htdocs/chitbox.co/chitbox/frontend
npm run build
pm2 restart chitbox-frontend
```

### **Issue 3: Old Cached Version**

**Symptoms:**
- Everything looks correct in server
- But browser shows old version
- Hard reload doesn't help

**Solution:**
```javascript
// In browser console:
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
location.reload(true);
```

---

## 📊 **Complete Debug Report:**

### **Run these in Browser Console and send me the output:**

```javascript
// 1. Check environment
console.log('Environment:', {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
  nodeEnv: process.env.NODE_ENV
});

// 2. Check React
console.log('React loaded:', typeof React !== 'undefined');

// 3. Check local storage
console.log('Storage:', {
  user: localStorage.getItem('user'),
  token: localStorage.getItem('token')
});

// 4. Check if app mounted
console.log('App root:', document.querySelector('#__next') !== null);

// 5. Try to click programmatically
const button = document.querySelector('button');
console.log('Found button:', button !== null);
if (button) {
  console.log('Button text:', button.textContent);
  console.log('Button click handler:', button.onclick);
}
```

**Copy the entire output and let me know what you see!**

---

## 🎯 **Expected Behavior:**

When you visit https://chitbox.co:3004:

1. ✅ HTML loads instantly (shows loading spinner)
2. ✅ JavaScript files load (check Network tab)
3. ✅ React mounts/hydrates the app
4. ✅ App transitions from "loading" to "home" page
5. ✅ You see "Sign In" and "Get Started" buttons
6. ✅ Clicking buttons shows login/register forms

**If any step fails, we know where the problem is!**

---

## 🆘 **Report Back With:**

1. **What do you see on the page?**
   - Loading screen?
   - Homepage with buttons?
   - Blank page?

2. **Console tab (F12) - any red errors?**

3. **Network tab - any failed requests (red)?**

4. **Output of the debug script above**

This will tell us exactly what's wrong! 🔍

