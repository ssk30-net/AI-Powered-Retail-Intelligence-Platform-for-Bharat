╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              AI MARKET PULSE - BACKEND SETUP                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

QUICK START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Just run this ONE file:

    RUN_BACKEND.bat

That's it! 🎉


WHAT IT DOES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The script automatically:

  1. ✓ Checks if virtual environment exists
     → If not, creates it and installs all requirements

  2. ✓ Checks if database is initialized
     → If not, connects to RDS and creates all tables

  3. ✓ Starts the backend server
     → Runs on http://localhost:8000


FIRST TIME RUN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When you run RUN_BACKEND.bat for the first time:

  [1/4] Creates virtual environment
  [2/4] Installs all requirements (takes 3-5 minutes)
  [3/4] Initializes RDS database (creates all tables)
  [4/4] Starts backend server

Time: ~5-7 minutes


SUBSEQUENT RUNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After first run, the script is smart:

  ✓ Detects venv exists → skips setup
  ✓ Detects database initialized → skips init
  ✓ Just starts the server

Time: ~5 seconds


BEFORE RUNNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Make sure:

  1. ✓ .env file is configured with RDS connection
  2. ✓ RDS security group allows your IP (port 5432)


SERVER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When server is running:

  Backend:      http://localhost:8000
  API Docs:     http://localhost:8000/docs
  Health Check: http://localhost:8000/health

Stop server: Press Ctrl+C


TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ "Python not found"
   → Update PYTHON_PATH in RUN_BACKEND.bat

❌ "Connection refused" (database)
   → Fix RDS security group to allow your IP

❌ "Authentication failed"
   → Check password in .env file

❌ Script fails
   → Delete venv folder and run again


MANUAL OPERATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If you need to run steps manually:

Install requirements only:
  INSTALL_REQUIREMENTS.bat

Check configuration:
  DIAGNOSE.bat


FILES STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Main Script:
  RUN_BACKEND.bat           - All-in-one script (USE THIS!)

Helper Scripts:
  INSTALL_REQUIREMENTS.bat  - Install/update requirements
  DIAGNOSE.bat              - Check configuration
  START_SERVER.bat          - Start server only

Python Scripts:
  init_rds_database.py      - Database initialization
  check_env.py              - Environment check

Documentation:
  README_BACKEND.txt        - This file
  HOW_TO_START_SERVER.md    - Detailed guide
  COMPLETE_SETUP.txt        - Complete setup guide


WHAT CHANGED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Old way (3 separate files):
  1. SETUP_VENV.bat
  2. INIT_RDS.bat
  3. start_local.bat

New way (1 file):
  RUN_BACKEND.bat

✓ Simpler
✓ Smarter (detects what's needed)
✓ Faster (skips completed steps)


DAILY WORKFLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every day:
  1. Double-click: RUN_BACKEND.bat
  2. Wait 5 seconds
  3. Server is running!

That's it! 🎉


╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  👉 TO START: Just run RUN_BACKEND.bat                       ║
║                                                              ║
║  ⏱️  First time: ~5-7 minutes                                ║
║  ⏱️  After that: ~5 seconds                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
