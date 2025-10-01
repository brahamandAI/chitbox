@echo off
echo Starting PostgreSQL with Docker...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Start PostgreSQL container
echo Starting PostgreSQL container...
docker run -d ^
  --name chitbox-postgres ^
  -e POSTGRES_DB=chitbox ^
  -e POSTGRES_USER=chitbox_user ^
  -e POSTGRES_PASSWORD=chitbox_password ^
  -p 5432:5432 ^
  postgres:15

if %errorlevel% equ 0 (
    echo.
    echo ✅ PostgreSQL started successfully!
    echo.
    echo Database Details:
    echo   Host: localhost
    echo   Port: 5432
    echo   Database: chitbox
    echo   Username: chitbox_user
    echo   Password: chitbox_password
    echo.
    echo You can now run: npm run test:db
) else (
    echo.
    echo ❌ Failed to start PostgreSQL
    echo Make sure Docker is running and port 5432 is available
)

pause
