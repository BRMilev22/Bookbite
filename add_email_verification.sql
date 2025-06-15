-- Add email verification fields to users table
ALTER TABLE `users` 
ADD COLUMN `email_verified` TINYINT(1) DEFAULT 0 AFTER `is_active`,
ADD COLUMN `email_verification_token` VARCHAR(255) DEFAULT NULL AFTER `email_verified`,
ADD COLUMN `email_verification_expires` TIMESTAMP NULL DEFAULT NULL AFTER `email_verification_token`;

-- Update existing users to have verified emails (so they don't get locked out)
UPDATE `users` SET `email_verified` = 1 WHERE `id` > 0;

-- Add index for email verification token
ALTER TABLE `users` ADD INDEX `idx_email_verification_token` (`email_verification_token`);
