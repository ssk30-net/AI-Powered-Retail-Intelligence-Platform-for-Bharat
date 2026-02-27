@echo off
echo ========================================
echo AI Market Pulse - Backend Installation
echo ========================================
echo.

echo Step 1: Removing old virtual environment...
if exist venv rmdir /s /q venv
echo Done!
echo.

echo Step 2: Creating fresh virtual environment...
python -m venv venv
echo Done!
echo.

echo Step 3: Upgrading pip...
venv\Scripts\python.exe -m pip install --upgrade pip setuptools
echo Done!
echo.

echo Step 4: Installing dependencies...
venv\Scripts\pip.exe install fastapi
venv\Scripts\pip.exe install uvicorn[standard]
venv\Scripts\pip.exe install sqlalchemy
venv\Scripts\pip.exe install psycopg2-binary
venv\Scripts\pip.exe install python-jose[cryptography]
venv\Scripts\pip.exe install passlib[bcrypt]
venv\Scripts\pip.exe install python-multipart
venv\Scripts\pip.exe install pydantic
venv\Scripts\pip.exe install pydantic-settings
venv\Scripts\pip.exe install email-validator
venv\Scripts\pip.exe install python-dotenv
echo Done!
echo.

echo Step 5: Verifying installation...
venv\Scripts\python.exe -c "import fastapi; print('FastAPI installed successfully!')"
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy .env.example to .env and configure
echo 2. Start PostgreSQL: docker run --name aimarketpulse-db -e POSTGRES_DB=aimarketpulse -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine
echo 3. Initialize database: venv\Scripts\python.exe -m app.core.init_db
echo 4. Run server: venv\Scripts\uvicorn.exe app.main:app --reload
echo.
pause
