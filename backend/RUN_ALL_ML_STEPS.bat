@echo off
REM ============================================================
REM Run All ML Steps (1-4)
REM Complete ML pipeline from data verification to model training
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          COMPLETE ML PIPELINE                               ║
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

echo This will run all ML steps:
echo.
echo   STEP 1: Verify Data Structure
echo   STEP 2: Export Training Dataset
echo   STEP 3: Feature Engineering (included in STEP 2)
echo   STEP 4: Train XGBoost Model
echo.
echo Total estimated time: 10-15 minutes
echo.

set /p CONFIRM="Run complete ML pipeline? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo ════════════════════════════════════════════════════════════════
echo STEP 1: VERIFY DATA STRUCTURE
echo ════════════════════════════════════════════════════════════════
echo.

python -m pip install tabulate --quiet

python verify_data.py
set VERIFY_RESULT=%ERRORLEVEL%

if %VERIFY_RESULT% NEQ 0 (
    echo.
    echo ✗ STEP 1 FAILED: Data verification failed
    echo Please fix the issues and run LOAD_ALL_DATA.bat
    pause
    exit /b 1
)

echo.
echo ✓ STEP 1 COMPLETE: Data verified
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════════
echo STEP 2: EXPORT TRAINING DATASET
echo ════════════════════════════════════════════════════════════════
echo.

python export_training_data.py
set EXPORT_RESULT=%ERRORLEVEL%

if %EXPORT_RESULT% NEQ 0 (
    echo.
    echo ✗ STEP 2 FAILED: Data export failed
    pause
    exit /b 1
)

echo.
echo ✓ STEP 2 COMPLETE: Training data exported
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════════
echo STEP 3: FEATURE ENGINEERING
echo ════════════════════════════════════════════════════════════════
echo.
echo ✓ STEP 3 COMPLETE: Features already created in STEP 2
echo   • Lag features (1, 7, 14, 30 days)
echo   • Rolling features (mean, std, min, max)
echo   • Price change features
echo   • Sentiment features
echo   • Time features
echo.
pause

echo.
echo ════════════════════════════════════════════════════════════════
echo STEP 4: TRAIN XGBOOST MODEL
echo ════════════════════════════════════════════════════════════════
echo.

python -m pip install xgboost scikit-learn matplotlib joblib --quiet

python train_model.py
set TRAIN_RESULT=%ERRORLEVEL%

if %TRAIN_RESULT% NEQ 0 (
    echo.
    echo ✗ STEP 4 FAILED: Model training failed
    pause
    exit /b 1
)

echo.
echo ✓ STEP 4 COMPLETE: Model trained
echo.

echo.
echo ════════════════════════════════════════════════════════════════
echo TEST MODEL (Optional)
echo ════════════════════════════════════════════════════════════════
echo.

set /p TEST_MODEL="Test model with sample predictions? (Y/N): "
if /i "%TEST_MODEL%"=="Y" (
    echo.
    python test_model.py
    echo.
    echo ✓ Model tested
    pause
)

echo.
echo ════════════════════════════════════════════════════════════════
echo STEP 5: DEPLOY TO SAGEMAKER (Optional)
echo ════════════════════════════════════════════════════════════════
echo.
echo This will deploy your model to AWS SageMaker.
echo   • Estimated time: 10-15 minutes
echo   • Estimated cost: ~$0.05/hour (ml.t2.medium)
echo   • Requires: AWS CLI configured
echo.

set /p DEPLOY_SAGEMAKER="Deploy to SageMaker? (Y/N): "
if /i "%DEPLOY_SAGEMAKER%"=="Y" (
    echo.
    python -m pip install boto3 sagemaker --quiet
    python deploy_sagemaker.py
    set DEPLOY_RESULT=%ERRORLEVEL%
    
    if %DEPLOY_RESULT% EQU 0 (
        echo.
        echo ✓ STEP 5 COMPLETE: Model deployed to SageMaker
    ) else (
        echo.
        echo ⚠️ STEP 5 SKIPPED: Deployment failed (optional)
    )
    pause
) else (
    echo.
    echo ⚠️ STEP 5 SKIPPED: SageMaker deployment (optional)
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          ALL ML STEPS COMPLETE!                             ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ════════════════════════════════════════════════════════════════
echo SUMMARY
echo ════════════════════════════════════════════════════════════════
echo.
echo ✓ STEP 1: Data verified
echo ✓ STEP 2: Training data exported to ml_data/
echo ✓ STEP 3: Features engineered (45+ features)
echo ✓ STEP 4: Model trained and saved to models/
if /i "%TEST_MODEL%"=="Y" echo ✓ Model tested successfully
if /i "%DEPLOY_SAGEMAKER%"=="Y" echo ✓ STEP 5: Model deployed to SageMaker
echo.
echo Output Files:
echo   ml_data/
echo     • training_data.csv
echo     • validation_data.csv
echo     • test_data.csv
echo     • feature_names.json
echo.
echo   models/
echo     • xgboost_price_predictor.pkl
echo     • scaler.pkl
echo     • feature_names.json
echo     • metrics.json
echo     • model_info.json
echo     • feature_importance.png
echo.
echo ════════════════════════════════════════════════════════════════
echo NEXT STEPS
echo ════════════════════════════════════════════════════════════════
echo.
echo Option A: Test Model Locally
echo   • Review models/feature_importance.png
echo   • Test predictions with sample data
echo   • Integrate with backend API
echo.
echo Option B: Deploy to SageMaker
echo   • Upload model to S3
echo   • Create SageMaker endpoint
echo   • Integrate with production API
echo.
echo See ML_IMPLEMENTATION_ROADMAP.md for deployment guide
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
