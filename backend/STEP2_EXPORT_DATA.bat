@echo off
REM ============================================================
REM STEP 2: Export Training Dataset
REM Extract and prepare data from RDS for ML training
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          STEP 2: EXPORT TRAINING DATASET                    ║
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
echo   • Extract price history from RDS
echo   • Extract sentiment data
echo   • Merge datasets
echo   • Create lag features (1, 7, 14, 30 days)
echo   • Create rolling features (7, 14, 30 days)
echo   • Create price change features
echo   • Split into train/validation/test sets
echo   • Save to ml_data/ folder
echo.

set /p CONFIRM="Continue? (Y/N): "
if /i "%CONFIRM%"=="Y" goto :continue
if /i "%CONFIRM%"=="YES" goto :continue
echo Cancelled.
pause
exit /b 0

:continue
echo.
echo Exporting training data...
echo This may take 2-5 minutes depending on data size...
echo ────────────────────────────────────────────────────────────
python export_training_data.py
set EXPORT_RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %EXPORT_RESULT% NEQ 0 (
    echo.
    echo ✗ Export failed!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          DATA EXPORT COMPLETE!                              ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Training data exported to: ml_data/
echo.
echo Files created:
echo   • training_data.csv (80%% of data)
echo   • validation_data.csv (10%% of data)
echo   • test_data.csv (10%% of data)
echo   • full_dataset.csv (complete dataset)
echo   • feature_names.json (list of features)
echo.
echo Next steps:
echo   1. Review the exported data in ml_data/ folder
echo   2. Proceed to STEP 3: Feature Engineering (optional)
echo   3. Or jump to STEP 4: Train Model
echo.
pause
