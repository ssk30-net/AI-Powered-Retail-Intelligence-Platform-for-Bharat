@echo off
REM ============================================================
REM Check Database Contents
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          DATABASE CHECK - VERIFY DATA LOADED                ║
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

echo Installing tabulate package (for nice tables)...
python -m pip install tabulate --quiet
echo.

echo Checking database...
echo ────────────────────────────────────────────────────────────
python check_database.py
echo ────────────────────────────────────────────────────────────
echo.

pause
