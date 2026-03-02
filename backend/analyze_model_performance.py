"""
Comprehensive Model Performance Analysis
Analyzes test_results.csv to provide detailed metrics
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path

# Read test results
results_path = Path('backend/models/test_results.csv')
df = pd.read_csv(results_path)

print("=" * 80)
print("MODEL PERFORMANCE ANALYSIS")
print("=" * 80)

# Basic statistics
print(f"\nDataset Size: {len(df):,} predictions")
print(f"Date Range: {df['date'].min()} to {df['date'].max()}")
print(f"Commodities: {df['commodity_name'].nunique()} unique")

# Calculate overall metrics
rmse = np.sqrt(np.mean(df['error'] ** 2))
mae = np.mean(np.abs(df['error']))
mape = np.mean(np.abs(df['error_pct']))
r2 = 1 - (np.sum(df['error'] ** 2) / np.sum((df['actual_price'] - df['actual_price'].mean()) ** 2))

# Calculate accuracy metrics
# For regression, we define accuracy as predictions within X% of actual
accuracy_5pct = (np.abs(df['error_pct']) <= 5).sum() / len(df) * 100
accuracy_10pct = (np.abs(df['error_pct']) <= 10).sum() / len(df) * 100
accuracy_15pct = (np.abs(df['error_pct']) <= 15).sum() / len(df) * 100
accuracy_20pct = (np.abs(df['error_pct']) <= 20).sum() / len(df) * 100

# Calculate confidence intervals
confidence_95 = 1.96 * np.std(df['error']) / np.sqrt(len(df))
confidence_99 = 2.576 * np.std(df['error']) / np.sqrt(len(df))

print("\n" + "=" * 80)
print("OVERALL PERFORMANCE METRICS")
print("=" * 80)

print(f"\n📊 Regression Metrics:")
print(f"  RMSE (Root Mean Squared Error): ₹{rmse:.2f}")
print(f"  MAE (Mean Absolute Error):      ₹{mae:.2f}")
print(f"  MAPE (Mean Absolute % Error):   {mape:.2f}%")
print(f"  R² Score:                       {r2:.4f}")

print(f"\n🎯 Accuracy Metrics (Predictions within X% of actual):")
print(f"  Within ±5%:   {accuracy_5pct:.2f}% of predictions")
print(f"  Within ±10%:  {accuracy_10pct:.2f}% of predictions")
print(f"  Within ±15%:  {accuracy_15pct:.2f}% of predictions")
print(f"  Within ±20%:  {accuracy_20pct:.2f}% of predictions")

print(f"\n📈 Confidence Intervals:")
print(f"  95% Confidence: ±₹{confidence_95:.2f}")
print(f"  99% Confidence: ±₹{confidence_99:.2f}")

print(f"\n📉 Error Distribution:")
print(f"  Mean Error:     ₹{df['error'].mean():.2f}")
print(f"  Median Error:   ₹{df['error'].median():.2f}")
print(f"  Std Dev Error:  ₹{df['error'].std():.2f}")
print(f"  Min Error:      ₹{df['error'].min():.2f}")
print(f"  Max Error:      ₹{df['error'].max():.2f}")

# Model quality assessment
print("\n" + "=" * 80)
print("MODEL QUALITY ASSESSMENT")
print("=" * 80)

if r2 > 0.85:
    quality = "EXCELLENT ✅"
elif r2 > 0.70:
    quality = "GOOD ✅"
elif r2 > 0.50:
    quality = "FAIR ⚠️"
else:
    quality = "POOR ❌"

print(f"\nR² Score: {r2:.4f} - {quality}")

if mape < 10:
    mape_quality = "EXCELLENT ✅"
elif mape < 15:
    mape_quality = "GOOD ✅"
elif mape < 20:
    mape_quality = "FAIR ⚠️"
else:
    mape_quality = "POOR ❌"

print(f"MAPE: {mape:.2f}% - {mape_quality}")

if accuracy_10pct > 70:
    acc_quality = "EXCELLENT ✅"
elif accuracy_10pct > 50:
    acc_quality = "GOOD ✅"
elif accuracy_10pct > 30:
    acc_quality = "FAIR ⚠️"
else:
    acc_quality = "POOR ❌"

print(f"Accuracy (±10%): {accuracy_10pct:.2f}% - {acc_quality}")

# Overall confidence
if r2 > 0.70 and mape < 15 and accuracy_10pct > 50:
    confidence = "HIGH ✅"
elif r2 > 0.50 and mape < 20 and accuracy_10pct > 30:
    confidence = "MEDIUM ⚠️"
else:
    confidence = "LOW ❌"

print(f"\n🎯 Overall Model Confidence: {confidence}")

# Per-commodity analysis
print("\n" + "=" * 80)
print("PER-COMMODITY PERFORMANCE")
print("=" * 80)

commodity_stats = df.groupby('commodity_name').agg({
    'error': ['count', 'mean', 'std'],
    'error_pct': 'mean',
    'actual_price': 'mean'
}).round(2)

commodity_stats.columns = ['Count', 'Avg Error (₹)', 'Std Dev (₹)', 'MAPE (%)', 'Avg Price (₹)']
commodity_stats = commodity_stats.sort_values('MAPE (%)')

print("\nBest Performing Commodities (Lowest MAPE):")
print(commodity_stats.head(5).to_string())

print("\nWorst Performing Commodities (Highest MAPE):")
print(commodity_stats.tail(5).to_string())

# Prediction bias analysis
print("\n" + "=" * 80)
print("PREDICTION BIAS ANALYSIS")
print("=" * 80)

overpredict = (df['error'] < 0).sum()
underpredict = (df['error'] > 0).sum()
exact = (df['error'] == 0).sum()

print(f"\nPrediction Tendency:")
print(f"  Over-predictions:  {overpredict:,} ({overpredict/len(df)*100:.1f}%)")
print(f"  Under-predictions: {underpredict:,} ({underpredict/len(df)*100:.1f}%)")
print(f"  Exact predictions: {exact:,} ({exact/len(df)*100:.1f}%)")

bias = df['error'].mean()
if abs(bias) < 5:
    bias_assessment = "UNBIASED ✅"
elif abs(bias) < 10:
    bias_assessment = "SLIGHTLY BIASED ⚠️"
else:
    bias_assessment = "BIASED ❌"

print(f"\nBias: ₹{bias:.2f} - {bias_assessment}")

# Error quartiles
print("\n" + "=" * 80)
print("ERROR DISTRIBUTION QUARTILES")
print("=" * 80)

quartiles = df['error_pct'].abs().quantile([0.25, 0.5, 0.75, 0.9, 0.95, 0.99])
print(f"\n25% of predictions have error < {quartiles[0.25]:.2f}%")
print(f"50% of predictions have error < {quartiles[0.5]:.2f}%")
print(f"75% of predictions have error < {quartiles[0.75]:.2f}%")
print(f"90% of predictions have error < {quartiles[0.9]:.2f}%")
print(f"95% of predictions have error < {quartiles[0.95]:.2f}%")
print(f"99% of predictions have error < {quartiles[0.99]:.2f}%")

# Generate visualizations
print("\n" + "=" * 80)
print("GENERATING VISUALIZATIONS")
print("=" * 80)

fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# 1. Error distribution
axes[0, 0].hist(df['error_pct'], bins=50, edgecolor='black', alpha=0.7)
axes[0, 0].axvline(0, color='red', linestyle='--', linewidth=2)
axes[0, 0].set_xlabel('Error Percentage (%)')
axes[0, 0].set_ylabel('Frequency')
axes[0, 0].set_title('Error Distribution')
axes[0, 0].grid(True, alpha=0.3)

# 2. Predicted vs Actual
axes[0, 1].scatter(df['actual_price'], df['predicted_price'], alpha=0.5, s=10)
axes[0, 1].plot([df['actual_price'].min(), df['actual_price'].max()], 
                [df['actual_price'].min(), df['actual_price'].max()], 
                'r--', linewidth=2, label='Perfect Prediction')
axes[0, 1].set_xlabel('Actual Price (₹)')
axes[0, 1].set_ylabel('Predicted Price (₹)')
axes[0, 1].set_title('Predicted vs Actual Prices')
axes[0, 1].legend()
axes[0, 1].grid(True, alpha=0.3)

# 3. Error over time
df['date'] = pd.to_datetime(df['date'])
daily_error = df.groupby('date')['error_pct'].mean()
axes[1, 0].plot(daily_error.index, daily_error.values, linewidth=1)
axes[1, 0].axhline(0, color='red', linestyle='--', linewidth=2)
axes[1, 0].set_xlabel('Date')
axes[1, 0].set_ylabel('Average Error (%)')
axes[1, 0].set_title('Error Over Time')
axes[1, 0].grid(True, alpha=0.3)
axes[1, 0].tick_params(axis='x', rotation=45)

# 4. Accuracy by commodity
commodity_accuracy = df.groupby('commodity_name').apply(
    lambda x: (np.abs(x['error_pct']) <= 10).sum() / len(x) * 100
).sort_values(ascending=False)

axes[1, 1].barh(range(len(commodity_accuracy)), commodity_accuracy.values)
axes[1, 1].set_yticks(range(len(commodity_accuracy)))
axes[1, 1].set_yticklabels(commodity_accuracy.index, fontsize=8)
axes[1, 1].set_xlabel('Accuracy (% within ±10%)')
axes[1, 1].set_title('Accuracy by Commodity')
axes[1, 1].grid(True, alpha=0.3, axis='x')

plt.tight_layout()
plt.savefig('backend/models/performance_analysis.png', dpi=300, bbox_inches='tight')
print("\n✅ Visualizations saved: backend/models/performance_analysis.png")

# Summary report
print("\n" + "=" * 80)
print("SUMMARY & RECOMMENDATIONS")
print("=" * 80)

print(f"\n📊 Model Performance Summary:")
print(f"  • R² Score: {r2:.4f} ({quality})")
print(f"  • MAPE: {mape:.2f}% ({mape_quality})")
print(f"  • Accuracy (±10%): {accuracy_10pct:.2f}% ({acc_quality})")
print(f"  • Overall Confidence: {confidence}")

print(f"\n💡 Key Insights:")
if r2 < 0:
    print(f"  ⚠️ Negative R² indicates model performs worse than baseline")
    print(f"  ⚠️ Model needs significant improvement")
elif r2 < 0.50:
    print(f"  ⚠️ Low R² indicates poor model fit")
    print(f"  ⚠️ Consider adding more features or data")
elif r2 < 0.70:
    print(f"  ⚠️ Fair R² but room for improvement")
    print(f"  ⚠️ Try hyperparameter tuning")
else:
    print(f"  ✅ Good R² score indicates strong model performance")

if mape > 20:
    print(f"  ⚠️ High MAPE indicates large prediction errors")
    print(f"  ⚠️ Review feature engineering and data quality")
elif mape > 15:
    print(f"  ⚠️ Moderate MAPE - acceptable but can improve")
else:
    print(f"  ✅ Low MAPE indicates accurate predictions")

if accuracy_10pct < 50:
    print(f"  ⚠️ Less than half of predictions within ±10%")
    print(f"  ⚠️ Model reliability is questionable")
else:
    print(f"  ✅ Majority of predictions within ±10% tolerance")

print(f"\n🎯 Recommendations:")
if r2 < 0.70 or mape > 15:
    print(f"  1. Reduce model complexity (see MODEL_IMPROVEMENT_GUIDE.md)")
    print(f"  2. Generate more training data")
    print(f"  3. Perform hyperparameter tuning")
    print(f"  4. Review feature importance and remove weak features")
else:
    print(f"  1. Model is performing well - ready for deployment")
    print(f"  2. Monitor performance in production")
    print(f"  3. Consider ensemble methods for further improvement")

print("\n" + "=" * 80)
print("✅ ANALYSIS COMPLETE")
print("=" * 80)
print(f"\nReports generated:")
print(f"  • backend/models/performance_analysis.png")
print(f"  • Console output (this report)")
print("\n" + "=" * 80)
