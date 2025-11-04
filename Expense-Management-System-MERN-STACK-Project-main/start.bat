@echo off
echo Starting Portfolio Management System...
echo.

echo Starting Backend Server...
start cmd /k "npm run server"

timeout /t 3 /nobreak >nul

echo Starting Frontend Client...
start cmd /k "cd client && npm start"

echo.
echo Both servers are starting...
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:3000
echo.
echo Portfolio Management System Features:
echo - Asset Management (Stocks, Bonds, Crypto, etc.)
echo - Advanced Analytics Dashboard
echo - Performance Tracking
echo - Risk Analysis
echo - Comprehensive Reports
echo.
echo Press any key to exit this window...
pause >nul
