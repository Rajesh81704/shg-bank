-- Migration: Add approval_status column to payments table
-- Run this on your Neon PostgreSQL database

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved';

-- Set existing paid payments as approved
UPDATE payments SET approval_status = 'approved' WHERE payment_date IS NOT NULL;

-- Set existing pending (not yet submitted) installments as NULL (not submitted)
UPDATE payments SET approval_status = NULL WHERE payment_date IS NULL AND payment_type = 'loan_installment';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_payments_approval_status ON payments(approval_status);
