@echo off
REM ============================================================
REM STEP 4: Train XGBoost Model
REM Train commodity price prediction model locally
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          STEP 4: TRAIN XGBOOST MODEL                        ║
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
python -m pip install xgboost scikit-learn matplotlib joblib --quiet
echo.

echo This will:
echo   • Load training/validation/test data from ml_data/
echo   • Scale features using StandardScaler
echo   • Train XGBoost regression model
echo   • Evaluate on train/val/test sets
echo   • Generate feature importance plot
echo   • Save model artifacts to models/
echo.
echo Estimated time: 2-5 minutes
echo.

set /p CONFIRM="Continue? (Y/N): "
if /i "%CONFIRM%"=="Y" goto :continue
if /i "%CONFIRM%"=="YES" goto :continue
echo Cancelled.
pause
exit /b 0

:continue
echo.
echo Training model...
echo ────────────────────────────────────────────────────────────
python train_model.py
set TRAIN_RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %TRAIN_RESULT% NEQ 0 (
    echo.
    echo ✗ Training failed!
    echo Check the error messages above.
    echo.
    echo Common issues:
    echo   • ml_data/ folder not found (run STEP2_EXPORT_DATA.bat first)
    echo   • Insufficient memory (close other applications)
    echo   • Missing packages (script installs them automatically)
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          MODEL TRAINING COMPLETE!                           ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Model artifacts saved to: models/
echo.
echo Files created:
echo   • xgboost_price_predictor.pkl (trained model)
echo   • scaler.pkl (feature scaler)
echo   • feature_names.json (feature list)
echo   • metrics.json (performance metrics)
echo   • model_info.json (model metadata)
echo   • feature_importance.png (visualization)
echo.
echo Next steps:
echo   1. Review feature_importance.png
echo   2. Test predictions locally
echo   3. Deploy to SageMaker (optional)
echo.
pause
