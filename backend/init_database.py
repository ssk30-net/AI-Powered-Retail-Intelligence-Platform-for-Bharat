"""
Database Initialization Script
Creates all tables for AI Market Pulse application
"""
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.database import Base
from app.models.user import User

def create_tables():
    """Create all database tables"""
    print("🔧 Initializing AI Market Pulse Database...")
    print(f"📍 Connecting to: {settings.DATABASE_URL.split('@')[1]}")  # Hide password
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version.split(',')[0]}")
        
        # Create all tables from SQLAlchemy models
        print("\n📊 Creating tables from models...")
        Base.metadata.create_all(bind=engine)
        print("✅ User table created")
        
        # Create additional tables from schema
        print("\n📊 Creating additional tables...")
        with engine.connect() as conn:
            # Commodities table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS commodities (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(100),
                    unit VARCHAR(50),
                    description TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_commodities_category ON commodities(category);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_commodities_name ON commodities(name);"))
            print("✅ Commodities table created")
            
            # Regions table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS regions (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    state VARCHAR(100),
                    country VARCHAR(100) DEFAULT 'India',
                    latitude DECIMAL(10, 8),
                    longitude DECIMAL(11, 8),
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_regions_state ON regions(state);"))
            print("✅ Regions table created")
            
            # Price History table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS price_history (
                    id BIGSERIAL PRIMARY KEY,
                    commodity_id INT REFERENCES commodities(id),
                    region_id INT REFERENCES regions(id),
                    price DECIMAL(12, 2) NOT NULL,
                    volume DECIMAL(15, 2),
                    source VARCHAR(100),
                    recorded_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_price_commodity_time ON price_history(commodity_id, recorded_at DESC);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_price_region_time ON price_history(region_id, recorded_at DESC);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_price_recorded_at ON price_history(recorded_at DESC);"))
            print("✅ Price History table created")
            
            # Forecasts table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS forecasts (
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
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_forecast_commodity_date ON forecasts(commodity_id, forecast_date);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_forecast_created_at ON forecasts(created_at DESC);"))
            print("✅ Forecasts table created")
            
            # Sentiment Data table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS sentiment_data (
                    id BIGSERIAL PRIMARY KEY,
                    commodity_id INT REFERENCES commodities(id),
                    source_type VARCHAR(50),
                    source_url TEXT,
                    title TEXT,
                    content TEXT,
                    sentiment_score DECIMAL(5, 4),
                    sentiment_label VARCHAR(20),
                    entities JSONB,
                    published_at TIMESTAMP,
                    processed_at TIMESTAMP DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_sentiment_commodity_time ON sentiment_data(commodity_id, published_at DESC);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_sentiment_score ON sentiment_data(sentiment_score);"))
            print("✅ Sentiment Data table created")
            
            # Data Uploads table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS data_uploads (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    filename VARCHAR(255) NOT NULL,
                    file_size BIGINT,
                    file_type VARCHAR(50),
                    s3_key VARCHAR(500),
                    status VARCHAR(50) DEFAULT 'pending',
                    rows_processed INT DEFAULT 0,
                    error_message TEXT,
                    uploaded_at TIMESTAMP DEFAULT NOW(),
                    processed_at TIMESTAMP
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON data_uploads(user_id);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_uploads_status ON data_uploads(status);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_at ON data_uploads(uploaded_at DESC);"))
            print("✅ Data Uploads table created")
            
            # Alerts table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS alerts (
                    id SERIAL PRIMARY KEY,
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    commodity_id INT REFERENCES commodities(id),
                    alert_type VARCHAR(50),
                    severity VARCHAR(20),
                    title VARCHAR(255) NOT NULL,
                    message TEXT,
                    metadata JSONB,
                    is_read BOOLEAN DEFAULT FALSE,
                    is_acknowledged BOOLEAN DEFAULT FALSE,
                    triggered_at TIMESTAMP DEFAULT NOW(),
                    acknowledged_at TIMESTAMP
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id, triggered_at DESC);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_alerts_commodity ON alerts(commodity_id);"))
            print("✅ Alerts table created")
            
            # Alert Rules table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS alert_rules (
                    id SERIAL PRIMARY KEY,
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    commodity_id INT REFERENCES commodities(id),
                    rule_type VARCHAR(50),
                    condition JSONB,
                    is_active BOOLEAN DEFAULT TRUE,
                    notification_channels JSONB,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_alert_rules_user ON alert_rules(user_id);"))
            print("✅ Alert Rules table created")
            
            # Price Sensitivity table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS price_sensitivity (
                    id SERIAL PRIMARY KEY,
                    commodity_id INT REFERENCES commodities(id),
                    region_id INT REFERENCES regions(id),
                    elasticity_coefficient DECIMAL(8, 4),
                    optimal_price DECIMAL(12, 2),
                    demand_at_optimal DECIMAL(15, 2),
                    revenue_at_optimal DECIMAL(15, 2),
                    calculated_at TIMESTAMP DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_sensitivity_commodity ON price_sensitivity(commodity_id);"))
            print("✅ Price Sensitivity table created")
            
            # User Scenarios table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_scenarios (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    commodity_id INT REFERENCES commodities(id),
                    scenario_name VARCHAR(255),
                    price_adjustment DECIMAL(5, 2),
                    predicted_demand DECIMAL(15, 2),
                    predicted_revenue DECIMAL(15, 2),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_scenarios_user ON user_scenarios(user_id);"))
            print("✅ User Scenarios table created")
            
            # Copilot Conversations table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS copilot_conversations (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    message TEXT NOT NULL,
                    response TEXT NOT NULL,
                    context JSONB,
                    tokens_used INT,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_conversations_user_time ON copilot_conversations(user_id, created_at DESC);"))
            print("✅ Copilot Conversations table created")
            
            # User Preferences table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_preferences (
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
            """))
            print("✅ User Preferences table created")
            
            # API Keys table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS api_keys (
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
            """))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);"))
            print("✅ API Keys table created")
            
            conn.commit()
        
        print("\n✅ All tables created successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

def insert_sample_data():
    """Insert sample commodities and regions"""
    print("\n📦 Inserting sample data...")
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            # Insert sample commodities
            conn.execute(text("""
                INSERT INTO commodities (name, category, unit, description) VALUES
                ('Wheat', 'Grains', 'quintal', 'Common cereal grain'),
                ('Rice', 'Grains', 'quintal', 'Staple food grain'),
                ('Onion', 'Vegetables', 'quintal', 'Common vegetable'),
                ('Tomato', 'Vegetables', 'quintal', 'Common vegetable'),
                ('Crude Oil', 'Energy', 'barrel', 'Petroleum product'),
                ('Gold', 'Metals', 'gram', 'Precious metal'),
                ('Cotton', 'Textiles', 'quintal', 'Natural fiber'),
                ('Sugar', 'Food', 'quintal', 'Sweetener')
                ON CONFLICT DO NOTHING;
            """))
            print("✅ Sample commodities inserted")
            
            # Insert sample regions
            conn.execute(text("""
                INSERT INTO regions (name, state, latitude, longitude) VALUES
                ('Mumbai', 'Maharashtra', 19.0760, 72.8777),
                ('Delhi', 'Delhi', 28.7041, 77.1025),
                ('Bangalore', 'Karnataka', 12.9716, 77.5946),
                ('Chennai', 'Tamil Nadu', 13.0827, 80.2707),
                ('Kolkata', 'West Bengal', 22.5726, 88.3639),
                ('Hyderabad', 'Telangana', 17.3850, 78.4867),
                ('Pune', 'Maharashtra', 18.5204, 73.8567),
                ('Ahmedabad', 'Gujarat', 23.0225, 72.5714)
                ON CONFLICT DO NOTHING;
            """))
            print("✅ Sample regions inserted")
            
            conn.commit()
        
        print("✅ Sample data inserted successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error inserting sample data: {e}")
        import traceback
        traceback.print_exc()
        return False

def verify_tables():
    """Verify all tables were created"""
    print("\n🔍 Verifying tables...")
    
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """))
            
            tables = [row[0] for row in result]
            print(f"\n📋 Found {len(tables)} tables:")
            for table in tables:
                print(f"   • {table}")
            
            return True
            
    except Exception as e:
        print(f"❌ Error verifying tables: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("AI MARKET PULSE - DATABASE INITIALIZATION")
    print("=" * 60)
    
    # Create tables
    if not create_tables():
        sys.exit(1)
    
    # Insert sample data
    if not insert_sample_data():
        print("⚠️  Warning: Sample data insertion failed, but tables were created")
    
    # Verify
    verify_tables()
    
    print("\n" + "=" * 60)
    print("✅ DATABASE INITIALIZATION COMPLETE!")
    print("=" * 60)
    print("\n💡 Next steps:")
    print("   1. Update RDS security group to allow backend access")
    print("   2. Run this script against RDS: python init_database.py")
    print("   3. Deploy backend to ECS")
    print("=" * 60)
