#include "../../include/database/db_manager.h"
#include <stdexcept>
#include <iostream>

Database::Database(const DatabaseConfig& config) {
    try {
        std::string connStr = "Driver=MariaDB;Server=" + config.server + 
                             ";Database=" + config.database + 
                             ";UID=" + config.username + 
                             ";PWD=" + config.password + 
                             ";Port=" + config.port;
        conn = nanodbc::connection(connStr);
        std::cout << "Database connection successful" << std::endl;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database connection error: " << e.what() << std::endl;
        throw std::runtime_error("Failed to connect to database");
    }
}

Database::~Database() {
    try {
        if (conn.connected()) {
            conn.disconnect();
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Error disconnecting from database: " << e.what() << std::endl;
    }
}

nanodbc::result Database::query(const std::string& sql) {
    try {
        nanodbc::statement stmt(conn);
        stmt.prepare(sql);
        return stmt.execute();
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Query execution error: " << e.what() << std::endl;
        std::cerr << "Query: " << sql << std::endl;
        throw;
    }
}

void Database::execute(const std::string& sql) {
    try {
        nanodbc::statement stmt(conn);
        stmt.prepare(sql);
        stmt.execute();
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Query execution error: " << e.what() << std::endl;
        std::cerr << "Query: " << sql << std::endl;
        throw;
    }
} 