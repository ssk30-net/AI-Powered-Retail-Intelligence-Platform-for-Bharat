@echo off
REM ============================================================
REM Real-Time Data Simulator
REM Continuously generates sentiment and forecast data
REM ============================================================

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║          REAL-TIME DATA SIMULATOR                           ║
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

echo Installing required packages...
python -m pip install scipy --quiet
echo.

echo ════════════════════════════════════════════════════════════════
echo  SIMULATOR MODES
echo ════════════════════════════════════════════════════════════════
echo.
echo  1. QUICK MODE (5 minutes, 5 second intervals)
echo  2. CONTINUOUS MODE (runs until stopped, 10 second intervals)
echo  3. CUSTOM MODE (specify your own settings)
echo.
set /p MODE="Select mode (1/2/3): "

if "%MODE%"=="1" (
    echo.
    echo Starting QUICK MODE...
    echo   • Duration: 5 minutes
    echo   • Interval: 5 seconds
    echo   • Press Ctrl+C to stop early
    echo.
    python realtime_data_simulator.py --quick
) else if "%MODE%"=="2" (
    echo.
    echo Starting CONTINUOUS MODE...
    echo   • Duration: Infinite
    echo   • Interval: 10 seconds
    echo   • Press Ctrl+C to stop
    echo.
    python realtime_data_simulator.py
) else if "%MODE%"=="3" (
    echo.
    set /p INTERVAL="Enter interval in seconds (default 10): "
    set /p DURATION="Enter duration in minutes (leave empty for infinite): "
    
    if "%INTERVAL%"=="" set INTERVAL=10
    
    echo.
    echo Starting CUSTOM MODE...
    echo   • Interval: %INTERVAL% seconds
    if "%DURATION%"=="" (
        echo   • Duration: Infinite
        python realtime_data_simulator.py --interval %INTERVAL%
    ) else (
        echo   • Duration: %DURATION% minutes
        python realtime_data_simulator.py --interval %INTERVAL% --duration %DURATION%
    )
) else (
    echo Invalid selection!
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo  SIMULATOR STOPPED
echo ════════════════════════════════════════════════════════════════
echo.
echo Run CHECK_DATABASE.bat to see the generated data
echo.
pause
