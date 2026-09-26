@echo off
title Fleuria Handmade - Direct Vercel Deployment
echo ========================================================
echo   Fleuria Handmade - Direct Vercel Deployment
echo   (Deploys local files directly without GitHub)
echo ========================================================
echo.

echo Checking Vercel login status...
call "%APPDATA%\npm\vercel.cmd" whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [!] You are not logged into Vercel yet.
    echo Opening Vercel login (select your login method in the browser)...
    echo.
    call "%APPDATA%\npm\vercel.cmd" login
)

echo.
echo Deploying local files directly to Vercel Production...
call "%APPDATA%\npm\vercel.cmd" --prod

echo.
echo ========================================================
echo   Deployment completed!
echo ========================================================
pause
