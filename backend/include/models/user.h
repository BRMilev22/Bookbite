#pragma once

#include <string>

// User data structure for authentication, authorization, and customer info
struct User {
    int id = 0;
    std::string username;
    std::string email;
    std::string passwordHash;
    std::string role;
    std::string firstName;
    std::string lastName;
    std::string phone;
    std::string createdAt;
}; 