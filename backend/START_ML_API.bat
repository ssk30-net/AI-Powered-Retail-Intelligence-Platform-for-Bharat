@echo off
REM Start ML Model API Server
REM Serves the trained model locally without AWS SageMaker

echo.
echo ========================================
echo   ML MODEL API SERVER
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run INSTALL_PACKAGES.bat first
    pause
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if model exists (native model.json or .pkl)
if not exist "models\model.json" if not exist "models\xgboost_price_predictor.pkl" (
    echo.
    echo ERROR: Trained model not found!
    echo Please run RUN_ALL_ML_STEPS.bat first to train the model
    echo.
    pause
    exit /b 1
)

echo.
echo Starting ML API Server...
echo API will be available at: http://localhost:8001
echo API Documentation: http://localhost:8001/docs
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
python serve_model.py

pause
