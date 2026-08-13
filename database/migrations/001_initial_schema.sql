-- Pharmacy Management System — Initial Schema
-- Run: sqlite3 data/pharmacy.db < database/migrations/001_initial_schema.sql

-- Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','pharmacist','technician','cashier')),
    full_name TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drug Master
CREATE TABLE IF NOT EXISTS drugs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    generic_name TEXT,
    manufacturer TEXT,
    category TEXT DEFAULT 'Tablet',
    batch_number TEXT,
    expiry_date DATE,
    stock_quantity INTEGER DEFAULT 0 CHECK(stock_quantity >= 0),
    unit_price REAL DEFAULT 0.0 CHECK(unit_price >= 0),
    reorder_level INTEGER DEFAULT 10,
    is_controlled BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    date_of_birth DATE,
    allergies TEXT,
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rx_code TEXT UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL,
    doctor_name TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','dispensed','cancelled')),
    total_amount REAL DEFAULT 0.0,
    notes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispensed_at TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    drug_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    dosage TEXT,
    duration TEXT,
    instructions TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (drug_id) REFERENCES drugs(id)
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_code TEXT UNIQUE NOT NULL,
    sale_type TEXT DEFAULT 'OTC' CHECK(sale_type IN ('OTC','PRESCRIPTION','INSURANCE')),
    total_amount REAL DEFAULT 0.0,
    payment_method TEXT DEFAULT 'Cash',
    discount_amount REAL DEFAULT 0.0,
    tax_amount REAL DEFAULT 0.0,
    final_amount REAL DEFAULT 0.0,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    drug_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (drug_id) REFERENCES drugs(id)
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT,
    record_id INTEGER,
    action TEXT NOT NULL,
    old_values TEXT,
    new_values TEXT,
    performed_by TEXT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT
);

-- Blockchain Records
CREATE TABLE IF NOT EXISTS blockchain_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tx_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    data_hash TEXT NOT NULL,
    block_index INTEGER,
    block_hash TEXT,
    performed_by TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drugs_expiry ON drugs(expiry_date);
CREATE INDEX IF NOT EXISTS idx_drugs_stock ON drugs(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_drugs_code ON drugs(drug_code);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_record ON blockchain_records(record_id);
