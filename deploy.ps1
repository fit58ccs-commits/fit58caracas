# deploy.ps1 — Push, espera deployment y asigna dominio automaticamente
param([string]$msg = "")

if ($msg -eq "") {
    $msg = Read-Host "Mensaje del commit"
}
if ($msg -eq "") {
    Write-Host "Mensaje vacio, cancelado." -ForegroundColor Red
    exit 1
}

# 1. Commit y push
git add -A
git commit -m "$msg"
git push origin master

# 2. Esperar que Vercel empiece
Write-Host "`nEsperando que Vercel inicie el deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 3. Buscar deployment listo (max 2 minutos)
$maxWait  = 120
$waited   = 0
$interval = 10
$url      = ""

while ($waited -lt $maxWait) {
    $lines       = vercel ls fit58caracas 2>&1
    $previewLine = $lines | Where-Object { $_ -match "Preview" } | Select-Object -First 1
    $candidate   = ($previewLine -split '\s+') | Where-Object { $_ -like "https://*" } | Select-Object -First 1
    $isReady     = $previewLine -match "Ready"

    if ($candidate -and $isReady) {
        $url = $candidate
        break
    }

    Write-Host "  Deployment en progreso... ($waited s)" -ForegroundColor Gray
    Start-Sleep -Seconds $interval
    $waited += $interval
}

# 4. Asignar dominio
if ($url) {
    Write-Host "Asignando $url a produccion..." -ForegroundColor Cyan
    vercel alias $url fit58caracas.vercel.app
    Write-Host "`nListo. https://fit58caracas.vercel.app actualizado." -ForegroundColor Green
} else {
    Write-Host "`nTimeout. Asigna manualmente con:" -ForegroundColor Red
    Write-Host "  vercel ls fit58caracas" -ForegroundColor Yellow
    Write-Host "  vercel alias <URL> fit58caracas.vercel.app" -ForegroundColor Yellow
}
