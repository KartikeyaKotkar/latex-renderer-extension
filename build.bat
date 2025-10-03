@echo off
REM Build script for Windows (cmd.exe)
REM Packages the extension using web-ext into web-ext-artifacts\

node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Node.js not found on PATH. Install Node.js LTS from https://nodejs.org/ and rerun this script.
  exit /b 1
)

web-ext --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo web-ext not found globally. Attempting to run via npx...
  npx --no-install web-ext build --source-dir . --overwrite-dest --artifacts-dir web-ext-artifacts
  exit /b %ERRORLEVEL%
)

web-ext build --source-dir . --overwrite-dest --artifacts-dir web-ext-artifacts
exit /b %ERRORLEVEL%
