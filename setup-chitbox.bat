@echo off
echo 🚀 Setting up ChitBox Email Application...
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if PostgreSQL is installed
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL is not installed. Please install PostgreSQL first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!

REM Setup Backend
echo.
echo 📦 Setting up Backend...
cd backend

REM Install dependencies
if not exist "node_modules" (
    echo    Installing backend dependencies...
    npm install
)

REM Setup database
echo    Setting up database...
node setup-database-with-auth.js

REM Setup Frontend
echo.
echo 📦 Setting up Frontend...
cd ..\frontend

REM Install dependencies
if not exist "node_modules" (
    echo    Installing frontend dependencies...
    npm install
)

echo.
echo ✅ Setup completed successfully!
echo.
echo 🎯 To start the application:
echo    1. Backend:  cd backend ^&^& npm run dev
echo    2. Frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 Application URLs:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001
echo.
echo 🧪 To test authentication:
echo    cd frontend ^&^& node test-auth.js
echo.
echo 📚 Documentation:
echo    See AUTHENTICATION_SETUP.md for detailed setup instructions
echo.
echo Happy coding! 🚀
pause
