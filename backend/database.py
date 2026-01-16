# backend/database.py
import sqlite3
from datetime import datetime

# The file where data will be stored
DB_NAME = "techflow.db"

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # Access columns by name (row['username'])
    return conn

def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL
    )
    ''')

    # 2. Create Messages Table (History)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id TEXT NOT NULL,
        sender_role TEXT NOT NULL,  -- 'user' or 'ai'
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Tables created successfully.")

if __name__ == "__main__":
    create_tables()