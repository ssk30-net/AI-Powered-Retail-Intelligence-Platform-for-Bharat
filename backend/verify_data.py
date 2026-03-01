"""
STEP 1: Verify Data Structure
Check data quality and readiness for ML training
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from tabulate import tabulate
import sys

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

class DataVerifier:
    """Verify data structure and quality for ML training"""
    
    def __init__(self):
        self.conn = psycopg2.connect(DATABASE_URL)
        self.cur = self.conn.cursor(cursor_factory=RealDictCursor)
        self.issues = []
        self.warnings = []
        
    def close(self):
        """Close database connection"""
        self.cur.close()
        self.conn.close()
    
    def check_table_counts(self):
        """Check if all tables have data"""
        print("\n" + "=" * 80)
        print("1. TABLE RECORD COUNTS")
        print("=" * 80)
        
        tables = {
            'commodities': 1,
            'regions': 1,
            'price_history': 1000,
            'sentiment_data': 100,
            'forecasts': 100
        }
        
        results = []
        for table, min_count in tables.items():
            self.cur.execute(f"SELECT COUNT(*) as count FROM {table}")
            count = self.cur.fetchone()['count']
            
            status = "✅ OK" if count >= min_count else "❌ FAIL"
            if count < min_count:
                self.issues.append(f"{table} has only {count} records (minimum: {min_count})")
            
            results.append([table, f"{count:,}", f"{min_count:,}", status])
        
        print(tabulate(results, headers=['Table', 'Count', 'Minimum', 'Status'], tablefmt='grid'))
        return len(self.issues) == 0
    
    def check_data_quality(self):
        """Check for data quality issues"""
        print("\n" + "=" * 80)
        print("2. DATA QUALITY CHECKS")
        print("=" * 80)
        
        checks = []
        
        # Check for NULL prices
        self.cur.execute("SELECT COUNT(*) as count FROM price_history WHERE price IS NULL")
        null_prices = self.cur.fetchone()['count']
        status = "✅ OK" if null_prices == 0 else "⚠️ WARNING"
        if null_prices > 0:
            self.warnings.append(f"{null_prices} NULL prices found")
        checks.append(['NULL prices', null_prices, status])
        
        # Check for negative prices
        self.cur.execute("SELECT COUNT(*) as count FROM price_history WHERE price < 0")
        negative_prices = self.cur.fetchone()['count']
        status = "✅ OK" if negative_prices == 0 else "❌ FAIL"
        if negative_prices > 0:
            self.issues.append(f"{negative_prices} negative prices found")
        checks.append(['Negative prices', negative_prices, status])
        
        # Check for zero prices
        self.cur.execute("SELECT COUNT(*) as count FROM price_history WHERE price = 0")
        zero_prices = self.cur.fetchone()['count']
        status = "✅ OK" if zero_prices == 0 else "⚠️ WARNING"
        if zero_prices > 0:
            self.warnings.append(f"{zero_prices} zero prices found")
        checks.append(['Zero prices', zero_prices, status])
        
        # Check for NULL volumes
        self.cur.execute("SELECT COUNT(*) as count FROM price_history WHERE volume IS NULL")
        null_volumes = self.cur.fetchone()['count']
        total_records = self.cur.execute("SELECT COUNT(*) as count FROM price_history")
        self.cur.execute("SELECT COUNT(*) as count FROM price_history")
        total = self.cur.fetchone()['count']
        status = "✅ OK" if null_volumes < total * 0.5 else "⚠️ WARNING"
        checks.append(['NULL volumes', null_volumes, status])
        
        # Check for duplicate price records
        self.cur.execute("""
            SELECT COUNT(*) as count FROM (
                SELECT commodity_id, region_id, recorded_at, COUNT(*) 
                FROM price_history 
                GROUP BY commodity_id, region_id, recorded_at 
                HAVING COUNT(*) > 1
            ) duplicates
        """)
        duplicates = self.cur.fetchone()['count']
        status = "✅ OK" if duplicates == 0 else "⚠️ WARNING"
        if duplicates > 0:
            self.warnings.append(f"{duplicates} duplicate price records found")
        checks.append(['Duplicate records', duplicates, status])
        
        print(tabulate(checks, headers=['Check', 'Count', 'Status'], tablefmt='grid'))
        return len([c for c in checks if c[2] == "❌ FAIL"]) == 0
    
    def check_date_ranges(self):
        """Check date ranges for training"""
        print("\n" + "=" * 80)
        print("3. DATE RANGE ANALYSIS")
        print("=" * 80)
        
        # Overall date range
        self.cur.execute("""
            SELECT 
                MIN(recorded_at) as earliest,
                MAX(recorded_at) as latest,
                MAX(recorded_at) - MIN(recorded_at) as days_span
            FROM price_history
        """)
        result = self.cur.fetchone()
        
        if result['earliest']:
            days = result['days_span'].days
            
            print(f"Earliest Date: {result['earliest']}")
            print(f"Latest Date:   {result['latest']}")
            print(f"Date Span:     {days} days ({days/365:.1f} years)")
            print()
            
            if days < 90:
                self.issues.append(f"Date range too short: {days} days (minimum: 90)")
                print("❌ FAIL: Need at least 90 days of data for training")
            elif days < 180:
                self.warnings.append(f"Date range is short: {days} days (recommended: 180+)")
                print("⚠️ WARNING: More data recommended (180+ days)")
            else:
                print("✅ OK: Sufficient date range for training")
        else:
            self.issues.append("No date information found")
            print("❌ FAIL: No date information")
        
        # Date range by source
        print("\n" + "-" * 80)
        print("Date Range by Source:")
        print("-" * 80)
        
        self.cur.execute("""
            SELECT 
                source,
                MIN(recorded_at) as earliest,
                MAX(recorded_at) as latest,
                COUNT(*) as records
            FROM price_history
            GROUP BY source
            ORDER BY records DESC
        """)
        
        sources = []
        for row in self.cur.fetchall():
            days = (row['latest'] - row['earliest']).days
            sources.append([
                row['source'],
                row['earliest'],
                row['latest'],
                days,
                f"{row['records']:,}"
            ])
        
        print(tabulate(sources, 
                      headers=['Source', 'Earliest', 'Latest', 'Days', 'Records'],
                      tablefmt='grid'))
        
        return len([i for i in self.issues if 'Date range' in i]) == 0
    
    def check_commodity_coverage(self):
        """Check commodity data coverage"""
        print("\n" + "=" * 80)
        print("4. COMMODITY DATA COVERAGE")
        print("=" * 80)
        
        self.cur.execute("""
            SELECT 
                c.id,
                c.name,
                COUNT(DISTINCT ph.region_id) as regions,
                COUNT(ph.id) as price_records,
                COUNT(DISTINCT DATE(ph.recorded_at)) as unique_days,
                COUNT(sd.id) as sentiment_records,
                COUNT(f.id) as forecast_records
            FROM commodities c
            LEFT JOIN price_history ph ON c.id = ph.commodity_id
            LEFT JOIN sentiment_data sd ON c.id = sd.commodity_id
            LEFT JOIN forecasts f ON c.id = f.commodity_id
            WHERE c.is_active = TRUE
            GROUP BY c.id, c.name
            ORDER BY price_records DESC
            LIMIT 10
        """)
        
        commodities = []
        for row in self.cur.fetchall():
            status = "✅" if row['price_records'] >= 100 else "⚠️"
            commodities.append([
                row['name'][:30],
                row['regions'],
                f"{row['price_records']:,}",
                row['unique_days'],
                row['sentiment_records'],
                row['forecast_records'],
                status
            ])
        
        print(tabulate(commodities,
                      headers=['Commodity', 'Regions', 'Prices', 'Days', 'Sentiment', 'Forecasts', 'Status'],
                      tablefmt='grid'))
        
        # Check for commodities with insufficient data
        self.cur.execute("""
            SELECT COUNT(*) as count
            FROM commodities c
            LEFT JOIN price_history ph ON c.id = ph.commodity_id
            WHERE c.is_active = TRUE
            GROUP BY c.id
            HAVING COUNT(ph.id) < 100
        """)
        
        insufficient = self.cur.fetchone()
        if insufficient and insufficient['count'] > 0:
            self.warnings.append(f"{insufficient['count']} commodities have < 100 price records")
        
        return True
    
    def check_feature_availability(self):
        """Check availability of features for ML"""
        print("\n" + "=" * 80)
        print("5. FEATURE AVAILABILITY")
        print("=" * 80)
        
        features = []
        
        # Price data
        self.cur.execute("SELECT COUNT(*) as count FROM price_history")
        price_count = self.cur.fetchone()['count']
        features.append(['Price History', f"{price_count:,}", '✅ Available'])
        
        # Volume data
        self.cur.execute("SELECT COUNT(*) as count FROM price_history WHERE volume IS NOT NULL")
        volume_count = self.cur.fetchone()['count']
        status = '✅ Available' if volume_count > 0 else '⚠️ Limited'
        features.append(['Volume Data', f"{volume_count:,}", status])
        
        # Sentiment data
        self.cur.execute("SELECT COUNT(*) as count FROM sentiment_data")
        sentiment_count = self.cur.fetchone()['count']
        status = '✅ Available' if sentiment_count > 0 else '❌ Missing'
        if sentiment_count == 0:
            self.issues.append("No sentiment data available")
        features.append(['Sentiment Data', f"{sentiment_count:,}", status])
        
        # Forecast data
        self.cur.execute("SELECT COUNT(*) as count FROM forecasts")
        forecast_count = self.cur.fetchone()['count']
        status = '✅ Available' if forecast_count > 0 else '⚠️ Missing'
        features.append(['Forecast Data', f"{forecast_count:,}", status])
        
        # Regional data
        self.cur.execute("SELECT COUNT(DISTINCT region_id) as count FROM price_history")
        region_count = self.cur.fetchone()['count']
        features.append(['Unique Regions', f"{region_count:,}", '✅ Available'])
        
        # Time features (can be derived)
        features.append(['Time Features', 'Derivable', '✅ Available'])
        
        print(tabulate(features, headers=['Feature', 'Count', 'Status'], tablefmt='grid'))
        
        return sentiment_count > 0
    
    def generate_summary(self):
        """Generate final summary"""
        print("\n" + "=" * 80)
        print("VERIFICATION SUMMARY")
        print("=" * 80)
        
        if len(self.issues) == 0 and len(self.warnings) == 0:
            print("\n✅ ALL CHECKS PASSED!")
            print("\nYour data is ready for ML training.")
            print("Proceed to STEP 2: Export Training Dataset")
            return True
        else:
            if len(self.issues) > 0:
                print("\n❌ CRITICAL ISSUES FOUND:")
                for i, issue in enumerate(self.issues, 1):
                    print(f"  {i}. {issue}")
            
            if len(self.warnings) > 0:
                print("\n⚠️ WARNINGS:")
                for i, warning in enumerate(self.warnings, 1):
                    print(f"  {i}. {warning}")
            
            if len(self.issues) > 0:
                print("\n❌ FIX CRITICAL ISSUES BEFORE PROCEEDING")
                print("Run LOAD_ALL_DATA.bat to load missing data")
                return False
            else:
                print("\n⚠️ WARNINGS FOUND BUT CAN PROCEED")
                print("Data quality could be improved but training is possible")
                return True

def main():
    """Main execution"""
    print("=" * 80)
    print("STEP 1: VERIFY DATA STRUCTURE")
    print("=" * 80)
    print("\nChecking data quality and readiness for ML training...")
    
    verifier = DataVerifier()
    
    try:
        # Run all checks
        verifier.check_table_counts()
        verifier.check_data_quality()
        verifier.check_date_ranges()
        verifier.check_commodity_coverage()
        verifier.check_feature_availability()
        
        # Generate summary
        success = verifier.generate_summary()
        
        print("\n" + "=" * 80)
        
        # Exit with appropriate code
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"\n❌ Error during verification: {e}")
        sys.exit(1)
    finally:
        verifier.close()

if __name__ == "__main__":
    main()
