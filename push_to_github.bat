@echo off
echo ===================================================
echo   Pushing RECNavigator to GitHub Repository
echo   Target: Pugazhendhi231701042/RECNavigator
echo ===================================================

echo Setting Git author identity...
git config user.name "Pugazhendhi231701042" >nul 2>&1
git config user.email "pugazhendhi231701042@gmail.com" >nul 2>&1

echo Initializing Git repository...
git init >nul 2>&1
git remote add origin https://github.com/Pugazhendhi231701042/RECNavigator.git >nul 2>&1

echo Adding modified files...
git add .

set /p commit_msg="Enter commit message (Press Enter for default): "
if "%commit_msg%"=="" set commit_msg="Update RECNavigator 3D Campus System"

echo Committing changes...
git commit -m "%commit_msg%"

echo Pushing to GitHub main branch...
git branch -M main
git push -u origin main

echo ===================================================
echo  Finished GitHub Push!
echo ===================================================
pause
