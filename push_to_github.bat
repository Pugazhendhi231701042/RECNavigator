@echo off
echo ===================================================
echo   Pushing REC WayFinder to GitHub Repository
echo   Target: Pugazhendhi231701042/RECNavigator
echo ===================================================

:: Ensure Git identity is configured
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo Setting up Git author identity...
    git config --global user.name "Pugazhendhi231701042"
    git config --global user.email "pugazhendhi231701042@gmail.com"
)

:: Ensure repository is initialized
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Initializing Git repository...
    git init
    git remote add origin https://github.com/Pugazhendhi231701042/RECNavigator.git
)

echo Adding modified files...
git add .

set /p commit_msg="Enter commit message (Press Enter for default): "
if "%commit_msg%"=="" set commit_msg="Update REC WayFinder 3D Campus Navigator"

echo Committing changes...
git commit -m "%commit_msg%"

echo Pushing to GitHub main branch...
git branch -M main
git push -u origin main

echo ===================================================
echo  Finished GitHub Push Command!
echo ===================================================
pause
