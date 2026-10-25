# Auto-push script for EstateSense-AI
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Auto-Push Watcher Started for GitHub" -ForegroundColor Green
Write-Host "  Changes detect hote hi automatically push hoga!" -ForegroundColor Green
Write-Host "  Stop karne ke liye terminal me Ctrl + C dabayein" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

while ($true) {
    Start-Sleep -Seconds 5
    $status = (git status --porcelain)
    if ($status) {
        Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] Changes detect hue! 5 seconds me push ho raha hai..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        $timestamp = Get-Date -Format "dd-MM-yyyy HH:mm:ss"
        git add .
        git commit -m "Auto update: $timestamp"
        git push origin main
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Changes successfully GitHub par push ho gaye!`n" -ForegroundColor Green
    }
}
