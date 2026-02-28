@echo off
echo ========================================
echo Testing CORS Configuration
echo ========================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

echo Test 1: CORS_ORIGINS with wildcard string
echo ==========================================
set CORS_ORIGINS=*
python -c "from app.core.config import settings; print('SUCCESS: CORS_ORIGINS =', settings.CORS_ORIGINS)"
echo.

echo Test 2: CORS_ORIGINS with JSON array
echo ==========================================
set CORS_ORIGINS=["http://localhost:3000"]
python -c "from app.core.config import settings; print('SUCCESS: CORS_ORIGINS =', settings.CORS_ORIGINS)"
echo.

echo Test 3: CORS_ORIGINS from .env file (default)
echo ==========================================
set CORS_ORIGINS=
python -c "from app.core.config import settings; print('SUCCESS: CORS_ORIGINS =', settings.CORS_ORIGINS)"
echo.

echo ========================================
echo All tests completed!
echo ========================================
pause
