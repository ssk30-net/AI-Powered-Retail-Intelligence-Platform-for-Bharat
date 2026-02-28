@echo off
echo ========================================
echo Starting AI Market Pulse Backend
echo ========================================
echo.

REM Activate virtual environment
echo [1/3] Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if activation worked
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

echo [2/3] Virtual environment activated!
echo.

REM Set test environment variable for CORS
echo [3/3] Starting backend server...
echo.
echo Backend will be available at: http://localhost:8000
echo API docs will be at: http://localhost:8000/docs
echo Health check at: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
