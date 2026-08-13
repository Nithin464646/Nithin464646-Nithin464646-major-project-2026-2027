@echo off
title AgriConnect - Smart Agriculture Platform

echo ============================================
echo    AgriConnect - Starting Application
echo ============================================
echo.
echo Starting server... please wait.
echo.

cd /d %~dp0

:: Start the server in the background and wait 4 seconds for it to boot
start "AgriConnect Server" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 4 /nobreak >nul

:: Open the correct URL in the default browser
start http://localhost:3000

echo.
echo ============================================
echo    App is running at http://localhost:3000
echo    Close the server window to stop.
echo ============================================
