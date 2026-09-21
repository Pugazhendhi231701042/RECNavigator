@echo off
setlocal enabledelayedexpansion
title RECNavigator

:: Navigate to project directory
cd /d "%~dp0"

echo ===================================================
echo             RECNavigator Launch System
echo ===================================================
echo.

:: Check if client dependencies are installed
if not exist "client\node_modules\" (
    echo [INFO] Dependencies are not installed.
    echo [INFO] Running 'npm install' in client folder...
    echo.
    cd client
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] 'npm install' encountered an error!
        cd /d "%~dp0"
        pause
        exit /b %errorlevel%
    )
    cd /d "%~dp0"
    echo.
    echo [INFO] Dependencies successfully installed!
    echo.
) else (
    echo [INFO] Dependencies verified (node_modules present).
)

echo [INFO] Launching development server (npm run dev)...
echo.
cd client
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server exited with code %errorlevel%.
    pause
)
