@echo off
cd /d "%~dp0"
set "PORT=8080"
echo Starting Bottega at http://localhost:8080/
echo Keep this window open while using the website.
echo.
node server.js
echo.
echo The server stopped. Any error is shown above.
pause
