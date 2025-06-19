#include "utils/dbConnection.h"
#include <iostream>
#include <thread>
#include <chrono>

DbConnection::DbConnection() {
    connectionString = "Driver={MariaDB};Server=localhost;Port=3306;Database=bookbite;User=root;Password=;";
    setupConnection();
}

DbConnection::~DbConnection() {
    if (connection.connected()) {
        connection.disconnect();
    }
}

void DbConnection::setupConnection() {
    try {
        connection = nanodbc::connection(connectionString);
        std::cout << "Database connection established successfully." << std::endl;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database connection error: " << e.what() << std::endl;
    }
}

nanodbc::connection DbConnection::getConnection() {
    return createConnection();
}

nanodbc::connection DbConnection::createConnection() {
    std::string connStr = "Driver={MariaDB};Server=localhost;Port=3306;Database=bookbite;User=root;Password=;";
    try {
        nanodbc::connection conn(connStr);
        return conn;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Failed to create database connection: " << e.what() << std::endl;
        throw;
    }
}

bool DbConnection::isConnected() {
    return connection.connected();
}
