@echo off
REM ============================================================
REM AI Market Pulse - Quick Start Backend (No Database Init)
REM Use this if you've already initialized the database
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          AI MARKET PULSE - BACKEND QUICK START              ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo ✗ Virtual environment not found!
    echo Please run RUN_BACKEND.bat first to set up the environment.
    pause
    exit /b 1
)

echo ✓ Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                  SERVER STARTING...                          ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Server Information:
echo ────────────────────────────────────────────────────────────
echo   Backend URL:  http://localhost:8000
echo   API Docs:     http://localhost:8000/docs
echo   Health Check: http://localhost:8000/health
echo ────────────────────────────────────────────────────────────
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
