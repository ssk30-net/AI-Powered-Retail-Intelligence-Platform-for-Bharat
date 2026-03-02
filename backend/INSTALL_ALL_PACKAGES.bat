@echo off
REM ============================================================
REM Install ALL Required Packages for Backend
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          INSTALL ALL BACKEND PACKAGES                       ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if venv exists
if not exist "venv\Scripts\activate.bat" (
    echo ✗ Virtual environment not found!
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo ✓ Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo Upgrading pip...
python -m pip install --upgrade pip
echo.

echo Installing packages from requirements.txt...
echo This may take 5-10 minutes...
echo.

pip install -r requirements.txt

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ✗ Installation failed
    echo Trying to install packages individually...
    echo.
    
    REM Install critical packages one by one
    pip install fastapi uvicorn[standard] python-multipart
    pip install sqlalchemy psycopg2-binary
    pip install python-jose[cryptography] passlib[bcrypt]
    pip install pydantic pydantic-settings email-validator
    pip install python-dotenv
    pip install numpy pandas scikit-learn
    pip install textblob nltk vaderSentiment
    pip install requests beautifulsoup4 feedparser
    pip install boto3 botocore
    pip install xgboost joblib
)

echo.
echo Installing NLP data...
echo.

REM Download textblob corpora
python -m textblob.download_corpora

REM Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('brown'); nltk.download('wordnet'); nltk.download('stopwords')"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          PACKAGES INSTALLED SUCCESSFULLY!                    ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Verifying critical packages...
python -c "import fastapi; print('✓ fastapi:', fastapi.__version__)"
python -c "import uvicorn; print('✓ uvicorn:', uvicorn.__version__)"
python -c "import sqlalchemy; print('✓ sqlalchemy:', sqlalchemy.__version__)"
python -c "import pandas; print('✓ pandas:', pandas.__version__)"
python -c "import numpy; print('✓ numpy:', numpy.__version__)"
python -c "import sklearn; print('✓ scikit-learn:', sklearn.__version__)"
python -c "import textblob; print('✓ textblob:', textblob.__version__)"
python -c "import nltk; print('✓ nltk:', nltk.__version__)"
python -c "import xgboost; print('✓ xgboost:', xgboost.__version__)"

echo.
echo All packages installed and verified!
echo You can now run:
echo   - RUN_BACKEND.bat (to start backend API)
echo   - START_ML_API.bat (to start ML API)
echo   - LOAD_ALL_DATA.bat (to load data)
echo.
pause
