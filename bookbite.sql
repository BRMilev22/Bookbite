-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.28-MariaDB - Source distribution
-- Server OS:                    osx10.10
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for bookbite
CREATE DATABASE IF NOT EXISTS `bookbite` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `bookbite`;

-- Dumping structure for table bookbite.user_roles
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table bookbite.user_roles
INSERT INTO `user_roles` (`id`, `name`, `description`, `permissions`, `created_at`) VALUES
	(1, 'user', 'Regular user with basic permissions', '["make_reservation", "view_reservations", "cancel_reservation", "write_review"]', '2025-06-11 10:00:00'),
	(2, 'admin', 'Administrator with full permissions', '["make_reservation", "view_reservations", "cancel_reservation", "write_review", "manage_restaurants", "manage_users", "view_admin_panel", "promote_users"]', '2025-06-11 10:00:00');

-- Dumping structure for table bookbite.users (updated with role_id)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(64) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 1,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table bookbite.users (with role assignments)
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role_id`, `first_name`, `last_name`, `is_active`, `created_at`) VALUES
	(1, 'admin', 'admin@bookbite.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 2, 'Admin', 'User', 1, '2025-06-11 10:00:00'),
	(4, 'test', 'test@test.com', '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', 1, 'Test', 'User', 1, '2025-06-10 10:51:17');

-- Dumping structure for table bookbite.reservations
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `guest_count` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'confirmed',
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `special_requests` text DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_status` varchar(20) NOT NULL DEFAULT 'pending',
  `payment_method` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `table_id` (`table_id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_ibfk_3` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table bookbite.reservations: ~3 rows (approximately)
INSERT INTO `reservations` (`id`, `user_id`, `table_id`, `restaurant_id`, `date`, `start_time`, `end_time`, `guest_count`, `status`, `phone_number`, `email`, `special_requests`, `total_amount`, `payment_status`, `payment_method`, `created_at`) VALUES
	(1, 2, 1, 1, '2025-05-28', '19:00:00', '21:00:00', 2, 'cancelled', '(555) 123-4567', 'test@test.com', '', 50.00, 'refunded', 'card', '2025-05-27 15:28:02'),
	(2, 2, 2, 1, '2025-05-29', '12:30:00', '14:30:00', 2, 'confirmed', '(555) 123-4567', 'test@test.com', 'Window seat preferred', 50.00, 'paid', 'card', '2025-05-27 15:34:29'),
	(3, 2, 22, 3, '2025-06-04', '12:00:00', '14:00:00', 2, 'confirmed', '(555) 123-4567', 'test@test.com', '', 30.00, 'paid', 'cash', '2025-06-01 12:46:25');

-- Dumping structure for table bookbite.restaurants
CREATE TABLE IF NOT EXISTS `restaurants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `table_count` int(11) NOT NULL DEFAULT 0,
  `cuisine_type` varchar(50) DEFAULT NULL,
  `rating` decimal(3,1) DEFAULT 0.0,
  `is_featured` tinyint(1) DEFAULT 0,
  `price_range` varchar(20) DEFAULT NULL,
  `opening_time` time DEFAULT NULL,
  `closing_time` time DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `reservation_fee` decimal(10,2) NOT NULL DEFAULT 25.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table bookbite.restaurants: ~3 rows (approximately)
INSERT INTO `restaurants` (`id`, `name`, `address`, `phone_number`, `description`, `table_count`, `cuisine_type`, `rating`, `is_featured`, `price_range`, `opening_time`, `closing_time`, `image_url`, `reservation_fee`, `is_active`, `created_at`) VALUES
	(1, 'Italian Delight', '123 Main St, Cityville', '555-1234', 'Discover authentic Italian restaurants with the finest pasta and pizza.', 10, 'Italian', 3.5, 1, 'Moderate', '11:00:00', '22:00:00', 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=3870&auto=format&fit=crop', 25.00, 1, '2025-05-27 10:29:13'),
	(2, 'Sushi Haven', '456 Oak Ave, Townsville', '555-5678', 'Explore the rich flavors of Asian cuisine from sushi to spicy curries.', 8, 'Asian', 4.5, 1, 'Expensive', '12:00:00', '23:00:00', 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?q=80&w=3871&auto=format&fit=crop', 40.00, 1, '2025-05-27 10:29:13'),
	(3, 'BBQ Masters', '789 Pine Rd, Villageton', '555-9012', 'Enjoy classic American fare from gourmet burgers to steakhouses.', 12, 'American', 5.0, 1, 'Budget', '11:30:00', '22:30:00', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=3870&auto=format&fit=crop', 15.00, 1, '2025-05-27 10:29:13');

-- Dumping structure for table bookbite.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reservation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(20) NOT NULL,
  `payment_status` varchar(20) NOT NULL DEFAULT 'pending',
  `transaction_id` varchar(100) DEFAULT NULL,
  `card_last_four` varchar(4) DEFAULT NULL,
  `card_type` varchar(20) DEFAULT NULL,
  `cardholder_name` varchar(100) DEFAULT NULL,
  `billing_address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reservation_id` (`reservation_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample payment data
INSERT INTO `payments` (`reservation_id`, `user_id`, `amount`, `payment_method`, `payment_status`, `transaction_id`, `card_last_four`, `card_type`, `cardholder_name`) VALUES
	(2, 2, 50.00, 'card', 'completed', 'tx_1234567890', '1234', 'Visa', 'Test User'),
	(3, 2, 30.00, 'cash', 'pending', NULL, NULL, NULL, NULL);

-- Dumping structure for table bookbite.reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_restaurant` (`user_id`,`restaurant_id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (`rating` between 1 and 5)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table bookbite.reviews: ~5 rows (approximately)
INSERT INTO `reviews` (`id`, `user_id`, `restaurant_id`, `rating`, `comment`, `created_at`) VALUES
	(1, 1, 1, 5, 'Absolutely amazing Italian food! The pasta was freshly made and the service was impeccable.', '2025-05-27 10:29:13'),
	(2, 1, 2, 4, 'Great sushi selection and friendly staff. The ambience could be better.', '2025-05-27 10:29:13'),
	(3, 1, 3, 5, 'Best BBQ I\'ve had in years! Highly recommend the brisket and ribs.', '2025-05-27 10:29:13'),
	(16, 2, 2, 5, '', '2025-05-27 15:31:14'),
	(17, 4, 1, 2, 'sasda', '2025-06-10 11:23:02');

-- Dumping structure for table bookbite.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping structure for table bookbite.tables
CREATE TABLE IF NOT EXISTS `tables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `restaurant_id` int(11) NOT NULL,
  `seat_count` int(11) NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `tables_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table bookbite.tables: ~31 rows (approximately)
INSERT INTO `tables` (`id`, `restaurant_id`, `seat_count`, `is_available`, `created_at`) VALUES
	(1, 1, 2, 1, '2025-05-27 10:29:13'),
	(2, 1, 2, 0, '2025-05-27 10:29:13'),
	(3, 1, 4, 1, '2025-05-27 10:29:13'),
	(4, 1, 4, 1, '2025-05-27 10:29:13'),
	(5, 1, 6, 1, '2025-05-27 10:29:13'),
	(6, 1, 6, 1, '2025-05-27 10:29:13'),
	(7, 1, 8, 1, '2025-05-27 10:29:13'),
	(8, 1, 8, 1, '2025-05-27 10:29:13'),
	(9, 1, 10, 1, '2025-05-27 10:29:13'),
	(10, 1, 12, 1, '2025-05-27 10:29:13'),
	(11, 2, 2, 1, '2025-05-27 10:29:13'),
	(12, 2, 2, 1, '2025-05-27 10:29:13'),
	(13, 2, 4, 1, '2025-05-27 10:29:13'),
	(14, 2, 4, 1, '2025-05-27 10:29:13'),
	(15, 2, 6, 1, '2025-05-27 10:29:13'),
	(16, 2, 6, 1, '2025-05-27 10:29:13'),
	(17, 2, 6, 1, '2025-05-27 10:29:13'),
	(18, 2, 8, 1, '2025-05-27 10:29:13'),
	(19, 2, 10, 1, '2025-05-27 10:29:13'),
	(20, 3, 2, 1, '2025-05-27 10:29:13'),
	(21, 3, 2, 1, '2025-05-27 10:29:13'),
	(22, 3, 4, 0, '2025-05-27 10:29:13'),
	(23, 3, 4, 1, '2025-05-27 10:29:13'),
	(24, 3, 6, 1, '2025-05-27 10:29:13'),
	(25, 3, 6, 1, '2025-05-27 10:29:13'),
	(26, 3, 8, 1, '2025-05-27 10:29:13'),
	(27, 3, 8, 1, '2025-05-27 10:29:13'),
	(28, 3, 10, 1, '2025-05-27 10:29:13'),
	(29, 3, 10, 1, '2025-05-27 10:29:13'),
	(30, 3, 12, 1, '2025-05-27 10:29:13'),
	(31, 3, 12, 1, '2025-05-27 10:29:13');

-- Dumping structure for table bookbite.user_tokens
CREATE TABLE IF NOT EXISTS `user_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add admin audit log table
CREATE TABLE IF NOT EXISTS `admin_audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(11) DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `admin_user_id` (`admin_user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `admin_audit_log_ibfk_1` FOREIGN KEY (`admin_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
