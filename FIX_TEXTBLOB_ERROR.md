# 🔧 Fix TextBlob Error

**Error**: `ModuleNotFoundError: No module named 'textblob'`

This error occurs because the `textblob` package is not installed in your virtual environment.

---

## ⚡ Quick Fix (Recommended)

Run this command in the backend directory:

```bash
cd backend
FIX_MISSING_PACKAGES.bat
```

This will:
1. Install textblob
2. Download textblob corpora
3. Install other NLP packages (nltk, vaderSentiment)
4. Download NLTK data

**Time**: ~2 minutes

---

## 🔄 Alternative: Reinstall All Packages

If the quick fix doesn't work, reinstall all packages:

```bash
cd backend
INSTALL_ALL_PACKAGES.bat
```

This will:
1. Install all packages from requirements.txt
2. Download all NLP data
3. Verify installations

**Time**: ~5-10 minutes

---

## 🛠️ Manual Fix

If batch files don't work, install manually:

### Step 1: Activate Virtual Environment
```bash
cd backend
venv\Scripts\activate
```

### Step 2: Install TextBlob
```bash
pip install textblob
```

### Step 3: Download TextBlob Corpora
```bash
python -m textblob.download_corpora
```

### Step 4: Install Other NLP Packages
```bash
pip install nltk vaderSentiment
```

### Step 5: Download NLTK Data
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('brown'); nltk.download('wordnet'); nltk.download('stopwords')"
```

### Step 6: Verify Installation
```bash
python -c "import textblob; print('TextBlob version:', textblob.__version__)"
```

---

## ✅ After Installation

Once packages are installed, you can start the backend:

```bash
cd backend
RUN_BACKEND.bat
```

The backend should now start without errors!

---

## 🐛 Still Having Issues?

### Issue: pip not found
**Solution**: Ensure Python is in your PATH or use full path:
```bash
C:\Users\HP\AppData\Local\Programs\Python\Python314\python.exe -m pip install textblob
```

### Issue: Permission denied
**Solution**: Run command prompt as Administrator

### Issue: Network error during download
**Solution**: Check your internet connection and try again

### Issue: Virtual environment not found
**Solution**: Create it first:
```bash
cd backend
python -m venv venv
```

---

## 📚 What is TextBlob?

TextBlob is a Python library for processing textual data. It's used in the backend for:
- Sentiment analysis of news articles
- Text processing and analysis
- Natural language processing tasks

It's required for the sentiment analysis features in the AI Market Pulse application.

---

## 🎯 Prevention

To avoid this issue in the future:

1. Always run `INSTALL_ALL_PACKAGES.bat` after cloning the repository
2. Keep your virtual environment activated when working on the project
3. If you add new packages, update `requirements.txt`

---

**Quick Command Summary**:
```bash
cd backend
FIX_MISSING_PACKAGES.bat
RUN_BACKEND.bat
```

That's it! Your backend should now work properly. 🎉
