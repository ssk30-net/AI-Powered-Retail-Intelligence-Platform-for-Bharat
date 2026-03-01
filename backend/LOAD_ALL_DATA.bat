@echo off
REM ============================================================
REM AI Market Pulse - Load ALL Data (Real + Synthetic)
REM Complete data loading solution
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          AI MARKET PULSE - COMPLETE DATA LOADER             ║
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

echo ============================================================
echo STEP 1: Installing Required Packages
echo ============================================================
echo.
echo Installing: pandas, psycopg2-binary, python-dotenv, scipy, numpy
python -m pip install --upgrade pip --quiet
python -m pip install pandas psycopg2-binary python-dotenv scipy numpy --quiet
echo ✓ Packages installed
echo.

echo ============================================================
echo STEP 2: Loading Real Datasets
echo ============================================================
echo.
echo This will load:
echo   - Commodity Price Data (Indian markets)
echo   - Sales Data (demand patterns)
echo   - Stock Market Data (correlation analysis)
echo.
echo Source files:
echo   - comodity_price_Dataset.csv
echo   - datasets/Indian_commodity_price.csv
echo   - datasets/cleaned_dataset.csv
echo   - datasets/archive/KO_CocaCola_Stock_Prices_1980_2026.csv
echo.

set /p LOAD_REAL="Load real datasets? (Y/N): "
if /i "%LOAD_REAL%"=="Y" goto :load_real
if /i "%LOAD_REAL%"=="YES" goto :load_real
goto :skip_real

:load_real

echo.
echo Loading real data...
echo ────────────────────────────────────────────────────────────
python data_loader.py
set LOAD_RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %LOAD_RESULT% NEQ 0 (
    echo ✗ Real data loading failed
    echo Check the error messages above
    pause
    exit /b 1
)

echo ✓ Real data loaded successfully
echo.

:skip_real

echo ============================================================
echo STEP 3: Generating Synthetic Data
echo ============================================================
echo.
echo This will generate:
echo   - Price History (365 days × 5 regions per commodity)
echo.
echo Purpose:
echo   - Increase training data for ML models
echo   - Improve model accuracy and exposure
echo   - Fill gaps in historical data
echo.

set /p GEN_SYNTHETIC="Generate synthetic data? (Y/N): "
if /i "%GEN_SYNTHETIC%"=="Y" goto :gen_synthetic
if /i "%GEN_SYNTHETIC%"=="YES" goto :gen_synthetic
goto :skip_synthetic

:gen_synthetic

echo.
echo Generating synthetic data...
echo ────────────────────────────────────────────────────────────
python synthetic_data_generator.py
set GEN_RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %GEN_RESULT% NEQ 0 (
    echo ✗ Synthetic data generation failed
    echo Check the error messages above
    pause
    exit /b 1
)

echo ✓ Synthetic data generated successfully
echo.

:skip_synthetic

echo ============================================================
echo STEP 4: Generating ML Training Data (Sentiment + Forecasts)
echo ============================================================
echo.
echo This will generate:
echo   - Sentiment Data (50 records per commodity)
echo   - Forecasts (30 days per commodity per region)
echo.
echo Purpose:
echo   - Sentiment analysis for price prediction
echo   - Future price forecasts
echo   - ML model training features
echo.

set /p GEN_ML_DATA="Generate ML training data? (Y/N): "
if /i "%GEN_ML_DATA%"=="Y" goto :gen_ml_data
if /i "%GEN_ML_DATA%"=="YES" goto :gen_ml_data
goto :skip_ml_data

:gen_ml_data

echo.
echo Generating ML training data...
echo ────────────────────────────────────────────────────────────
python generate_ml_training_data.py
set ML_DATA_RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %ML_DATA_RESULT% NEQ 0 (
    echo ✗ ML data generation failed
    echo Check the error messages above
    pause
    exit /b 1
)

echo ✓ ML training data generated successfully
echo.

:skip_ml_data

echo ============================================================
echo STEP 5: Verification
echo ============================================================
echo.
echo Checking database...
python -c "import psycopg2; from dotenv import load_dotenv; import os; load_dotenv(); conn = psycopg2.connect(os.getenv('DATABASE_URL')); cur = conn.cursor(); cur.execute('SELECT COUNT(*) FROM commodities'); print(f'Commodities: {cur.fetchone()[0]}'); cur.execute('SELECT COUNT(*) FROM regions'); print(f'Regions: {cur.fetchone()[0]}'); cur.execute('SELECT source, COUNT(*) FROM price_history GROUP BY source'); print('Price History by Source:'); for row in cur.fetchall(): print(f'  {row[0]}: {row[1]}'); cur.execute('SELECT COUNT(*) FROM sentiment_data'); print(f'Sentiment Data: {cur.fetchone()[0]}'); cur.execute('SELECT COUNT(*) FROM forecasts'); print(f'Forecasts: {cur.fetchone()[0]}'); cur.close(); conn.close()"
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          ALL DATA LOADED SUCCESSFULLY!                       ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Your database is now fully populated with:
echo   ✓ Real commodity prices
echo   ✓ Real sales data
echo   ✓ Real stock market data
echo   ✓ Synthetic price history
echo   ✓ Synthetic sentiment data
echo   ✓ Synthetic forecasts
echo.
echo Next steps:
echo   1. Build ML models with the data
echo   2. Connect frontend to database
echo   3. Test dashboard with real data
echo.
pause
