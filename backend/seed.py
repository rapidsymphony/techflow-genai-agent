# backend/seed.py
from database import get_db_connection, create_tables

def seed_users():
    # 1. Ensure tables exist
    create_tables()
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # 2. Define our users
    users = [
        ("senthil", "password123", "MANAGER", "Senthil (Manager)"),
        ("adi", "password123", "L1_SUPPORT", "Adi (Support)")
    ]

    # 3. Insert them (ignoring errors if they already exist)
    try:
        cursor.executemany('''
        INSERT OR IGNORE INTO users (username, password, role, name)
        VALUES (?, ?, ?, ?)
        ''', users)
        conn.commit()
        print("✅ Users 'Adi' and 'Senthil' inserted into SQLite.")
    except Exception as e:
        print(f"❌ Error seeding users: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_users()