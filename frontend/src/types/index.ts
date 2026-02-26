// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  industry?: string;
  is_first_login: boolean;
  created_at: string;
}

export interface AuthResponse {
  user_id: string;
  email: string;
  token: string;
  refresh_token: string;
  is_first_login: boolean;
}

// Commodity Types
export interface Commodity {
  id: number;
  name: string;
  category: string;
  unit: string;
  description?: string;
}

// Price Types
export interface PriceData {
  date: string;
  price: number;
  volume?: number;
}

export interface PriceTrend {
  commodity_id: number;
  commodity_name: string;
  data_points: PriceData[];
}

// Forecast Types
export interface ForecastPoint {
  date: string;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

export interface Forecast {
  commodity_id: number;
  commodity_name: string;
  historical: PriceData[];
  forecast: ForecastPoint[];
  explanation: string;
  accuracy: number;
}

// Dashboard KPIs
export interface DashboardKPIs {
  price_change_percent: number;
  demand_index: number;
  sentiment_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

// Alert Types
export interface Alert {
  id: number;
  type: 'price_spike' | 'demand_change' | 'supply_disruption' | 'forecast_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  commodity_id?: number;
  is_read: boolean;
  is_acknowledged: boolean;
  triggered_at: string;
}

// Sentiment Types
export interface SentimentData {
  overall_sentiment: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  trending_topics: string[];
}

export interface NewsArticle {
  title: string;
  sentiment: number;
  source: string;
  published_at: string;
  url?: string;
}

// Price Sensitivity Types
export interface PriceSensitivity {
  commodity_id: number;
  elasticity_coefficient: number;
  optimal_price: number;
  current_price: number;
  demand_at_optimal: number;
  revenue_at_optimal: number;
}

export interface SimulationResult {
  new_price: number;
  predicted_demand: number;
  predicted_revenue: number;
  revenue_change_percent: number;
  risk_level: 'low' | 'medium' | 'high';
}

// Copilot Types
export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  created_at: string;
  isUser: boolean;
}

export interface CopilotResponse {
  response: string;
  confidence: number;
  sources: string[];
  follow_up_suggestions: string[];
}

// Upload Types
export interface DataUpload {
  upload_id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  rows_processed: number;
  uploaded_at: string;
  error_message?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Insights Types
export interface MarketOpportunity {
  type: string;
  commodity_id: number;
  commodity_name: string;
  description: string;
  potential_roi: number;
  risk_level: 'low' | 'medium' | 'high';
}

export interface ForecastAccuracy {
  overall_accuracy: number;
  by_commodity: {
    commodity_id: number;
    commodity_name: string;
    accuracy: number;
    mape: number;
  }[];
}

// Chart Data Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface ChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}
