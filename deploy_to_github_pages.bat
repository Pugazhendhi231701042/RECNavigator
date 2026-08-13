@echo off
echo ===================================================
echo   Deploying RECNavigator to GitHub Pages
echo   Target URL: https://pugazhendhi231701042.github.io/RECNavigator/
echo ===================================================

echo Setting Git author identity...
git config user.name "Pugazhendhi231701042" >nul 2>&1
git config user.email "pugazhendhi231701042@gmail.com" >nul 2>&1

echo Step 1: Building production WebGL 3D bundle with base path /RECNavigator/...
cd client
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Please fix errors before deploying.
    pause
    exit /b %errorlevel%
)

echo Step 2: Deploying dist to gh-pages branch...
call npm run deploy

echo ===================================================
echo  Successfully Deployed RECNavigator to GitHub Pages!
echo  Your live 3D website will be updated in 1-2 minutes at:
echo  https://pugazhendhi231701042.github.io/RECNavigator/
echo ===================================================
pause
