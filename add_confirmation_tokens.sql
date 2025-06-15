-- Add confirmation token field to reservations table
ALTER TABLE reservations ADD COLUMN confirmation_token VARCHAR(255) DEFAULT NULL;
ALTER TABLE reservations ADD COLUMN confirmed_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE reservations ADD INDEX idx_confirmation_token (confirmation_token);

-- Update existing reservations to have 'confirmed' status for those that are already confirmed
UPDATE reservations SET confirmed_at = created_at WHERE status = 'confirmed';
