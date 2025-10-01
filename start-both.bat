@echo off
echo Starting ChitBox (Frontend + Backend)...
echo.

echo Starting Backend...
start "ChitBox Backend" cmd /k "cd backend && npm run dev"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "ChitBox Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Note: If frontend shows port 3001, it means port 3000 is in use.
echo The frontend will automatically use the next available port.
echo.
echo Press any key to close this window...
pause >nul
