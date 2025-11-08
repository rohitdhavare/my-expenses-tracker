@echo off
echo Testing Expenses Tracker Application...
echo.

echo 1. Testing application status...
curl -X GET http://localhost:8082/api/data/status
echo.
echo.

echo 2. Initializing sample data...
curl -X POST http://localhost:8082/api/data/init
echo.
echo.

echo 3. Checking data status after initialization...
curl -X GET http://localhost:8082/api/data/status
echo.
echo.

echo 4. Testing personal expenses endpoint...
curl -X GET http://localhost:8082/api/expenses/type/PERSONAL
echo.
echo.

echo 5. Testing professional expenses endpoint...
curl -X GET http://localhost:8082/api/expenses/type/PROFESSIONAL
echo.
echo.

echo 6. Testing all expenses endpoint...
curl -X GET http://localhost:8082/api/expenses
echo.
echo.

echo Testing completed!
pause
