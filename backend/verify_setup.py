"""
Verification script to check if backend setup is correct
Run this after installing dependencies to verify everything works
"""

import sys

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    print(f"✓ Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 10:
        print("  ✓ Python version is compatible")
        return True
    else:
        print("  ✗ Python version should be 3.10 or higher")
        return False

def check_imports():
    """Check if all required packages can be imported"""
    packages = {
        'fastapi': 'FastAPI',
        'uvicorn': 'Uvicorn',
        'sqlalchemy': 'SQLAlchemy',
        'psycopg2': 'PostgreSQL driver',
        'jose': 'Python-JOSE (JWT)',
        'passlib': 'Passlib (password hashing)',
        'pydantic': 'Pydantic',
        'pydantic_settings': 'Pydantic Settings',
        'email_validator': 'Email Validator',
        'dotenv': 'Python-dotenv'
    }
    
    all_ok = True
    print("\nChecking package imports:")
    
    for package, name in packages.items():
        try:
            __import__(package)
            print(f"  ✓ {name}")
        except ImportError:
            print(f"  ✗ {name} - NOT INSTALLED")
            all_ok = False
    
    return all_ok

def check_app_structure():
    """Check if app structure is correct"""
    import os
    
    print("\nChecking app structure:")
    
    required_files = [
        'app/main.py',
        'app/core/config.py',
        'app/core/database.py',
        'app/core/security.py',
        'app/core/init_db.py',
        'app/models/user.py',
        'app/routes/auth.py',
        'app/routes/dashboard.py',
        'app/schemas/user.py',
        'requirements.txt',
        '.env.example'
    ]
    
    all_ok = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"  ✓ {file_path}")
        else:
            print(f"  ✗ {file_path} - MISSING")
            all_ok = False
    
    return all_ok

def check_fastapi_app():
    """Check if FastAPI app can be imported"""
    print("\nChecking FastAPI application:")
    
    try:
        from app.main import app
        print("  ✓ FastAPI app imported successfully")
        print(f"  ✓ App title: {app.title}")
        return True
    except Exception as e:
        print(f"  ✗ Failed to import FastAPI app: {e}")
        return False

def main():
    """Run all checks"""
    print("=" * 60)
    print("AI Market Pulse - Backend Setup Verification")
    print("=" * 60)
    
    checks = [
        ("Python Version", check_python_version),
        ("Package Imports", check_imports),
        ("App Structure", check_app_structure),
        ("FastAPI App", check_fastapi_app)
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ Error during {name} check: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
        if not result:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n🎉 All checks passed! Your backend is ready to run.")
        print("\nNext steps:")
        print("1. Setup environment: copy .env.example .env")
        print("2. Start PostgreSQL: docker run --name aimarketpulse-db -e POSTGRES_DB=aimarketpulse -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:16-alpine")
        print("3. Initialize database: python -m app.core.init_db")
        print("4. Run server: uvicorn app.main:app --reload")
        print("\nAPI docs will be at: http://localhost:8000/docs")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        print("\nCommon solutions:")
        print("- Missing packages: pip install -r requirements.txt")
        print("- Python version: Install Python 3.10+ from python.org")
        print("- Missing files: Check if you're in the backend directory")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
