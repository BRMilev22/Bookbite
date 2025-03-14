#pragma once

#include <string>

// Simple database connection settings
struct DatabaseConfig {
    std::string server = "localhost";
    std::string database = "bookbite";
    std::string username = "root";
    std::string password = "";
    std::string port = "3306";
}; 