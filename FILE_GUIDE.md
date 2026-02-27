# File Guide - AI Market Pulse

Quick reference for what each file does.

## 📖 Documentation Files

### Getting Started
- **GETTING_STARTED.md** - Quick start guide (start here!)
- **SUCCESS_SUMMARY.md** - Backend setup success details
- **README.md** - Project overview and main documentation

### Technical Documentation
- **API_ENDPOINTS.md** - Complete API endpoint documentation
- **DATABASE_SCHEMA.md** - Database structure and tables
- **DESIGN.md** - System architecture and design
- **FEATURES_AND_PAGES.md** - Feature specifications
- **WORKING_FEATURES.md** - Current implementation status

### Project Management
- **CHANGELOG.md** - Version history and changes
- **CONTRIBUTING.md** - Contribution guidelines
- **LICENSE** - Project license

---

## 🔧 Configuration Files

### Root Level
- **.gitignore** - Git ignore rules
- **.env.example** - Environment variables template
- **docker-compose.yml** - Docker services configuration
- **Makefile** - Development command shortcuts

### Backend
- **backend/.env** - Backend environment variables
- **backend/requirements.txt** - Python dependencies
- **backend/verify_setup.py** - Setup verification script
- **backend/setup_fresh.bat** - Automated setup script

### Frontend
- **frontend/.env** - Frontend environment variables
- **frontend/package.json** - Node.js dependencies
- **frontend/next.config.js** - Next.js configuration
- **frontend/tailwind.config.js** - Tailwind CSS configuration
- **frontend/tsconfig.json** - TypeScript configuration

---

## 📂 Directory Structure

### Backend (`backend/`)
```
backend/
├── app/
│   ├── routes/          # API endpoint handlers
│   ├── core/            # Configuration, database, security
│   ├── models/          # SQLAlchemy database models
│   ├── schemas/         # Pydantic request/response schemas
│   └── main.py          # FastAPI application entry
├── venv/                # Python virtual environment
├── .env                 # Environment variables
├── requirements.txt     # Dependencies
├── verify_setup.py      # Setup verification
└── README.md            # Backend documentation
```

### Frontend (`frontend/`)
```
frontend/
├── src/
│   ├── app/             # Next.js 14 App Router
│   │   ├── (auth)/      # Auth pages (login, register)
│   │   ├── dashboard/   # Dashboard page
│   │   ├── home/        # Landing page
│   │   └── components/  # React components
│   ├── lib/             # Utilities (API client)
│   ├── store/           # State management (Zustand)
│   └── types/           # TypeScript types
├── public/              # Static assets
├── .env                 # Environment variables
├── package.json         # Dependencies
└── README.md            # Frontend documentation
```

---

## 🗂️ Data Files

- **comodity_price_Dataset.csv** - Sample commodity price data
- **FEATURES_IMPLEMENTATION.json** - Feature implementation tracking
- **AI Market Pulse Dashboard UI.make** - Make.com automation workflow

---

## 🚀 Quick File Access

### Need to...

**Start the backend?**
→ See `backend/README.md` or `backend/QUICK_START.md`

**Start the frontend?**
→ See `frontend/README.md` or `GETTING_STARTED.md`

**Understand the API?**
→ See `API_ENDPOINTS.md` or visit http://localhost:8000/docs

**Check what's working?**
→ See `WORKING_FEATURES.md` or `SUCCESS_SUMMARY.md`

**Setup database?**
→ See `backend/QUICK_START.md` or `DATABASE_SCHEMA.md`

**Understand the architecture?**
→ See `DESIGN.md`

**See all features?**
→ See `FEATURES_AND_PAGES.md`

**Contribute to the project?**
→ See `CONTRIBUTING.md`

---

## 📝 Important Files to Edit

### When developing backend:
- `backend/app/routes/*.py` - Add/modify API endpoints
- `backend/app/models/*.py` - Add/modify database models
- `backend/app/schemas/*.py` - Add/modify request/response schemas
- `backend/.env` - Configure environment variables

### When developing frontend:
- `frontend/src/app/*/page.tsx` - Add/modify pages
- `frontend/src/app/components/*.tsx` - Add/modify components
- `frontend/src/lib/api.ts` - Modify API client
- `frontend/src/store/*.ts` - Modify state management
- `frontend/.env` - Configure environment variables

### When deploying:
- `docker-compose.yml` - Configure Docker services
- `Makefile` - Add deployment commands
- `.env.example` - Document required environment variables

---

## 🗑️ Files You Can Ignore

These are generated or temporary:
- `backend/venv/` - Virtual environment (regenerate with `python -m venv venv`)
- `backend/__pycache__/` - Python cache
- `frontend/node_modules/` - Node packages (regenerate with `npm install`)
- `frontend/.next/` - Next.js build cache
- `.git/` - Git repository data
- `.vscode/` - VS Code settings

---

## 📚 Documentation Priority

1. **GETTING_STARTED.md** - Start here
2. **SUCCESS_SUMMARY.md** - Understand current status
3. **README.md** - Project overview
4. **WORKING_FEATURES.md** - See what's implemented
5. **API_ENDPOINTS.md** - API reference
6. **DESIGN.md** - Architecture details

---

**Tip:** Keep `GETTING_STARTED.md` open while developing!
