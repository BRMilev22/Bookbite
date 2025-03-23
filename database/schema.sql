-- BookBite Restaurant Reservation System Database Schema

-- Drop database if exists (be careful with this in production)
DROP DATABASE IF EXISTS bookbite;

-- Create database
CREATE DATABASE bookbite;

-- Use the database
USE bookbite;

-- Users table for authentication and customer info
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(64) NOT NULL, -- SHA-256 hash (64 characters)
    role ENUM('user', 'admin') DEFAULT 'user',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone) VALUES
('admin', 'admin@bookbite.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'Admin', 'User', '555-0000');

-- Restaurants table
CREATE TABLE restaurants (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    distance VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    price_range VARCHAR(50) NOT NULL,
    rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
    rating_label VARCHAR(50) NOT NULL DEFAULT 'Good',
    reviews INT NOT NULL DEFAULT 0,
    is_special BOOLEAN DEFAULT FALSE,
    is_recommended BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables in the restaurant
CREATE TABLE restaurant_tables (
    table_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    table_number INT NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(50), -- e.g., 'window', 'center', 'outdoor', etc.
    table_type VARCHAR(100) NOT NULL DEFAULT 'Standard Table',
    table_details VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE, -- to mark tables as active or inactive
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

-- Features table for restaurants
CREATE TABLE restaurant_features (
    feature_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id)
);

-- Reservations
CREATE TABLE reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    table_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    party_size INT NOT NULL,
    status ENUM('confirmed', 'pending', 'cancelled', 'completed') DEFAULT 'pending',
    special_requests TEXT,
    occasion VARCHAR(100), -- storing occasion directly as text
    dietary_restrictions TEXT, -- storing dietary restrictions as comma-separated text
    promo_code VARCHAR(20),
    price DECIMAL(10, 2) DEFAULT 0.00, -- price of the reservation in dollars
    -- Billing information
    billing_address VARCHAR(255) NULL,
    postal_code VARCHAR(20) NULL,
    city VARCHAR(100) NULL,
    payment_method VARCHAR(50) NULL,
    -- For security, only store last 4 digits and payment token instead of full card details
    card_last_four VARCHAR(4) NULL,
    payment_token VARCHAR(255) NULL, -- Token from payment processor
    name_on_card VARCHAR(100) NULL,
    -- Contact information
    phone_number VARCHAR(20) NULL,
    -- Pricing details
    base_fee DECIMAL(10, 2) NULL,
    service_fee DECIMAL(10, 2) NULL,
    person_fee DECIMAL(10, 2) NULL,
    discount_amount DECIMAL(10, 2) NULL,
    discount_percentage INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(table_id),
    INDEX idx_reservations_date (reservation_date)
);

-- Promo codes for discounts
CREATE TABLE promo_codes (
    promo_id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    discount_percentage INT NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INT DEFAULT NULL,
    current_uses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample promo code
INSERT INTO promo_codes (code, discount_percentage, start_date, end_date) VALUES
('FIRSTBITE', 15, '2023-01-01', '2026-12-31');

-- Insert sample restaurants
INSERT INTO restaurants (name, image_url, location, distance, category, price_range, rating, rating_label, reviews, is_special, is_recommended, is_trending) VALUES
('Spice Route Bistro', 'https://via.placeholder.com/600x400?text=Spice+Route', 'City Center', '0.3 km from city center', 'Italian', 'from $50/meal', 4.8, 'Outstanding', 307, TRUE, TRUE, FALSE),
('Harborview Grill', 'https://via.placeholder.com/600x400?text=Harborview', 'Waterfront', '1.5 km from city center', 'Seafood', 'from $80/meal', 4.7, 'Great', 223, TRUE, FALSE, FALSE),
('Green Garden Cafe', 'https://via.placeholder.com/600x400?text=Green+Garden', 'Botanical Garden', '1.2 km from downtown', 'Vegetarian', 'from $30/meal', 4.9, 'Outstanding', 106, FALSE, FALSE, TRUE),
('Urban Spice Kitchen', 'https://via.placeholder.com/600x400?text=Urban+Spice', 'Downtown', '2.0 km from city center', 'Asian Fusion', 'from $40/meal', 4.6, 'Great', 220, TRUE, FALSE, TRUE),
('Sizzle Street Diner', 'https://via.placeholder.com/600x400?text=Sizzle+Street', 'Cultural District', '0.8 km from city center', 'Steakhouse', 'from $25/meal', 4.5, 'Great', 185, FALSE, TRUE, FALSE);

-- Insert restaurant features
INSERT INTO restaurant_features (restaurant_id, feature_name) VALUES
(1, 'Flexible booking'),
(1, 'Complimentary'),
(2, 'Flexible cancellation'),
(3, 'Strict cancellation policy'),
(4, 'Flexible booking'),
(5, 'Outdoor seating');

-- Insert some sample tables
INSERT INTO restaurant_tables (restaurant_id, table_number, capacity, location, table_type, table_details) VALUES
(1, 1, 2, 'window', 'Table for two', '2x table for two, 1x window view'),
(1, 2, 2, 'window', 'Table for two', '2x table for two, 1x window view'),
(1, 3, 4, 'center', 'Family table', '1x table for four, center location'),
(2, 4, 4, 'center', 'Standard table', '1x table for four, center location'),
(2, 5, 6, 'center', 'Group table', '1x table for six, center location'),
(3, 6, 8, 'window', 'Party table', '1x large table, window view'),
(3, 7, 2, 'outdoor', 'Romantic table', '1x table for two, garden view'),
(4, 8, 4, 'outdoor', 'Family table', '1x table for four, terrace location'),
(4, 9, 6, 'outdoor', 'Party table', '1x table for six, outdoor location'),
(5, 10, 10, 'private room', 'VIP table', '1x table for ten, private dining');
