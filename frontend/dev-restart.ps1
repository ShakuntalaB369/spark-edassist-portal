$port = 5173
Write-Host "Checking port $port..." -ForegroundColor Cyan
$procIds = netstat -ano | Select-String (":$port\s") | ForEach-Object { ($_.ToString().Trim() -split "\s+")[-1] } | Sort-Object -Unique
foreach ($procId in $procIds) {
    if ($procId -and $procId -ne "0") {
        try { Stop-Process -Id ([int]$procId) -Force -ErrorAction SilentlyContinue; Write-Host "Killed process $procId" -ForegroundColor Green } catch {}
    }
}
$cacheDir = Join-Path $PSScriptRoot "node_modules\.vite"
if (Test-Path $cacheDir) { Remove-Item -Recurse -Force $cacheDir; Write-Host "Cleared Vite cache" -ForegroundColor Yellow }
Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
npm run dev
