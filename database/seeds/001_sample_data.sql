-- Sample Data for Pharmacy Management System
-- Run after migration: sqlite3 data/pharmacy.db < database/seeds/001_sample_data.sql

-- Default admin user (password: admin123, SHA-256)
INSERT OR IGNORE INTO users (username, password_hash, role, full_name) VALUES
('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'System Administrator'),
('pharmacist1', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'pharmacist', 'John Smith'),
('cashier1', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'cashier', 'Mary Johnson');

-- Sample drugs
INSERT INTO drugs (drug_code, name, generic_name, manufacturer, category, batch_number, expiry_date, stock_quantity, unit_price, reorder_level, is_controlled) VALUES
('PARA-500', 'Paracetamol 500mg', 'Acetaminophen', 'GSK', 'Tablet', 'B2026-001', '2027-06-15', 500, 2.50, 100, 0),
('IBU-400', 'Ibuprofen 400mg', 'Ibuprofen', 'Pfizer', 'Tablet', 'B2026-012', '2027-08-20', 350, 3.00, 80, 0),
('AMOX-250', 'Amoxicillin 250mg', 'Amoxicillin', 'Novartis', 'Capsule', 'B2026-045', '2026-12-01', 200, 5.50, 50, 0),
('CET-10', 'Cetirizine 10mg', 'Cetirizine', 'Sun Pharma', 'Tablet', 'B2026-078', '2027-03-10', 800, 1.80, 150, 0),
('MET-500', 'Metformin 500mg', 'Metformin HCl', 'Teva', 'Tablet', 'B2026-090', '2027-01-25', 120, 4.20, 30, 0),
('OMEP-20', 'Omeprazole 20mg', 'Omeprazole', 'AstraZeneca', 'Capsule', 'B2026-102', '2026-09-15', 45, 6.00, 40, 0),
('CODE-30', 'Codeine Phosphate 30mg', 'Codeine Phosphate', 'Mylan', 'Tablet', 'B2026-110', '2026-11-30', 20, 12.00, 10, 1),
('INS-NOV', 'Insulin NovoRapid', 'Insulin Aspart', 'Novo Nordisk', 'Injection', 'B2026-200', '2026-10-01', 15, 45.00, 5, 1);

-- Sample patients
INSERT INTO patients (patient_code, name, phone, email, date_of_birth, allergies) VALUES
('PAT-001', 'Alice Brown', '555-0101', 'alice@email.com', '1985-03-15', 'Penicillin'),
('PAT-002', 'Bob Wilson', '555-0102', 'bob@email.com', '1978-11-22', 'None'),
('PAT-003', 'Carol Davis', '555-0103', 'carol@email.com', '1992-07-08', 'Sulfa drugs'),
('PAT-004', 'David Miller', '555-0104', NULL, '1965-01-30', 'Aspirin');

-- Sample suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('MedSupply Corp', 'James Anderson', '555-1001', 'orders@medsupply.com', '123 Industrial Ave'),
('Global Pharma Ltd', 'Sarah Lee', '555-1002', 'sales@globalpharma.com', '456 Commerce St'),
('Regional Distributors', 'Mike Chen', '555-1003', 'contact@regionaldist.com', '789 Warehouse Blvd');
