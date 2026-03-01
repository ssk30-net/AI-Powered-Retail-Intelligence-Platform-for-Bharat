@echo off
REM ============================================================
REM STEP 5: Deploy to SageMaker
REM Automated deployment to AWS SageMaker
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          STEP 5: DEPLOY TO SAGEMAKER                        ║
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
python -m pip install boto3 sagemaker --quiet
echo.

echo This will:
echo   • Package model artifacts (model.tar.gz)
echo   • Create/verify S3 bucket
echo   • Upload model to S3
echo   • Create SageMaker model
echo   • Create endpoint configuration
echo   • Deploy endpoint (5-10 minutes)
echo   • Test endpoint
echo.
echo Prerequisites:
echo   • AWS CLI configured (aws configure)
echo   • SageMaker execution role
echo   • S3 and SageMaker permissions
echo.
echo Estimated time: 10-15 minutes
echo Estimated cost: ~$0.05/hour (ml.t2.medium)
echo.

set /p CONFIRM="Continue with deployment? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Deploying to SageMaker...
echo ────────────────────────────────────────────────────────────
python deploy_sagemaker.py
set DEPLOY_RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %DEPLOY_RESULT% NEQ 0 (
    echo.
    echo ✗ Deployment failed!
    echo Check the error messages above.
    echo.
    echo Common issues:
    echo   • AWS not configured (run: aws configure)
    echo   • Missing SageMaker execution role
    echo   • Insufficient permissions
    echo   • Region mismatch
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          DEPLOYMENT COMPLETE!                               ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Model deployed to SageMaker!
echo.
echo Deployment info saved to: models/deployment_info.json
echo.
echo Next steps:
echo   1. Test endpoint with sample data
echo   2. Integrate with backend API
echo   3. Monitor endpoint performance
echo   4. Set up auto-scaling (optional)
echo.
echo To delete endpoint (stop charges):
echo   aws sagemaker delete-endpoint --endpoint-name commodity-price-predictor-endpoint
echo.
pause
