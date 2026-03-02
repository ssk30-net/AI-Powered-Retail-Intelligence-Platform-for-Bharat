/**
 * ML Predictions Page
 * Allows users to input features and get price predictions from the ML model
 */
import { useState } from 'react';
import { useMLPrediction, useMLFeatures, useMLMetrics, useCommodities } from '@/lib/hooks/useAPI';
import { TrendingUp, Activity, AlertCircle, CheckCircle } from 'lucide-react';

export function MLPredictions() {
  const { prediction, loading, error, predict } = useMLPrediction();
  const { data: features } = useMLFeatures();
  const { data: metrics } = useMLMetrics();
  const { data: commodities } = useCommodities();

  // Form state for basic features
  const [formData, setFormData] = useState({
    commodity_id: '',
    price_lag_1: '',
    price_lag_7: '',
    price_lag_14: '',
    price_lag_30: '',
    price_rolling_mean_7: '',
    price_rolling_mean_14: '',
    price_rolling_mean_30: '',
    volume_lag_1: '',
    avg_sentiment: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert form data to features object
    const featuresObj: Record<string, number> = {};
    
    // Add all form fields as numbers
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && key !== 'commodity_id') {
        featuresObj[key] = parseFloat(value);
      }
    });

    // Add default values for missing features (if needed)
    // The ML API will use 0 for any missing features

    try {
      await predict(featuresObj);
    } catch (err) {
      console.error('Prediction failed:', err);
    }
  };

  const handleQuickFill = () => {
    // Fill with example data for testing
    setFormData({
      commodity_id: '1',
      price_lag_1: '2500',
      price_lag_7: '2480',
      price_lag_14: '2450',
      price_lag_30: '2400',
      price_rolling_mean_7: '2490',
      price_rolling_mean_14: '2475',
      price_rolling_mean_30: '2460',
      volume_lag_1: '1000',
      avg_sentiment: '0.5',
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          ML Price Predictions
        </h1>
        <p className="text-gray-600">
          Use our trained XGBoost model to predict commodity prices 7 days ahead
        </p>
      </div>

      {/* Model Performance Card */}
      {metrics && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Model Performance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">R² Score</p>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.r2_score?.toFixed(4) || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.r2_score > 0.8 ? '✅ Excellent' : metrics.r2_score > 0.6 ? '✓ Good' : 'Fair'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">MAPE</p>
              <p className="text-2xl font-bold text-purple-600">
                {metrics.mape?.toFixed(2) || 'N/A'}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.mape < 10 ? '✅ Excellent' : metrics.mape < 20 ? '✓ Good' : 'Fair'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">RMSE</p>
              <p className="text-2xl font-bold text-green-600">
                {metrics.rmse?.toFixed(2) || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Lower is better</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Form */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Input Features</h2>
            <button
              onClick={handleQuickFill}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Quick Fill (Example)
            </button>
          </div>

          <form onSubmit={handlePredict} className="space-y-6">
            {/* Commodity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commodity
              </label>
              <select
                name="commodity_id"
                value={formData.commodity_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a commodity</option>
                {commodities?.map((commodity) => (
                  <option key={commodity.id} value={commodity.id}>
                    {commodity.name} ({commodity.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Features */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Price History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Price (1 day ago)
                  </label>
                  <input
                    type="number"
                    name="price_lag_1"
                    value={formData.price_lag_1}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="e.g., 2500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Price (7 days ago)
                  </label>
                  <input
                    type="number"
                    name="price_lag_7"
                    value={formData.price_lag_7}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="e.g., 2480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Price (14 days ago)
                  </label>
                  <input
                    type="number"
                    name="price_lag_14"
                    value={formData.price_lag_14}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="e.g., 2450"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Price (30 days ago)
                  </label>
                  <input
                    type="number"
                    name="price_lag_30"
                    value={formData.price_lag_30}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="e.g., 2400"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Rolling Averages */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Rolling Averages</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    7-day Average
                  </label>
                  <input
                    type="number"
                    name="price_rolling_mean_7"
                    value={formData.price_rolling_mean_7}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="e.g., 2490"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    14-day Average
                  </label>
                  <input
                    type="number"
                    name="price_rolling_mean_14"
                    value={formData.price_rolling_mean_14}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="e.g., 2475"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    30-day Average
                  </label>
                  <input
                    type="number"
                    name="price_rolling_mean_30"
                    value={formData.price_rolling_mean_30}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="e.g., 2460"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Other Features */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Other Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Volume (1 day ago)
                  </label>
                  <input
                    type="number"
                    name="volume_lag_1"
                    value={formData.volume_lag_1}
                    onChange={handleInputChange}
                    step="1"
                    placeholder="e.g., 1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Average Sentiment (-1 to 1)
                  </label>
                  <input
                    type="number"
                    name="avg_sentiment"
                    value={formData.avg_sentiment}
                    onChange={handleInputChange}
                    step="0.1"
                    min="-1"
                    max="1"
                    placeholder="e.g., 0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Predicting...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5" />
                  Predict Price
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Result */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Prediction Result</h2>

            {!prediction && !error && (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Fill in the features and click "Predict Price" to get a prediction
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Prediction Failed</h3>
                    <p className="text-sm text-red-700">{error.message}</p>
                  </div>
                </div>
              </div>
            )}

            {prediction && (
              <div className="space-y-6">
                {/* Predicted Price */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <p className="text-sm text-gray-600 mb-2">Predicted Price (7 days ahead)</p>
                  <p className="text-4xl font-bold text-blue-600 mb-1">
                    ₹{prediction.predicted_price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Based on {prediction.features_used} features
                  </p>
                </div>

                {/* Confidence */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Confidence Level</p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        prediction.confidence === 'high'
                          ? 'bg-green-100 text-green-700'
                          : prediction.confidence === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {prediction.confidence.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Model Info */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Model Information</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>Version: {prediction.model_version}</p>
                    <p>Algorithm: XGBoost Regressor</p>
                    <p>Features: {prediction.features_used} / 45+</p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> This is a prediction based on historical data and may not reflect actual future prices. Use for reference only.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Information */}
      {features && (
        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Available Features ({features.length})
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            The model uses {features.length} features for prediction. The form above includes the most important ones.
          </p>
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
              View all features
            </summary>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {features.map((feature, idx) => (
                <div key={idx} className="px-3 py-2 bg-gray-50 rounded text-xs text-gray-700">
                  {feature}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
