@echo off
REM Test if all required packages are installed

echo.
echo ========================================
echo   TESTING PACKAGE INSTALLATION
echo ========================================
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

echo Testing critical packages...
echo.

python -c "import textblob; print('✓ textblob:', textblob.__version__)"
python -c "import nltk; print('✓ nltk:', nltk.__version__)"
python -c "import vaderSentiment; print('✓ vaderSentiment: OK')"
python -c "import fastapi; print('✓ fastapi:', fastapi.__version__)"
python -c "import uvicorn; print('✓ uvicorn:', uvicorn.__version__)"
python -c "import sqlalchemy; print('✓ sqlalchemy:', sqlalchemy.__version__)"
python -c "import pandas; print('✓ pandas:', pandas.__version__)"
python -c "import numpy; print('✓ numpy:', numpy.__version__)"
python -c "import sklearn; print('✓ scikit-learn:', sklearn.__version__)"

echo.
echo Testing TextBlob functionality...
python -c "from textblob import TextBlob; tb = TextBlob('Hello world'); print('✓ TextBlob sentiment test:', tb.sentiment)"

echo.
echo ========================================
echo   ALL PACKAGES WORKING!
echo ========================================
echo.

pause
