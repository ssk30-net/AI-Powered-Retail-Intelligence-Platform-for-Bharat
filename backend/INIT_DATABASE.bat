@echo off
REM ============================================================
REM AI Market Pulse - Initialize Database Only
REM Use this to initialize or reinitialize the database
REM ============================================================

set PYTHON_PATH=C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          AI MARKET PULSE - DATABASE INITIALIZATION          ║
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

echo [1/3] Checking .env file...
if not exist ".env" (
    echo ✗ .env file not found!
    pause
    exit /b 1
)
echo ✓ .env file found
echo.

echo [2/3] Installing database packages...
pip install --quiet --disable-pip-version-check sqlalchemy psycopg2-binary pydantic pydantic-settings python-dotenv 2>nul
echo ✓ Packages ready
echo.

echo [3/3] Clearing cache and initializing database...
if exist "app\__pycache__" rmdir /s /q "app\__pycache__" 2>nul
if exist "app\core\__pycache__" rmdir /s /q "app\core\__pycache__" 2>nul
if exist "app\models\__pycache__" rmdir /s /q "app\models\__pycache__" 2>nul
echo.

echo ────────────────────────────────────────────────────────────
"%PYTHON_PATH%" init_rds_database.py
set INIT_RESULT=%ERRORLEVEL%
echo ────────────────────────────────────────────────────────────
echo.

if %INIT_RESULT% NEQ 0 (
    echo.
    echo ✗ Database initialization failed
    echo.
    echo Common issues:
    echo   • RDS security group not allowing your IP
    echo   • Wrong password in .env file
    echo   • Network connectivity issues
    echo.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          DATABASE INITIALIZED SUCCESSFULLY!                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo You can now start the backend server using START_BACKEND.bat
echo.
pause
