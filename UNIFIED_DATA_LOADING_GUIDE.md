# Unified Data Loading Guide
## Single Script to Load All Data

---

## Overview

`LOAD_ALL_DATA.bat` is now your **one-stop solution** for loading all types of data into your database.

---

## What LOAD_ALL_DATA.bat Does Now

### STEP 1: Installing Required Packages ✅
- pandas, psycopg2-binary, python-dotenv, scipy, numpy

### STEP 2: Loading Real Datasets ✅
- Commodity prices from CSV files
- Sales data
- Stock market data

### STEP 3: Generating Synthetic Price History ✅
- 365 days of price data per commodity
- 5 regions per commodity
- Uses Geometric Brownian Motion

### STEP 4: Generating Sentiment & Forecast Data ✅ **NEW!**
- 50 sentiment records per commodity
- 30-day forecasts per commodity per region
- Realistic headlines and scores

### STEP 5: Verification ✅
- Shows database statistics
- Confirms data loaded successfully

---

## How to Use

### Simple: Run One Command
```bash
cd backend
LOAD_ALL_DATA.bat
```

### Interactive Prompts
```
Load real datasets? (Y/N): Y
Generate synthetic data? (Y/N): Y
Generate sentiment and forecast data? (Y/N): Y
```

**Press Y for all three** to load everything!

---

## What Gets Loaded

### Real Data (from CSV files)
```
✓ Commodities: ~25
✓ Regions: ~15
✓ Price History: ~5,000 records
  - Source: AGMARKNET (Indian markets)
  - Source: SALES_DATA (retail sales)
  - Source: STOCK_MARKET (financial data)
```

### Synthetic Price History
```
✓ Price History: ~45,000 records
  - Source: SYNTHETIC
  - 365 days × 5 regions × 25 commodities
  - Based on real price patterns
```

### Sentiment Data
```
✓ Sentiment Data: ~1,250 records
  - 50 records per commodity
  - Positive/Negative/Neutral labels
  - Realistic news headlines
  - Sentiment scores (-1.0 to +1.0)
```

### Forecast Data
```
✓ Forecasts: ~3,750 records
  - 30 days per commodity per region
  - Confidence scores
  - Upper/lower bounds
  - Based on price trends
```

---

## Total Data Loaded

After running `LOAD_ALL_DATA.bat` with all options:

```
📊 DATABASE SUMMARY
+----------------+----------------+
| Table          | Record Count   |
+----------------+----------------+
| commodities    | 25             |
| regions        | 15             |
| price_history  | 50,000         |
| sentiment_data | 1,250          |
| forecasts      | 3,750          |
+----------------+----------------+

Total Records: ~55,000
```

---

## Changes Made

### Before (Old System)
```
LOAD_ALL_DATA.bat
  ├─ Load real data ✓
  ├─ Generate synthetic prices ✓
  └─ (No sentiment/forecasts) ✗

synthetic_data_generator.py
  ├─ Generate prices ✓
  ├─ Generate sentiment ✓
  └─ Generate forecasts ✓

START_REALTIME_SIMULATOR.bat
  ├─ Generate sentiment (continuous) ✓
  └─ Generate forecasts (continuous) ✓
```

**Problem**: Confusing! Multiple scripts doing similar things.

### After (New System)
```
LOAD_ALL_DATA.bat (ONE SCRIPT FOR EVERYTHING)
  ├─ Load real data ✓
  ├─ Generate synthetic prices ✓
  └─ Generate sentiment & forecasts ✓ (NEW!)

START_REALTIME_SIMULATOR.bat (OPTIONAL)
  ├─ Add MORE sentiment (continuous) ✓
  └─ Add MORE forecasts (continuous) ✓
```

**Solution**: One script loads everything. Simulator is optional for adding more data later.

---

## Script Responsibilities

### LOAD_ALL_DATA.bat (Primary - Use This!)
**Purpose**: Initial data loading
**Runs**: Once
**Generates**:
- Real data from CSV
- Synthetic price history (365 days)
- Sentiment data (50 per commodity)
- Forecasts (30 days)

**When to use**: First time setup, or to reload all data

### START_REALTIME_SIMULATOR.bat (Optional)
**Purpose**: Add more data continuously
**Runs**: Continuously or for set duration
**Generates**:
- Additional sentiment records
- Additional forecasts

**When to use**: 
- Testing real-time features
- Adding more training data
- Simulating live data stream

---

## Workflow

### Initial Setup (First Time)
```bash
# Step 1: Load everything
cd backend
LOAD_ALL_DATA.bat
# Press Y, Y, Y

# Step 2: Verify
CHECK_DATABASE.bat

# Step 3: Start ML training
python export_training_data.py
```

### Adding More Data (Optional)
```bash
# If you want MORE sentiment/forecasts
START_REALTIME_SIMULATOR.bat
# Select Quick Mode (5 minutes)
```

---

## Verification

After running `LOAD_ALL_DATA.bat`:

```bash
CHECK_DATABASE.bat
```

Expected output:
```
✅ DATABASE IS READY FOR ML TRAINING!

📊 TABLE SUMMARY
+----------------+----------------+
| commodities    | 25             |
| regions        | 15             |
| price_history  | 50,000         |
| sentiment_data | 1,250          | ← Should NOT be 0!
| forecasts      | 3,750          | ← Should NOT be 0!
+----------------+----------------+

🎯 ML READINESS CHECK
✅ Commodities loaded
✅ Regions loaded
✅ Price history (min 1000)
✅ Sentiment data available
✅ Date range (min 90 days)
```

---

## Troubleshooting

### "sentiment_data | 0"
**Cause**: You pressed N for "Generate sentiment and forecast data?"
**Solution**: Run `LOAD_ALL_DATA.bat` again and press Y for all prompts

### "forecasts | 0"
**Cause**: Same as above
**Solution**: Run `LOAD_ALL_DATA.bat` again and press Y for all prompts

### "Not enough data for forecasting"
**Cause**: Need to load real data first (STEP 2)
**Solution**: Make sure you press Y for "Load real datasets?"

### Script takes too long
**Normal**: Generating 55,000 records takes 5-10 minutes
**Progress**: Watch the logs to see progress

---

## Time Estimates

```
STEP 1: Install packages         ~1 minute
STEP 2: Load real data           ~2 minutes
STEP 3: Generate synthetic       ~3 minutes
STEP 4: Generate sentiment       ~2 minutes
STEP 5: Verification             ~10 seconds

Total Time: ~8-10 minutes
```

---

## Files Modified

### Updated Files
1. `backend/LOAD_ALL_DATA.bat` - Added STEP 4 for sentiment/forecasts
2. `backend/synthetic_data_generator.py` - Now only generates price history
3. `backend/realtime_data_simulator.py` - Added `--bulk` mode for one-time generation

### New Files
- `UNIFIED_DATA_LOADING_GUIDE.md` - This guide

---

## Command Reference

### Load Everything (Recommended)
```bash
cd backend
LOAD_ALL_DATA.bat
# Press Y, Y, Y
```

### Load Only Real Data
```bash
cd backend
LOAD_ALL_DATA.bat
# Press Y, N, N
```

### Load Real + Synthetic Prices Only
```bash
cd backend
LOAD_ALL_DATA.bat
# Press Y, Y, N
```

### Check Database
```bash
cd backend
CHECK_DATABASE.bat
```

### Add More Data (Optional)
```bash
cd backend
START_REALTIME_SIMULATOR.bat
```

---

## Next Steps

1. ✅ Run `LOAD_ALL_DATA.bat` (press Y for all)
2. ✅ Run `CHECK_DATABASE.bat` to verify
3. ✅ Proceed with ML training (see `ML_IMPLEMENTATION_ROADMAP.md`)

---

**Status**: ✅ Unified data loading system ready!
**One Script**: `LOAD_ALL_DATA.bat` now loads everything you need!
