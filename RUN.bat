@echo off
setlocal enabledelayedexpansion
title RECNavigator Launch System

:: Navigate to project directory
cd /d "%~dp0"

echo ===================================================
echo             RECNavigator Launch System
echo ===================================================
echo.

:: 1. Check if client dependencies are installed
if not exist "client\node_modules\" (
    echo [INFO] Dependencies not found. Installing packages...
    echo.
    cd client
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] 'npm install' failed!
        cd /d "%~dp0"
        pause
        exit /b %errorlevel%
    )
    if exist "node_modules\esbuild\install.js" (
        node node_modules\esbuild\install.js >nul 2>&1
    )
    cd /d "%~dp0"
    echo.
    echo [INFO] Dependencies installed successfully!
    echo.
) else (
    echo [INFO] Dependencies verified (node_modules present).
)

:: 2. Open browser automatically once Vite initializes
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5173/"

:: 3. Launch development server
echo [INFO] Launching development server on http://localhost:5173/ ...
echo [INFO] Browser will open automatically in 2 seconds...
echo.
cd client
call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server exited with code %errorlevel%.
    pause
)
