@echo off
title Mia Pasta Bella - Servidores Locales
echo ========================================================
echo   MIA PASTA BELLA - FABRICA DE PASTAS ARTESANALES
echo   Iniciando Tienda (Puerto 3000) y Admin (Puerto 3001)...
echo ========================================================

start "Mia Pasta Bella - Tienda (http://localhost:3000)" cmd /k "npm run dev:tienda"
start "Mia Pasta Bella - Admin (http://localhost:3001)" cmd /k "npm run dev:admin"

echo Servidores lanzados en ventanas separadas:
echo  - Tienda Clientes: http://localhost:3000
echo  - Panel Admin:     http://localhost:3001
echo.
pause
