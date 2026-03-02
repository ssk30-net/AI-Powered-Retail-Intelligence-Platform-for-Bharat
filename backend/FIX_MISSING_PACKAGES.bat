@echo off
REM Fix Missing Python Packages
REM Installs any missing packages required by the backend

echo.
echo ========================================
echo   FIX MISSING PACKAGES
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

echo.
echo Installing missing packages...
echo.

REM Install textblob and its dependencies
echo Installing textblob...
pip install textblob

REM Download textblob corpora
echo.
echo Downloading textblob corpora...
python -m textblob.download_corpora

REM Install other potentially missing packages
echo.
echo Installing other NLP packages...
pip install nltk vaderSentiment

REM Download NLTK data
echo.
echo Downloading NLTK data...
python -c "import nltk; nltk.download('punkt'); nltk.download('brown'); nltk.download('wordnet')"

echo.
echo ========================================
echo   PACKAGES INSTALLED SUCCESSFULLY
echo ========================================
echo.
echo You can now run RUN_BACKEND.bat
echo.

pause
