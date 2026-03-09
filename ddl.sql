-- SHG Bank System Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    join_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_type VARCHAR(20) NOT NULL,
    total_loan_amount FLOAT NOT NULL,
    description TEXT,
    payment_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    days_late INTEGER DEFAULT 0,
    penalty_amount FLOAT DEFAULT 0.0,
    total_pending_amount FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Loans table
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount FLOAT NOT NULL,
    interest_rate FLOAT DEFAULT 2.0,
    installments INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loans_member_id ON loans(member_id);
CREATE INDEX idx_loans_status ON loans(status);

-- Insert default admin user (password: admin123)
-- Note: This is a bcrypt hash of 'admin123'
INSERT INTO users (phone, name, password, is_admin, is_active)
VALUES ('1234567890', 'Admin User', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVr/qvIyW', TRUE, TRUE)
ON CONFLICT (phone) DO NOTHING;
