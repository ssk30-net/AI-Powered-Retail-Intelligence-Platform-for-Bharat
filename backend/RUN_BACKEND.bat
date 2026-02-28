@echo off
REM ============================================================
REM AI Market Pulse - Complete Backend Setup and Start
REM This script handles everything: setup, database init, and server start
REM ============================================================

set PYTHON_PATH=C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          AI MARKET PULSE - BACKEND SETUP & START            ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM ============================================================
REM STEP 1: Check if setup is needed
REM ============================================================

if exist "venv\Scripts\activate.bat" (
    echo ✓ Virtual environment found
    goto :check_database
) else (
    echo ⚠ Virtual environment not found - will create it
    goto :setup_venv
)

:setup_venv
echo.
echo ============================================================
echo STEP 1: Setting Up Virtual Environment
echo ============================================================
echo.

echo [1/5] Checking Python...
if exist "%PYTHON_PATH%" (
    echo ✓ Python found
    "%PYTHON_PATH%" --version
) else (
    echo ✗ Python not found at: %PYTHON_PATH%
    echo Please update PYTHON_PATH in this script
    pause
    exit /b 1
)
echo.

echo [2/5] Removing old virtual environment...
if exist venv (
    echo Deleting old venv folder...
    rmdir /s /q venv 2>nul
)
echo ✓ Ready to create new venv
echo.

echo [3/5] Creating new virtual environment...
"%PYTHON_PATH%" -m venv venv
if errorlevel 1 (
    echo ✗ Failed to create virtual environment
    pause
    exit /b 1
)
echo ✓ Virtual environment created
echo.

echo [4/5] Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated
echo.

echo [5/5] Installing requirements...
echo (This may take a few minutes on first run)
echo.
python -m pip install --upgrade pip --quiet
pip install -r requirements.txt
if errorlevel 1 (
    echo ✗ Failed to install requirements
    pause
    exit /b 1
)
echo.
echo ✓ All requirements installed
echo.

:check_database
REM ============================================================
REM STEP 2: Check if database needs initialization
REM ============================================================

echo.
echo ============================================================
echo STEP 2: Checking Database
echo ============================================================
echo.

REM Activate venv if not already active
if not defined VIRTUAL_ENV (
    call venv\Scripts\activate.bat
)

REM Always show database initialization option
echo.
echo Do you want to initialize/reinitialize the database?
echo   [Y] Yes - Initialize database (creates all tables)
echo   [N] No  - Skip and start server
echo.
set /p DB_CHOICE="Enter your choice (Y/N): "

if /i "%DB_CHOICE%"=="Y" goto :init_database
if /i "%DB_CHOICE%"=="N" goto :start_server
echo Invalid choice. Skipping database initialization.
goto :start_server

:init_database
echo.
echo ============================================================
echo STEP 3: Initializing Database
echo ============================================================
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
    echo Please fix the issue and run this script again.
    pause
    exit /b 1
)

echo ✓ Database initialized successfully
echo.

:start_server
REM ============================================================
REM STEP 4: Start Backend Server
REM ============================================================

echo.
echo ============================================================
echo STEP 4: Starting Backend Server
echo ============================================================
echo.

REM Activate venv if not already active
if not defined VIRTUAL_ENV (
    call venv\Scripts\activate.bat
)

echo ✓ Virtual environment activated
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                  SERVER STARTING...                          ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Server Information:
echo ────────────────────────────────────────────────────────────
echo   Backend URL:  http://localhost:8000
echo   API Docs:     http://localhost:8000/docs
echo   Health Check: http://localhost:8000/health
echo ────────────────────────────────────────────────────────────
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
