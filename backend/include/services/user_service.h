#pragma once

#include "../models/user.h"
#include "../database/db_manager.h"
#include <vector>
#include <optional>
#include <string>

// Service for handling user operations and authentication
class UserService {
public:
    UserService(Database& db);

    // User management
    std::vector<User> getAllUsers();
    std::optional<User> getUserById(int id);
    std::optional<User> getUserByUsername(const std::string& username);
    std::optional<User> getUserByEmail(const std::string& email);
    int createUser(const User& user);
    bool updateUser(const User& user);
    bool deleteUser(int id);
    bool updateUserRole(int userId, const std::string& newRole);

    // Authentication
    bool authenticate(const std::string& usernameOrEmail, const std::string& password);
    std::optional<User> login(const std::string& usernameOrEmail, const std::string& password);
    
    // Password utilities
    static std::string hashPassword(const std::string& password);
    static bool verifyPassword(const std::string& password, const std::string& hashedPassword);

private:
    Database& db;
}; 