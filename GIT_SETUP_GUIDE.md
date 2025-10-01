# Git Setup Guide for ChitBox

## ✅ Your .gitignore Files are Ready!

I've created comprehensive `.gitignore` files to protect your sensitive information:

### **Root .gitignore** (/)
- Environment files (`.env`, `.env.*`)
- Node modules
- Build outputs
- SSL certificates
- Database files
- Uploads folder
- IDE configurations

### **Backend .gitignore** (/backend)
- Environment variables
- Build outputs
- Uploads
- Logs

### **Frontend .gitignore** (/frontend)
- Next.js build files
- Environment variables
- Node modules

## 🚀 Initialize Git Repository

### **Step 1: Navigate to Project Directory**
```bash
cd C:\Users\Bharghav\OneDrive\Documents\chitbox
```

### **Step 2: Initialize Git (if not already done)**
```bash
git init
```

### **Step 3: Add All Files**
```bash
git add .
```

### **Step 4: Check What Will Be Committed**
```bash
git status
```

**Verify that these files are NOT listed:**
- ❌ `backend/.env`
- ❌ `backend/node_modules/`
- ❌ `frontend/.env`
- ❌ `frontend/node_modules/`
- ❌ `frontend/.next/`
- ❌ Any sensitive API keys or passwords

**Should be listed:**
- ✅ `backend/.env.example`
- ✅ `backend/supabase.env.example`
- ✅ `frontend/src/**/*`
- ✅ `backend/src/**/*`
- ✅ `.gitignore` files
- ✅ README files

### **Step 5: Make Your First Commit**
```bash
git commit -m "Initial commit: ChitBox Email Application with AI features"
```

### **Step 6: Add Remote Repository**

#### **If using GitHub:**
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chitbox.git
git push -u origin main
```

#### **If using GitLab:**
```bash
git branch -M main
git remote add origin https://gitlab.com/YOUR_USERNAME/chitbox.git
git push -u origin main
```

#### **If using Bitbucket:**
```bash
git branch -M main
git remote add origin https://bitbucket.org/YOUR_USERNAME/chitbox.git
git push -u origin main
```

## 🔒 Security Checklist Before Pushing

### **Critical: Verify These Are NOT Committed**

Run this command to check:
```bash
git ls-files | grep -E "(\.env$|\.env\.|password|secret|key|token)"
```

**Should return ONLY:**
- ✅ `backend/.env.example`
- ✅ `backend/supabase.env.example`
- ✅ `backend/env.example`
- ✅ `production.env.example`

**Should NOT return:**
- ❌ `backend/.env`
- ❌ Any file with actual passwords
- ❌ Any file with API keys

### **Double Check Environment Files**
```bash
# These files should exist but NOT be tracked by Git:
ls backend/.env                    # Should exist
git check-ignore backend/.env      # Should say "backend/.env" (ignored)

# These files should be tracked:
git check-ignore backend/env.example      # Should return nothing (tracked)
```

## 📝 What's Protected by .gitignore

### **Sensitive Files (Never Committed):**
- 🔒 `.env` files with real credentials
- 🔒 Database passwords
- 🔒 JWT secrets
- 🔒 SMTP passwords
- 🔒 Supabase keys
- 🔒 OpenAI API keys
- 🔒 SSL certificates

### **Build & Dependencies (Not Needed in Git):**
- 📦 `node_modules/`
- 📦 `.next/`
- 📦 `dist/`
- 📦 `build/`

### **User Content (Not in Git):**
- 📁 `uploads/`
- 📁 `temp/`
- 📁 `logs/`

## 🎯 Recommended Git Workflow

### **For New Features:**
```bash
# Create feature branch
git checkout -b feature/smtp-server

# Make changes
# ...

# Commit changes
git add .
git commit -m "Add custom SMTP server configuration"

# Push to remote
git push origin feature/smtp-server

# Create pull request on GitHub/GitLab
```

### **For Bug Fixes:**
```bash
git checkout -b fix/smart-reply-paste
# Make changes
git add .
git commit -m "Fix smart reply pasting into compose window"
git push origin fix/smart-reply-paste
```

## 📋 Useful Git Commands

### **Check Status:**
```bash
git status                  # See what's changed
git diff                    # See detailed changes
git log --oneline          # See commit history
```

### **Undo Changes:**
```bash
git restore <file>          # Undo changes to a file
git restore .               # Undo all changes
git reset HEAD~1           # Undo last commit (keep changes)
```

### **Update from Remote:**
```bash
git pull origin main       # Get latest changes
```

## 🌐 Create GitHub Repository

### **Step 1: Create Repository on GitHub**
1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `chitbox`
4. Description: "Modern AI-powered email application"
5. Visibility: Private (recommended) or Public
6. **Don't** initialize with README (you already have files)
7. Click "Create repository"

### **Step 2: Push Your Code**
```bash
git remote add origin https://github.com/YOUR_USERNAME/chitbox.git
git branch -M main
git push -u origin main
```

## ⚠️ Important Notes

### **Environment Setup for Collaborators**

Add this to your README:

```markdown
## Setup Instructions

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/supabase.env.example backend/.env
   ```
3. Update `backend/.env` with your:
   - Supabase connection string
   - JWT secret
   - SMTP credentials
4. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
5. Setup database:
   ```bash
   cd backend && node setup-supabase.js
   ```
6. Run the application:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend (new terminal)
   cd frontend && npm run dev
   ```
```

## 🎉 You're Ready to Push!

Your repository is now properly configured with:
- ✅ Comprehensive `.gitignore` files
- ✅ Example environment files (safe to commit)
- ✅ No sensitive data will be committed
- ✅ Clean project structure
- ✅ Ready for collaboration

**Safe to push to Git!** 🚀

---

**Pro Tip:** Always run `git status` before committing to ensure no sensitive files are included.
