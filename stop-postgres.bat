@echo off
echo Stopping PostgreSQL container...
echo.

docker stop chitbox-postgres
docker rm chitbox-postgres

echo ✅ PostgreSQL container stopped and removed
pause
