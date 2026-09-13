@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Install it from https://nodejs.org/ and run start.bat again.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies. Please wait...
  call npm.cmd install
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

if not exist ".env.local" if exist ".env.example" copy /y ".env.example" ".env.local" >nul

start "Ochag" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173/"
call npm.cmd run dev
pause
