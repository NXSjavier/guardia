@echo off
setlocal
cd /d "%~dp0"

if not exist "cloudflared.exe" (
  echo cloudflared.exe no encontrado en %cd%
  echo Descargando...
  cmd /c curl -L -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
  if not exist "cloudflared.exe" (
    echo Error descargando cloudflared.exe
    pause
    exit /b 1
  )
)

echo Iniciando tunel para backend en http://localhost:3001
echo Deje esta ventana abierta.
echo.
cloudflared.exe tunnel --url http://localhost:3001 --no-tls-verify
