import os
import sqlite3

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///tmp/pharmacy.db")
DB_PATH = DATABASE_URL.replace("sqlite://", "") if not DATABASE_URL.startswith("postgres") else "/tmp/pharmacy.db"

def get_db():
    if DATABASE_URL.startswith("postgres"):
        import psycopg2
        from psycopg2.extras import RealDictCursor
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        return conn, "postgres"
    else:
        path = DATABASE_URL.replace("sqlite://", "")
        conn = sqlite3.connect(path)
        conn.row_factory = sqlite3.Row
        return conn, "sqlite"

def init_tables(conn, db_type: str):
    cur = conn.cursor()
    if db_type == "postgres":
        cur.execute("CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, full_name VARCHAR(255), phone VARCHAR(50), role VARCHAR(50) DEFAULT 'customer', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        cur.execute("CREATE TABLE IF NOT EXISTS customers (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), address TEXT, city VARCHAR(100) DEFAULT 'Kathmandu')")
        cur.execute("CREATE TABLE IF NOT EXISTS drugs (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, generic_name VARCHAR(255), drug_code VARCHAR(100) UNIQUE, category VARCHAR(100), manufacturer VARCHAR(255), stock INTEGER DEFAULT 0, reorder_point INTEGER DEFAULT 10, cost_price NUMERIC(10,2) DEFAULT 0, selling_price NUMERIC(10,2) DEFAULT 0, expiry_date DATE, barcode VARCHAR(100), controlled BOOLEAN DEFAULT FALSE, image TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        cur.execute("CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), total NUMERIC(10,2) DEFAULT 0, status VARCHAR(50) DEFAULT 'pending', payment_method VARCHAR(50), shipping_address JSONB, prescription_id VARCHAR(100), notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        cur.execute("CREATE TABLE IF NOT EXISTS order_items (id SERIAL PRIMARY KEY, order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, drug_id INTEGER REFERENCES drugs(id), quantity INTEGER DEFAULT 1, price NUMERIC(10,2) DEFAULT 0)")
        cur.execute("CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, full_name VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        cur.execute("CREATE TABLE IF NOT EXISTS prescriptions (id SERIAL PRIMARY KEY, customer_id INTEGER REFERENCES customers(id), image_url TEXT, status VARCHAR(50) DEFAULT 'pending', notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    else:
        cur.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, full_name TEXT, phone TEXT, role TEXT DEFAULT 'customer', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        cur.execute("CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER REFERENCES users(id), address TEXT, city TEXT DEFAULT 'Kathmandu')")
        cur.execute("CREATE TABLE IF NOT EXISTS drugs (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, generic_name TEXT, drug_code TEXT UNIQUE, category TEXT, manufacturer TEXT, stock INTEGER DEFAULT 0, reorder_point INTEGER DEFAULT 10, cost_price REAL DEFAULT 0, selling_price REAL DEFAULT 0, expiry_date TEXT, barcode TEXT, controlled INTEGER DEFAULT 0, image TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        cur.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER REFERENCES customers(id), total REAL DEFAULT 0, status TEXT DEFAULT 'pending', payment_method TEXT, shipping_address TEXT, prescription_id TEXT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        cur.execute("CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, drug_id INTEGER REFERENCES drugs(id), quantity INTEGER DEFAULT 1, price REAL DEFAULT 0)")
        cur.execute("CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, full_name TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
        cur.execute("CREATE TABLE IF NOT EXISTS prescriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER REFERENCES customers(id), image_url TEXT, status TEXT DEFAULT 'pending', notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    conn.commit()
    cur.close()

def seed_drugs(conn, db_type: str):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) as count FROM drugs")
    row = cur.fetchone()
    count = row["count"] if db_type == "postgres" else row[0]
    if count > 0:
        cur.close()
        return
    drugs = [
        ("Paracetamol 500mg", "Acetaminophen", "PCM500", "Pain Relief", "GSK", 100, 20, 2.5, 5.0, "2027-06-01", "8901234567890", False),
        ("Ibuprofen 400mg", "Ibuprofen", "IBU400", "Pain Relief", "Cipla", 80, 15, 4.0, 8.0, "2027-08-15", "8901234567891", False),
        ("Amoxicillin 250mg", "Amoxicillin", "AMX250", "Antibiotics", "Sun Pharma", 50, 10, 15.0, 30.0, "2026-12-20", "8901234567892", True),
        ("Cetirizine 10mg", "Cetirizine", "CET10", "Allergy", "Dr Reddy", 120, 25, 3.0, 6.0, "2027-05-10", "8901234567893", False),
        ("Metformin 500mg", "Metformin", "MET500", "Diabetes", "USV", 60, 12, 8.0, 16.0, "2027-03-15", "8901234567894", False),
        ("Omeprazole 20mg", "Omeprazole", "OME20", "Gastric", "Lupin", 90, 18, 5.0, 10.0, "2027-07-22", "8901234567895", False),
        ("Aspirin 75mg", "Aspirin", "ASP75", "Cardiac", "Bayer", 200, 40, 1.5, 3.0, "2027-09-01", "8901234567896", False),
        ("ORS Sachet", "Oral Rehydration Salts", "ORS001", "Electrolytes", "WHO", 300, 50, 5.0, 10.0, "2028-01-01", "8901234567897", False),
        ("Vitamin D3 60K", "Cholecalciferol", "VITD60", "Vitamins", "Mankind", 180, 30, 5.0, 10.0, "2027-07-20", "8901234567898", False),
        ("Cough Syrup 100ml", "Dextromethorphan", "COU100", "Cold & Flu", "P&G", 70, 14, 25.0, 50.0, "2027-04-10", "8901234567899", False),
        ("Insulin Glargine", "Insulin Glargine", "INS001", "Diabetes", "Sanofi", 40, 8, 250.0, 500.0, "2026-11-30", "8901234567900", True),
        ("Azithromycin 500mg", "Azithromycin", "AZI500", "Antibiotics", "Pfizer", 55, 11, 20.0, 40.0, "2027-02-28", "8901234567901", False),
    ]
    ph = "%s" if db_type == "postgres" else "?"
    sql = f"INSERT INTO drugs (name, generic_name, drug_code, category, manufacturer, stock, reorder_point, cost_price, selling_price, expiry_date, barcode, controlled) VALUES ({','.join([ph]*12)})"
    for d in drugs:
        cur.execute(sql, d)
    conn.commit()
    cur.close()
    print(f"Seeded {len(drugs)} drugs into {'PostgreSQL' if db_type == 'postgres' else 'SQLite'}")

def seed_admins(conn, db_type: str):
    cur = conn.cursor()
    import hashlib
    admin_hash = hashlib.sha256("admin123".encode()).hexdigest()
    ph = "%s" if db_type == "postgres" else "?"
    cur.execute(f"INSERT INTO admins (email, password_hash, full_name) VALUES ({ph}, {ph}, {ph}) ON CONFLICT DO NOTHING",
                ("admin@pharmapro.com", admin_hash, "Admin User"))
    conn.commit()
    cur.close()
    print("Admin seed checked")
