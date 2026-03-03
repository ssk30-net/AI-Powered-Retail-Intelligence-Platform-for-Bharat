"""
RDS Database Initialization Script
Handles database creation and table setup for AWS RDS
"""
import sys
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Force reload of environment variables
load_dotenv(override=True)

def get_connection_params():
    """Extract connection parameters from DATABASE_URL"""
    database_url = os.getenv('DATABASE_URL')
    
    # Parse the URL
    # Format: postgresql://user:password@host:port/dbname?params
    import re
    pattern = r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)(\?.*)?'
    match = re.match(pattern, database_url)
    
    if not match:
        raise ValueError(f"Invalid DATABASE_URL format: {database_url}")
    
    user, password, host, port, dbname, params = match.groups()
    
    return {
        'user': user,
        'password': password,
        'host': host,
        'port': port,
        'dbname': dbname,
        'params': params or ''
    }

def create_database_if_not_exists():
    """Create aimarketpulse database if it doesn't exist"""
    print("=" * 60)
    print("CHECKING/CREATING DATABASE")
    print("=" * 60)
    
    params = get_connection_params()
    
    print(f"Host: {params['host']}")
    print(f"Port: {params['port']}")
    print(f"User: {params['user']}")
    print(f"Connecting to: {params['dbname']}")
    print()
    
    try:
        # Connect to postgres database (default)
        conn = psycopg2.connect(
            host=params['host'],
            port=params['port'],
            user=params['user'],
            password=params['password'],
            dbname='postgres',
            sslmode='require'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if aimarketpulse database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'aimarketpulse'")
        exists = cursor.fetchone()
        
        if exists:
            print("✓ Database 'aimarketpulse' already exists")
        else:
            print("Creating database 'aimarketpulse'...")
            cursor.execute("CREATE DATABASE aimarketpulse")
            print("✓ Database 'aimarketpulse' created")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print()
        print("Common issues:")
        print("  • RDS security group not allowing your IP")
        print("  • Wrong password")
        print("  • Network connectivity issues")
        return False

def create_tables():
    """Create all database tables"""
    print()
    print("=" * 60)
    print("CREATING TABLES")
    print("=" * 60)
    
    params = get_connection_params()
    
    # Update connection to use aimarketpulse database
    database_url = f"postgresql://{params['user']}:{params['password']}@{params['host']}:{params['port']}/aimarketpulse?sslmode=require"
    
    print(f"Connecting to: aimarketpulse database")
    print()
    
    try:
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            print(f"✓ Connected to PostgreSQL: {version.split(',')[0]}")
        
        # Import models and create tables
        from app.core.database import Base
        from app.models.user import User
        
        print("\n📊 Creating tables from models...")
        Base.metadata.create_all(bind=engine)
        print("✓ User table created")
        
        # Create additional tables
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
            print("✓ Commodities table created")
            
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
            print("✓ Regions table created")
            
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
            print("✓ Price History table created")

            # Add user_id to price_history if not present (for user-partitioned ingestion)
            conn.execute(text("""
                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'price_history' AND column_name = 'user_id'
                    ) THEN
                        ALTER TABLE price_history ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
                        CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON price_history(user_id);
                    END IF;
                END $$;
            """))
            print("✓ price_history.user_id column ensured")
            
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
            print("✓ Forecasts table created")
            
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
            print("✓ Sentiment Data table created")
            
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
            print("✓ Data Uploads table created")
            
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
            print("✓ Alerts table created")
            
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
            print("✓ Alert Rules table created")
            
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
            print("✓ Price Sensitivity table created")
            
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
            print("✓ User Scenarios table created")
            
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
            print("✓ Copilot Conversations table created")
            
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
            print("✓ User Preferences table created")
            
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
            print("✓ API Keys table created")
            
            conn.commit()
        
        print("\n✓ All tables created successfully!")
        
        # Insert sample data
        print("\n📦 Inserting sample data...")
        with engine.connect() as conn:
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
            print("✓ Sample commodities inserted")
            
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
            print("✓ Sample regions inserted")
            
            conn.commit()
        
        # Verify
        print("\n🔍 Verifying tables...")
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
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("AI MARKET PULSE - RDS DATABASE INITIALIZATION")
    print("=" * 60)
    print()
    
    # Step 1: Create database if needed
    if not create_database_if_not_exists():
        print("\n❌ Failed to create/connect to database")
        sys.exit(1)
    
    # Step 2: Create tables
    if not create_tables():
        print("\n❌ Failed to create tables")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ DATABASE INITIALIZATION COMPLETE!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("  1. Update backend task definition with DATABASE_URL")
    print("  2. Deploy backend to ECS")
    print("  3. Test API endpoints")
    print("=" * 60)
