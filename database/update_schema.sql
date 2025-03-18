-- Use the database
USE bookbite;

-- Update existing reservations with the new pricing model
-- Base fee + additional guests + service fee - discount
UPDATE reservations r
LEFT JOIN promo_codes p ON r.promo_code = p.code
SET 
  r.price = (
    -- Base fee
    10.0 +
    -- Additional guests fee (party size - 1) * $5.00
    (IF(r.party_size > 1, r.party_size - 1, 0) * 5.0) +
    -- Service fee 5%
    ((10.0 + (IF(r.party_size > 1, r.party_size - 1, 0) * 5.0)) * 0.05) -
    -- Discount (if promo code exists)
    IF(
      r.promo_code IS NOT NULL AND p.discount_percentage IS NOT NULL,
      ((10.0 + (IF(r.party_size > 1, r.party_size - 1, 0) * 5.0)) * (1 + 0.05) * (p.discount_percentage / 100.0)),
      0
    )
  ); 