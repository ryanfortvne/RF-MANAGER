`$BackupPath = "C:\RF MANAGER\backups"
`$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item "data\app-state.json" "`$BackupPath\backup-`$Timestamp.json" -Force
Stop-Process -Name "msedge","node" -ErrorAction SilentlyContinue -Force
Write-Host "💾 SAVED & CLOSED!" -ForegroundColor Green
pause
