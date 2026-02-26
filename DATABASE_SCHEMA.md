# AI Market Pulse - Database Schema

## PostgreSQL Schema Design

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    industry VARCHAR(100),
    is_first_login BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Commodities Table
```sql
CREATE TABLE commodities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_commodities_category ON commodities(category);
CREATE INDEX idx_commodities_name ON commodities(name);
```

### Regions Table
```sql
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_regions_name ON regions(name);
CREATE INDEX idx_regions_state ON regions(state);
```

### Price History Table
```sql
CREATE TABLE price_history (
    id BIGSERIAL PRIMARY KEY,
    commodity_id INT REFERENCES commodities(id),
    region_id INT REFERENCES regions(id),
    price DECIMAL(12, 2) NOT NULL,
    volume DECIMAL(15, 2),
    source VARCHAR(100),
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_price_commodity_time ON price_history(commodity_id, recorded_at DESC);
CREATE INDEX idx_price_region_time ON price_history(region_id, recorded_at DESC);
CREATE INDEX idx_price_recorded_at ON price_history(recorded_at DESC);
```

### Forecasts Table
```sql
CREATE TABLE forecasts (
    id SERIAL PRIMARY KEY,
    commodity_id INT REFERENCES commodities(id),
    region_id INT REFERENCES regions(id),
    forecast_date DATE NOT NULL,
    predicted_price DECIMAL(12, 2) NOT NULL,
    lower_bound DECIMAL(12, 2),
    upper_bound DECIMAL(12, 2),
    confidence_score DECIMAL(5, 4),
    model_version VARCHAR(50),
    explanation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forecast_commodity_date ON forecasts(commodity_id, forecast_date);
CREATE INDEX idx_forecast_created_at ON forecasts(created_at DESC);
```

### Sentiment Data Table
```sql
CREATE TABLE sentiment_data (
    id BIGSERIAL PRIMARY KEY,
    commodity_id INT REFERENCES commodities(id),
    source_type VARCHAR(50), -- 'news', 'social', 'article'
    source_url TEXT,
    title TEXT,
    content TEXT,
    sentiment_score DECIMAL(5, 4), -- -1 to 1
    sentiment_label VARCHAR(20), -- 'positive', 'negative', 'neutral'
    entities JSONB,
    published_at TIMESTAMP,
    processed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sentiment_commodity_time ON sentiment_data(commodity_id, published_at DESC);
CREATE INDEX idx_sentiment_score ON sentiment_data(sentiment_score);
```

### User Data Uploads Table
```sql
CREATE TABLE data_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    s3_key VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    rows_processed INT DEFAULT 0,
    error_message TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX idx_uploads_user_id ON data_uploads(user_id);
CREATE INDEX idx_uploads_status ON data_uploads(status);
CREATE INDEX idx_uploads_uploaded_at ON data_uploads(uploaded_at DESC);
```

### Alerts Table
```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    commodity_id INT REFERENCES commodities(id),
    alert_type VARCHAR(50), -- 'price_spike', 'demand_change', 'supply_disruption'
    severity VARCHAR(20), -- 'critical', 'high', 'medium', 'low'
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMP DEFAULT NOW(),
    acknowledged_at TIMESTAMP
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id, triggered_at DESC);
CREATE INDEX idx_alerts_commodity ON alerts(commodity_id);
CREATE INDEX idx_alerts_unread ON alerts(user_id, is_read) WHERE is_read = FALSE;
```

### Alert Rules Table
```sql
CREATE TABLE alert_rules (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    commodity_id INT REFERENCES commodities(id),
    rule_type VARCHAR(50), -- 'price_threshold', 'volatility', 'forecast_breach'
    condition JSONB, -- { "operator": "gt", "value": 1000 }
    is_active BOOLEAN DEFAULT TRUE,
    notification_channels JSONB, -- ['email', 'in_app', 'sms']
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alert_rules_user ON alert_rules(user_id);
CREATE INDEX idx_alert_rules_active ON alert_rules(is_active) WHERE is_active = TRUE;
```

### Price Sensitivity Analysis Table
```sql
CREATE TABLE price_sensitivity (
    id SERIAL PRIMARY KEY,
    commodity_id INT REFERENCES commodities(id),
    region_id INT REFERENCES regions(id),
    elasticity_coefficient DECIMAL(8, 4),
    optimal_price DECIMAL(12, 2),
    demand_at_optimal DECIMAL(15, 2),
    revenue_at_optimal DECIMAL(15, 2),
    calculated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sensitivity_commodity ON price_sensitivity(commodity_id);
```

### User Scenarios Table
```sql
CREATE TABLE user_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    commodity_id INT REFERENCES commodities(id),
    scenario_name VARCHAR(255),
    price_adjustment DECIMAL(5, 2), -- percentage
    predicted_demand DECIMAL(15, 2),
    predicted_revenue DECIMAL(15, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scenarios_user ON user_scenarios(user_id);
```

### Copilot Conversations Table
```sql
CREATE TABLE copilot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB,
    tokens_used INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_time ON copilot_conversations(user_id, created_at DESC);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    default_commodities INT[],
    default_regions INT[],
    dashboard_layout JSONB,
    theme VARCHAR(20) DEFAULT 'light',
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Keys Table (Future)
```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active) WHERE is_active = TRUE;
```

---

## Sample Data Inserts

### Commodities
```sql
INSERT INTO commodities (name, category, unit) VALUES
('Wheat', 'Grains', 'quintal'),
('Rice', 'Grains', 'quintal'),
('Onion', 'Vegetables', 'quintal'),
('Tomato', 'Vegetables', 'quintal'),
('Crude Oil', 'Energy', 'barrel'),
('Gold', 'Metals', 'gram'),
('Cotton', 'Textiles', 'quintal'),
('Sugar', 'Food', 'quintal');
```

### Regions
```sql
INSERT INTO regions (name, state, latitude, longitude) VALUES
('Mumbai', 'Maharashtra', 19.0760, 72.8777),
('Delhi', 'Delhi', 28.7041, 77.1025),
('Bangalore', 'Karnataka', 12.9716, 77.5946),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707),
('Kolkata', 'West Bengal', 22.5726, 88.3639);
```

---

## Database Relationships

```
users (1) ─────── (M) data_uploads
users (1) ─────── (M) alerts
users (1) ─────── (M) alert_rules
users (1) ─────── (M) user_scenarios
users (1) ─────── (M) copilot_conversations
users (1) ─────── (1) user_preferences

commodities (1) ─── (M) price_history
commodities (1) ─── (M) forecasts
commodities (1) ─── (M) sentiment_data
commodities (1) ─── (M) alerts
commodities (1) ─── (M) price_sensitivity

regions (1) ────── (M) price_history
regions (1) ────── (M) forecasts
regions (1) ────── (M) price_sensitivity
```

---

## Indexes Strategy

### Performance Indexes
- Time-based queries: `recorded_at`, `created_at` DESC
- User-specific queries: `user_id` with time
- Commodity lookups: `commodity_id` with time
- Unread alerts: Partial index on `is_read = FALSE`

### Composite Indexes
- `(commodity_id, recorded_at)` for price history queries
- `(user_id, created_at)` for user activity
- `(commodity_id, forecast_date)` for forecast lookups

---

## Data Retention Policies

### Hot Data (Fast Access)
- Last 90 days of price history
- Last 30 days of sentiment data
- Active forecasts (future dates only)
- Last 7 days of copilot conversations

### Warm Data (Archived)
- Price history > 90 days (move to S3)
- Sentiment data > 30 days
- Completed data uploads > 30 days

### Cold Data (Long-term Storage)
- Historical data > 1 year (S3 Glacier)
- Deleted user data (compliance retention)

---

## Backup Strategy

### Daily Backups
- Full PostgreSQL dump
- Store in S3 with 30-day retention
- Automated via AWS RDS snapshots

### Point-in-Time Recovery
- Enable WAL archiving
- 7-day recovery window

### Disaster Recovery
- Multi-AZ RDS deployment
- Cross-region backup replication
- RTO: 4 hours
- RPO: 1 hour
