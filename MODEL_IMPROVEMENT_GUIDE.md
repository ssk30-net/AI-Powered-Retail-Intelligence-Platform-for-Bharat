# 🎯 Model Improvement Guide

**Current Performance Analysis**

Your model shows signs of **overfitting**:
- Training R²: 0.986 (98.6% - Excellent!)
- Validation R²: -0.105 (Negative - Poor!)
- Test R²: -0.058 (Negative - Poor!)

**Problem**: Model memorizes training data but fails on new data.

---

## 🔍 Quick Diagnosis

### Current Issues
1. **Severe Overfitting**: Training R² is 98.6% but validation/test are negative
2. **High MAPE**: 16% error on predictions
3. **Feature Count**: 39 features might be too many for the data size

### Root Causes
- Model is too complex for the data
- Not enough training data
- Features might have high correlation
- Hyperparameters need tuning

---

## 🚀 Improvement Strategies (Ordered by Impact)

### Strategy 1: Increase Training Data ⭐⭐⭐
**Impact**: HIGH | **Effort**: LOW

**Current**: You likely have limited data
**Goal**: Get more historical price data

**Actions**:
```bash
# Generate more synthetic data
cd backend
# Edit synthetic_data_generator.py to increase days from 365 to 730
python synthetic_data_generator.py

# Regenerate ML training data
GENERATE_ML_DATA.bat
```

**Code Change** (in `synthetic_data_generator.py`):
```python
# Change from:
days = 365  # 1 year

# To:
days = 730  # 2 years
```

---

### Strategy 2: Reduce Model Complexity ⭐⭐⭐
**Impact**: HIGH | **Effort**: LOW

**Problem**: Model is too complex (overfitting)
**Solution**: Reduce tree depth and add regularization

**Edit** `backend/train_model.py`:

```python
# Current parameters (line ~98):
params = {
    'objective': 'reg:squarederror',
    'max_depth': 6,              # ← Too deep
    'learning_rate': 0.1,
    'n_estimators': 100,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'min_child_weight': 1,       # ← Too low
    'gamma': 0,                  # ← No regularization
    'reg_alpha': 0,              # ← No L1 regularization
    'reg_lambda': 1,
    'random_state': 42,
    'n_jobs': -1,
    'eval_metric': 'rmse'
}

# Improved parameters (reduce overfitting):
params = {
    'objective': 'reg:squarederror',
    'max_depth': 3,              # ✅ Reduced from 6 to 3
    'learning_rate': 0.05,       # ✅ Reduced from 0.1 to 0.05
    'n_estimators': 200,         # ✅ Increased from 100 to 200
    'subsample': 0.7,            # ✅ Reduced from 0.8 to 0.7
    'colsample_bytree': 0.7,     # ✅ Reduced from 0.8 to 0.7
    'min_child_weight': 5,       # ✅ Increased from 1 to 5
    'gamma': 0.1,                # ✅ Added regularization
    'reg_alpha': 0.1,            # ✅ Added L1 regularization
    'reg_lambda': 1.5,           # ✅ Increased L2 regularization
    'random_state': 42,
    'n_jobs': -1,
    'eval_metric': 'rmse'
}
```

**Why This Helps**:
- Shallower trees (max_depth=3) prevent memorization
- Lower learning rate with more estimators = better generalization
- Higher min_child_weight = more conservative splits
- Regularization (gamma, alpha, lambda) = penalize complexity

---

### Strategy 3: Feature Selection ⭐⭐
**Impact**: MEDIUM | **Effort**: MEDIUM

**Problem**: 39 features might be too many
**Solution**: Keep only the most important features

**Step 1**: Check feature importance
```bash
# After training, check:
backend/models/feature_importance.png
```

**Step 2**: Remove low-importance features

Edit `backend/export_training_data.py` to skip creating some features:

```python
# Comment out less useful features:
def create_lag_features(self, df):
    # Keep only important lags
    for lag in [1, 7]:  # Remove 14, 30
        df[f'price_lag_{lag}'] = df.groupby(['commodity_id', 'region_id'])['price'].shift(lag)
    return df

def create_rolling_features(self, df):
    # Keep only 7-day rolling features
    for window in [7]:  # Remove 14, 30
        df[f'price_rolling_mean_{window}'] = df.groupby(['commodity_id', 'region_id'])['price'].transform(
            lambda x: x.rolling(window=window, min_periods=1).mean()
        )
    return df
```

---

### Strategy 4: Cross-Validation ⭐⭐
**Impact**: MEDIUM | **Effort**: MEDIUM

**Problem**: Single train/val/test split might not be representative
**Solution**: Use time-series cross-validation

Create `backend/train_model_cv.py`:

```python
from sklearn.model_selection import TimeSeriesSplit

# In train_model function:
tscv = TimeSeriesSplit(n_splits=5)
cv_scores = []

for train_idx, val_idx in tscv.split(X):
    X_train_cv, X_val_cv = X[train_idx], X[val_idx]
    y_train_cv, y_val_cv = y[train_idx], y[val_idx]
    
    model.fit(X_train_cv, y_train_cv)
    score = model.score(X_val_cv, y_val_cv)
    cv_scores.append(score)

print(f"CV R² scores: {cv_scores}")
print(f"Mean CV R²: {np.mean(cv_scores):.4f}")
```

---

### Strategy 5: Hyperparameter Tuning ⭐⭐
**Impact**: MEDIUM | **Effort**: HIGH

**Solution**: Use GridSearch to find best parameters

Create `backend/tune_hyperparameters.py`:

```python
from sklearn.model_selection import GridSearchCV, TimeSeriesSplit

# Parameter grid
param_grid = {
    'max_depth': [2, 3, 4],
    'learning_rate': [0.01, 0.05, 0.1],
    'n_estimators': [100, 200, 300],
    'min_child_weight': [3, 5, 7],
    'gamma': [0, 0.1, 0.2],
    'subsample': [0.6, 0.7, 0.8],
    'colsample_bytree': [0.6, 0.7, 0.8]
}

# Time series cross-validation
tscv = TimeSeriesSplit(n_splits=3)

# Grid search
grid_search = GridSearchCV(
    xgb.XGBRegressor(random_state=42),
    param_grid,
    cv=tscv,
    scoring='r2',
    n_jobs=-1,
    verbose=2
)

grid_search.fit(X_train_scaled, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best CV score: {grid_search.best_score_:.4f}")
```

---

### Strategy 6: Ensemble Methods ⭐
**Impact**: LOW-MEDIUM | **Effort**: HIGH

**Solution**: Combine multiple models

```python
from sklearn.ensemble import VotingRegressor
from sklearn.linear_model import Ridge
from lightgbm import LGBMRegressor

# Create ensemble
ensemble = VotingRegressor([
    ('xgb', xgb.XGBRegressor(**params)),
    ('lgbm', LGBMRegressor(**params)),
    ('ridge', Ridge(alpha=1.0))
])

ensemble.fit(X_train_scaled, y_train)
```

---

## 📊 Quick Wins (Do These First!)

### 1. Reduce Overfitting (5 minutes)
```bash
# Edit backend/train_model.py
# Change parameters as shown in Strategy 2
# Then retrain:
cd backend
STEP4_TRAIN_MODEL.bat
```

### 2. Generate More Data (10 minutes)
```bash
# Edit backend/synthetic_data_generator.py
# Change days = 365 to days = 730
# Then regenerate:
cd backend
GENERATE_ML_DATA.bat
STEP2_EXPORT_DATA.bat
STEP4_TRAIN_MODEL.bat
```

### 3. Check Feature Importance (2 minutes)
```bash
# Open and review:
backend/models/feature_importance.png
# Remove features with importance < 0.01
```

---

## 🎯 Expected Improvements

### After Quick Wins
- Training R²: 0.85-0.90 (down from 0.986 - good!)
- Validation R²: 0.60-0.75 (up from -0.105 - much better!)
- Test R²: 0.60-0.75 (up from -0.058 - much better!)
- MAPE: 10-15% (down from 16%)

### After Full Optimization
- Training R²: 0.80-0.85
- Validation R²: 0.75-0.85
- Test R²: 0.75-0.85
- MAPE: 5-10%

---

## 📈 Monitoring Improvements

### Before Each Change
```bash
cd backend
python train_model.py
# Note the metrics
```

### After Each Change
```bash
cd backend
python train_model.py
# Compare metrics
# Keep change if validation R² improves
```

### Key Metrics to Watch
1. **Validation R²** (most important!)
2. **Gap between Training and Validation R²** (should be small)
3. **MAPE** (should be < 15%)

---

## 🔧 Advanced Techniques

### 1. Feature Engineering
- Add commodity-specific features
- Add seasonal indicators
- Add market trend features
- Add external data (weather, festivals)

### 2. Different Models
- Try LightGBM (often better than XGBoost)
- Try CatBoost (handles categorical features well)
- Try Neural Networks (for complex patterns)

### 3. Data Augmentation
- Add noise to training data
- Use SMOTE for balancing
- Generate synthetic scenarios

### 4. Target Engineering
- Try predicting price change % instead of absolute price
- Try log transformation of target
- Try different prediction horizons (3-day, 14-day)

---

## 📝 Implementation Checklist

- [ ] Reduce model complexity (Strategy 2)
- [ ] Generate more training data (Strategy 1)
- [ ] Remove low-importance features (Strategy 3)
- [ ] Retrain and check validation R²
- [ ] If R² > 0.70, proceed to deployment
- [ ] If R² < 0.70, try hyperparameter tuning (Strategy 5)
- [ ] Document final parameters and performance

---

## 🎓 Learning Resources

### Understanding Overfitting
- Training accuracy high, validation accuracy low = overfitting
- Solution: Reduce complexity, add data, add regularization

### XGBoost Parameters
- `max_depth`: Tree depth (lower = simpler)
- `learning_rate`: Step size (lower = more conservative)
- `n_estimators`: Number of trees (more = better, but slower)
- `min_child_weight`: Minimum samples per leaf (higher = simpler)
- `gamma`: Regularization (higher = simpler)
- `subsample`: Row sampling (lower = more regularization)
- `colsample_bytree`: Column sampling (lower = more regularization)

### Good R² Scores
- R² > 0.85: Excellent
- R² > 0.70: Good
- R² > 0.50: Fair
- R² < 0.50: Poor
- R² < 0: Very poor (worse than mean baseline)

---

**Next Steps**: Start with Quick Wins, then move to advanced strategies if needed!
