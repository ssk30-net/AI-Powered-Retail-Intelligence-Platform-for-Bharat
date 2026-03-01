@echo off
REM ============================================================
REM Install Required Packages for Data Loading
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          INSTALL DATA LOADING PACKAGES                      ║
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

echo Installing packages...
echo   - pandas (data processing)
echo   - psycopg2-binary (PostgreSQL driver)
echo   - python-dotenv (environment variables)
echo   - scipy (scientific computing)
echo   - numpy (numerical computing)
echo.

python -m pip install --upgrade pip
python -m pip install pandas psycopg2-binary python-dotenv scipy numpy

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ✗ Installation failed
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          PACKAGES INSTALLED SUCCESSFULLY!                    ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Verifying installation...
python -c "import pandas; print('✓ pandas:', pandas.__version__)"
python -c "import psycopg2; print('✓ psycopg2:', psycopg2.__version__)"
python -c "from dotenv import load_dotenv; print('✓ python-dotenv: OK')"
python -c "import scipy; print('✓ scipy:', scipy.__version__)"
python -c "import numpy; print('✓ numpy:', numpy.__version__)"

echo.
echo All packages installed and verified!
echo You can now run LOAD_DATA.bat
echo.
pause
