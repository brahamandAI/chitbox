Write-Host "🚀 Starting ChitBox..." -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "📡 Starting Backend on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "✅ ChitBox is starting!" -ForegroundColor Green
Write-Host "📡 Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🎨 Frontend: http://localhost:3000 (or next available port)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
