AI MARKET PULSE - BACKEND QUICK START
======================================

OPTION 1: COMPLETE SETUP (First Time)
--------------------------------------
Run this if you're setting up for the first time:

    RUN_BACKEND.bat

This will:
1. Create virtual environment
2. Install all requirements
3. Ask if you want to initialize database
4. Start the backend server

OPTION 2: SEPARATE SCRIPTS (Recommended)
-----------------------------------------
Use these separate scripts for more control:

1. First time setup:
   RUN_BACKEND.bat
   (Enter Y or N when asked about database)

2. Initialize/Reinitialize database only:
   INIT_DATABASE.bat

3. Start server (after setup):
   START_BACKEND.bat

OPTION 3: MANUAL COMMANDS
--------------------------
If batch files don't work, use these commands:

1. Activate virtual environment:
   venv\Scripts\activate.bat

2. Start server:
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

3. Initialize database (in another terminal):
   venv\Scripts\activate.bat
   python init_rds_database.py

TROUBLESHOOTING
---------------
If RUN_BACKEND.bat doesn't accept input:
- Use START_BACKEND.bat instead (skips database init)
- Or use INIT_DATABASE.bat separately
- Or use manual commands above

If "uvicorn not found":
- Make sure virtual environment is activated
- Run: pip install -r requirements.txt

ENDPOINTS
---------
After starting:
- Backend:     http://localhost:8000
- API Docs:    http://localhost:8000/docs
- Health:      http://localhost:8000/health

TEST CREDENTIALS
----------------
Email:    test@example.com
Password: Test123
