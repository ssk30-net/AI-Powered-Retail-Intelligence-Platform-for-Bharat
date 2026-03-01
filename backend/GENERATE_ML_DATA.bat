@echo off
REM ============================================================
REM Generate ML Training Data (Sentiment + Forecasts)
REM Optimized for model training
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          GENERATE ML TRAINING DATA                          ║
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

echo This will generate:
echo   • Sentiment data (50 records per commodity)
echo   • Forecast data (30 days per commodity per region)
echo.
echo Purpose:
echo   • Provide sufficient data for ML model training
echo   • Create realistic sentiment and forecast patterns
echo   • Enable accurate price predictions
echo.

set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Generating ML training data...
echo This will take 2-3 minutes...
echo ────────────────────────────────────────────────────────────
python generate_ml_training_data.py
set RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %RESULT% NEQ 0 (
    echo.
    echo ✗ Generation failed!
    echo Check the error messages above.
    echo.
    echo Common issues:
    echo   • No commodities in database (run LOAD_DATA.bat first)
    echo   • Database connection error (check .env file)
    echo   • Insufficient price history (need 30+ days)
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          ML TRAINING DATA GENERATED!                        ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Data generated successfully!
echo.
echo Next steps:
echo   1. Run CHECK_DATABASE.bat to verify data
echo   2. Run STEP1_VERIFY_DATA.bat to check quality
echo   3. Run STEP2_EXPORT_DATA.bat to prepare for training
echo.
pause
