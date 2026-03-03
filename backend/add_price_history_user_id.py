"""
One-time migration: add user_id column to price_history if it doesn't exist.
Run from backend folder: python add_price_history_user_id.py

Fixes: psycopg2.errors.UndefinedColumn: column "user_id" of relation "price_history" does not exist
"""
import os
import sys
from dotenv import load_dotenv
import psycopg2

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set in .env")
    sys.exit(1)

def main():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'price_history' AND column_name = 'user_id'
        """)
        if cur.fetchone():
            print("✓ price_history.user_id column already exists")
            return
        print("Adding user_id column to price_history...")
        cur.execute("""
            DO $$ BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = 'price_history' AND column_name = 'user_id'
                ) THEN
                    ALTER TABLE price_history ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
                    CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON price_history(user_id);
                END IF;
            END $$
        """)
        print("✓ price_history.user_id column added successfully")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
