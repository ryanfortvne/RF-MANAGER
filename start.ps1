Write-Host "🚀 Profit Manager STARTING..." -ForegroundColor Green
Set-Location "C:\RF MANAGER"

# Restore data
`$Latest = Get-ChildItem "backups\*.json" | Sort LastWriteTime -Descending | Select -First 1
if (`$Latest) { Copy-Item `$Latest.FullName "data\app-state.json" -Force }

# Start dev server
Start-Process powershell "-NoExit -Command `"npm run dev`""
Start-Sleep 8
Start-Process msedge "http://localhost:5173"
Write-Host "✅ READY! Data restored." -ForegroundColor Green
pause
