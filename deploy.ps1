# deploy.ps1 — Push y apunta produccion al ultimo deployment
param([string]$msg = "")

if ($msg -eq "") {
    $msg = Read-Host "Mensaje del commit"
}

if ($msg -eq "") {
    Write-Host "Mensaje vacio, cancelado." -ForegroundColor Red
    exit 1
}

git add -A
git commit -m "$msg"
git push origin master

Write-Host "Esperando deployment (45s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

$lines = vercel ls fit58caracas 2>&1
$previewLine = $lines | Where-Object { $_ -match "Preview" } | Select-Object -First 1
$url = ($previewLine -split '\s+') | Where-Object { $_ -like "https://*" } | Select-Object -First 1

if ($url) {
    Write-Host "Asignando $url a produccion..." -ForegroundColor Cyan
    vercel alias $url fit58caracas.vercel.app
    Write-Host "Listo. https://fit58caracas.vercel.app actualizado." -ForegroundColor Green
} else {
    Write-Host "No se encontro URL Preview. Ejecuta manualmente: vercel ls fit58caracas" -ForegroundColor Red
}
