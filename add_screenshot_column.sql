-- Add screenshot column to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS screenshot_path VARCHAR(500);
