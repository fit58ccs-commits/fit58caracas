# RESTAURAR — Fit +58 Caracas
## Commit: 54cf161 — 25 julio 2026 (ESTABLE)

### Pasos para restaurar:
1. Renombrar tu carpeta actual a "BACKUP_viejo" (por si acaso)
2. Renombrar esta carpeta a "PROYECTO FIT 58 CARACAS WEB-ADMIN-APP"
3. Copiar tu archivo .env.local dentro de esta carpeta
4. Abrir PowerShell en la carpeta y ejecutar:
   npm install

### NO incluye (debes tener tus propios):
- node_modules/   ← se genera con npm install
- .env.local      ← copia el tuyo de la carpeta anterior
- .next/          ← se genera al correr npm run dev o build

### Para conectar con GitHub:
git init
git remote add origin https://fit58ccs-commits:TU_PAT@github.com/fit58ccs-commits/fitcar acas.git
git fetch origin
git checkout -b master origin/main
