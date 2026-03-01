@echo off
REM ============================================================
REM Test Trained Model Locally
REM Test predictions before deployment
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          TEST TRAINED MODEL                                 ║
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

echo This will:
echo   • Load trained model from models/
echo   • Load test dataset from ml_data/
echo   • Make predictions on test data
echo   • Calculate accuracy metrics
echo   • Show sample predictions
echo   • Save test results
echo.

set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Testing model...
echo ────────────────────────────────────────────────────────────
python test_model.py
set TEST_RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %TEST_RESULT% NEQ 0 (
    echo.
    echo ✗ Testing failed!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          MODEL TESTING COMPLETE!                            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Test results saved to: models/test_results.csv
echo.
echo Next steps:
echo   1. Review test results
echo   2. If accuracy is good, deploy to SageMaker
echo   3. Or integrate with backend API for local use
echo.
pause
