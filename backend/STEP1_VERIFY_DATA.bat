@echo off
REM ============================================================
REM STEP 1: Verify Data Structure
REM Check data quality and readiness for ML training
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          STEP 1: VERIFY DATA STRUCTURE                      ║
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

echo Installing required packages...
python -m pip install tabulate --quiet
echo.

echo Running data verification...
echo ────────────────────────────────────────────────────────────
python verify_data.py
set VERIFY_RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %VERIFY_RESULT% NEQ 0 (
    echo.
    echo ✗ Verification failed!
    echo Please fix the issues above before proceeding.
    echo.
    echo Common fixes:
    echo   - Run LOAD_ALL_DATA.bat to load missing data
    echo   - Check database connection in .env file
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          VERIFICATION COMPLETE!                             ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Your data is ready for ML training.
echo.
echo Next step: Run STEP2_EXPORT_DATA.bat
echo.
pause
