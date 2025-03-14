#pragma once
#include <nanodbc/nanodbc.h>
#include <string>
#include "db_config.h"

// Simple database manager for handling database operations
class Database {
public:
    // Create a new database connection
    Database(const DatabaseConfig& config);
    
    // Execute a query and return results
    nanodbc::result query(const std::string& sql);
    
    // Execute a query that doesn't return results
    void execute(const std::string& sql);
    
    // Close the database connection
    ~Database();

private:
    nanodbc::connection conn;
}; 