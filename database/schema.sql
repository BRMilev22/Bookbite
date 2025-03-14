-- BookBite Restaurant Reservation System Database Schema

-- Drop database if exists (be careful with this in production)
DROP DATABASE IF EXISTS bookbite;

-- Create database
CREATE DATABASE bookbite;

-- Use the database
USE bookbite;

-- Customers table
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables in the restaurant
CREATE TABLE restaurant_tables (
    table_id INT AUTO_INCREMENT PRIMARY KEY,
    table_number INT NOT NULL UNIQUE,
    capacity INT NOT NULL,
    location VARCHAR(50) -- e.g., 'window', 'center', 'outdoor', etc.
);

-- Reservations
CREATE TABLE reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    table_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    party_size INT NOT NULL,
    status ENUM('confirmed', 'pending', 'cancelled', 'completed') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (table_id) REFERENCES restaurant_tables(table_id)
);

-- Insert some sample tables
INSERT INTO restaurant_tables (table_number, capacity, location) VALUES
(1, 2, 'window'),
(2, 2, 'window'),
(3, 4, 'center'),
(4, 4, 'center'),
(5, 6, 'center'),
(6, 8, 'window'),
(7, 2, 'outdoor'),
(8, 4, 'outdoor'),
(9, 6, 'outdoor'),
(10, 10, 'private room'); 