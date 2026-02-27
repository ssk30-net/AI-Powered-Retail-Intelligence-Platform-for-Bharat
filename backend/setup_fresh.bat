@echo off
echo ========================================
echo AI Market Pulse - Fresh Setup
echo ========================================
echo.

echo Checking Python version...
python --version
echo.

echo Removing old virtual environment...
if exist venv rmdir /s /q venv
echo Done!
echo.

echo Creating new virtual environment...
python -m venv venv
if errorlevel 1 (
    echo Failed to create virtual environment with default Python.
    echo Trying with Python launcher...
    py -3.11 -m venv venv
    if errorlevel 1 (
        py -3.12 -m venv venv
        if errorlevel 1 (
            echo ERROR: Could not create virtual environment.
            echo Please install Python 3.11 or 3.12 from python.org
            pause
            exit /b 1
        )
    )
)
echo Done!
echo.

echo Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo Checking Python version in venv...
python --version
echo.

echo Upgrading pip...
python -m pip install --upgrade pip setuptools wheel
echo.

echo Installing dependencies...
echo [1/11] Installing fastapi...
pip install fastapi
echo [2/11] Installing uvicorn...
pip install uvicorn[standard]
echo [3/11] Installing sqlalchemy...
pip install sqlalchemy
echo [4/11] Installing psycopg2-binary...
pip install psycopg2-binary
echo [5/11] Installing python-jose...
pip install python-jose[cryptography]
echo [6/11] Installing passlib...
pip install passlib[bcrypt]
echo [7/11] Installing python-multipart...
pip install python-multipart
echo [8/11] Installing pydantic...
pip install pydantic
echo [9/11] Installing pydantic-settings...
pip install pydantic-settings
echo [10/11] Installing email-validator...
pip install email-validator
echo [11/11] Installing python-dotenv...
pip install python-dotenv
echo.

echo ========================================
echo Verifying installation...
echo ========================================
python -c "import fastapi; print('✓ FastAPI installed')"
python -c "import uvicorn; print('✓ Uvicorn installed')"
python -c "import sqlalchemy; print('✓ SQLAlchemy installed')"
python -c "import jose; print('✓ Python-JOSE installed')"
python -c "import passlib; print('✓ Passlib installed')"
echo.

echo ========================================
echo Installation Complete! ✓
echo ========================================
echo.
echo Next steps:
echo 1. Setup environment: copy .env.example .env
echo 2. Start PostgreSQL: docker run --name aimarketpulse-db -e POSTGRES_DB=aimarketpulse -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine
echo 3. Initialize database: python -m app.core.init_db
echo 4. Run server: uvicorn app.main:app --reload
echo.
echo To activate virtual environment later:
echo   venv\Scripts\activate
echo.
pause
