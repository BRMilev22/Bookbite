#include "../../include/services/user_service.h"
#include <iomanip>
#include <sstream>
#include <openssl/evp.h>

UserService::UserService(Database& db) : db(db) {}

std::vector<User> UserService::getAllUsers() {
    std::vector<User> users;
    
    auto result = db.query("SELECT user_id, username, email, password_hash, role, "
                           "first_name, last_name, phone, created_at FROM users");
    
    while (result.next()) {
        User user;
        user.id = result.get<int>("user_id");
        user.username = result.get<std::string>("username");
        user.email = result.get<std::string>("email");
        user.passwordHash = result.get<std::string>("password_hash");
        user.role = result.get<std::string>("role");
        user.firstName = result.get<std::string>("first_name");
        user.lastName = result.get<std::string>("last_name");
        user.phone = result.get<std::string>("phone");
        user.createdAt = result.get<std::string>("created_at");
        
        users.push_back(user);
    }
    
    return users;
}

std::optional<User> UserService::getUserById(int id) {
    std::string sql = "SELECT user_id, username, email, password_hash, role, "
                      "first_name, last_name, phone, created_at FROM users WHERE user_id = " + 
                      std::to_string(id);
    
    auto result = db.query(sql);
    
    if (result.next()) {
        User user;
        user.id = result.get<int>("user_id");
        user.username = result.get<std::string>("username");
        user.email = result.get<std::string>("email");
        user.passwordHash = result.get<std::string>("password_hash");
        user.role = result.get<std::string>("role");
        user.firstName = result.get<std::string>("first_name");
        user.lastName = result.get<std::string>("last_name");
        user.phone = result.get<std::string>("phone");
        user.createdAt = result.get<std::string>("created_at");
        
        return user;
    }
    
    return std::nullopt;
}

// Helper function to escape single quotes in SQL strings
std::string escapeSQL(const std::string& str) {
    std::string result;
    result.reserve(str.size());
    
    for (char c : str) {
        if (c == '\'') {
            result.push_back('\''); // Duplicate single quotes to escape them
        }
        result.push_back(c);
    }
    
    return result;
}

std::optional<User> UserService::getUserByUsername(const std::string& username) {
    std::string escapedUsername = escapeSQL(username);
    std::string sql = "SELECT user_id, username, email, password_hash, role, "
                      "first_name, last_name, phone, created_at FROM users WHERE username = '" + 
                      escapedUsername + "'";
    
    auto result = db.query(sql);
    
    if (result.next()) {
        User user;
        user.id = result.get<int>("user_id");
        user.username = result.get<std::string>("username");
        user.email = result.get<std::string>("email");
        user.passwordHash = result.get<std::string>("password_hash");
        user.role = result.get<std::string>("role");
        user.firstName = result.get<std::string>("first_name");
        user.lastName = result.get<std::string>("last_name");
        user.phone = result.get<std::string>("phone");
        user.createdAt = result.get<std::string>("created_at");
        
        return user;
    }
    
    return std::nullopt;
}

std::optional<User> UserService::getUserByEmail(const std::string& email) {
    std::string escapedEmail = escapeSQL(email);
    std::string sql = "SELECT user_id, username, email, password_hash, role, "
                      "first_name, last_name, phone, created_at FROM users WHERE email = '" + 
                      escapedEmail + "'";
    
    auto result = db.query(sql);
    
    if (result.next()) {
        User user;
        user.id = result.get<int>("user_id");
        user.username = result.get<std::string>("username");
        user.email = result.get<std::string>("email");
        user.passwordHash = result.get<std::string>("password_hash");
        user.role = result.get<std::string>("role");
        user.firstName = result.get<std::string>("first_name");
        user.lastName = result.get<std::string>("last_name");
        user.phone = result.get<std::string>("phone");
        user.createdAt = result.get<std::string>("created_at");
        
        return user;
    }
    
    return std::nullopt;
}

int UserService::createUser(const User& user) {
    std::string escapedUsername = escapeSQL(user.username);
    std::string escapedEmail = escapeSQL(user.email);
    std::string escapedPasswordHash = escapeSQL(user.passwordHash);
    std::string escapedRole = escapeSQL(user.role);
    std::string escapedFirstName = escapeSQL(user.firstName);
    std::string escapedLastName = escapeSQL(user.lastName);
    std::string escapedPhone = escapeSQL(user.phone);
    
    // First perform the INSERT
    std::string insertSql = "INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone) "
                      "VALUES ('" + escapedUsername + "', '" + escapedEmail + "', '" + 
                      escapedPasswordHash + "', '" + escapedRole + "', '" + 
                      escapedFirstName + "', '" + escapedLastName + "', '" + escapedPhone + "')";
    
    try {
        // Execute the insert
        db.execute(insertSql);
        
        // Then query for the last insert ID in a separate statement
        auto result = db.query("SELECT LAST_INSERT_ID()");
        
        if (result.next()) {
            return result.get<int>(0);
        }
    } catch (const std::exception& e) {
        // Log or handle the exception
    }
    
    return 0;
}

bool UserService::updateUser(const User& user) {
    try {
        std::string escapedUsername = escapeSQL(user.username);
        std::string escapedEmail = escapeSQL(user.email);
        std::string escapedFirstName = escapeSQL(user.firstName);
        std::string escapedLastName = escapeSQL(user.lastName);
        std::string escapedPhone = escapeSQL(user.phone);
        
        std::string sql = "UPDATE users SET username = '" + escapedUsername + 
                          "', email = '" + escapedEmail + 
                          "', first_name = '" + escapedFirstName + 
                          "', last_name = '" + escapedLastName + 
                          "', phone = '" + escapedPhone +
                          "' WHERE user_id = " + std::to_string(user.id);
        
        db.execute(sql);
        return true;
    } catch (const std::exception& e) {
        return false;
    }
}

bool UserService::deleteUser(int id) {
    try {
        std::string sql = "DELETE FROM users WHERE user_id = " + std::to_string(id);
        db.execute(sql);
        return true;
    } catch (const std::exception& e) {
        return false;
    }
}

bool UserService::updateUserRole(int userId, const std::string& newRole) {
    if (newRole != "user" && newRole != "admin") {
        return false;
    }
    
    try {
        std::string escapedRole = escapeSQL(newRole);
        std::string sql = "UPDATE users SET role = '" + escapedRole + 
                          "' WHERE user_id = " + std::to_string(userId);
        
        db.execute(sql);
        return true;
    } catch (const std::exception& e) {
        return false;
    }
}

bool UserService::authenticate(const std::string& usernameOrEmail, const std::string& password) {
    std::optional<User> user;
    
    // Try to find user by username or email
    if (usernameOrEmail.find('@') != std::string::npos) {
        user = getUserByEmail(usernameOrEmail);
    } else {
        user = getUserByUsername(usernameOrEmail);
    }
    
    // If user exists, verify password
    if (user) {
        return verifyPassword(password, user->passwordHash);
    }
    
    return false;
}

std::optional<User> UserService::login(const std::string& usernameOrEmail, const std::string& password) {
    std::optional<User> user;
    
    // Try to find user by username or email
    if (usernameOrEmail.find('@') != std::string::npos) {
        user = getUserByEmail(usernameOrEmail);
    } else {
        user = getUserByUsername(usernameOrEmail);
    }
    
    // If user exists and password is valid, return the user
    if (user && verifyPassword(password, user->passwordHash)) {
        return user;
    }
    
    return std::nullopt;
}

std::string UserService::hashPassword(const std::string& password) {
    unsigned char hash[EVP_MAX_MD_SIZE];
    unsigned int hashLength;
    
    // Create and initialize digest context
    EVP_MD_CTX* context = EVP_MD_CTX_new();
    
    // Initialize digest
    EVP_DigestInit_ex(context, EVP_sha256(), nullptr);
    
    // Add password to digest
    EVP_DigestUpdate(context, password.c_str(), password.size());
    
    // Get the hash
    EVP_DigestFinal_ex(context, hash, &hashLength);
    
    // Free the context
    EVP_MD_CTX_free(context);
    
    // Convert to hex string
    std::stringstream ss;
    for (unsigned int i = 0; i < hashLength; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(hash[i]);
    }
    
    return ss.str();
}

bool UserService::verifyPassword(const std::string& password, const std::string& hashedPassword) {
    std::string computedHash = hashPassword(password);
    return computedHash == hashedPassword;
} 