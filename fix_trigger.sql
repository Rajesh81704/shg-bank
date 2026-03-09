-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS set_transaction_id ON payments;
DROP FUNCTION IF EXISTS generate_transaction_id();

-- Create corrected function
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_id IS NULL OR NEW.transaction_id = '' THEN
        NEW.transaction_id = 'TXN' || COALESCE(NEW.member_id::TEXT, '0') || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER set_transaction_id
BEFORE INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION generate_transaction_id();
