#include "dataAccess/userData.h"
#include <nanodbc/nanodbc.h>
#include <iostream>
#include <openssl/sha.h>
#include <iomanip>
#include <sstream>

UserData::UserData() {}

// Use this function for password hashing
std::string hashPassword(const std::string& password) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, password.c_str(), password.size());
    SHA256_Final(hash, &sha256);
    
    std::stringstream ss;
    for(int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }
    return ss.str();
}

std::vector<User> UserData::getAllUsers() {
    std::vector<User> users;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, R"(
            SELECT u.id, u.username, u.email, u.password_hash, u.role_id, u.first_name, u.last_name, 
                   u.phone_number, u.is_active, u.created_at, ur.name as role_name, ur.permissions
            FROM users u 
            LEFT JOIN user_roles ur ON u.role_id = ur.id
        )");
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            User user;
            user.setId(result.get<int>("id"));
            user.setUsername(result.get<nanodbc::string>("username", ""));
            user.setEmail(result.get<nanodbc::string>("email", ""));
            user.setPasswordHash(result.get<nanodbc::string>("password_hash", ""));
            user.setRoleId(result.get<int>("role_id", 1));
            user.setFirstName(result.get<nanodbc::string>("first_name", ""));
            user.setLastName(result.get<nanodbc::string>("last_name", ""));
            user.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            user.setActive(result.get<int>("is_active", 1) == 1);
            user.setCreatedAt(result.get<nanodbc::string>("created_at", ""));
            user.setRoleName(result.get<nanodbc::string>("role_name", "user"));
            
            // Parse permissions JSON (simplified)
            std::string permissionsJson = result.get<nanodbc::string>("permissions", "[]");
            std::vector<std::string> permissions;
            // Basic JSON parsing for permissions array
            if (permissionsJson.find("make_reservation") != std::string::npos) permissions.push_back("make_reservation");
            if (permissionsJson.find("view_reservations") != std::string::npos) permissions.push_back("view_reservations");
            if (permissionsJson.find("cancel_reservation") != std::string::npos) permissions.push_back("cancel_reservation");
            if (permissionsJson.find("write_review") != std::string::npos) permissions.push_back("write_review");
            if (permissionsJson.find("manage_restaurants") != std::string::npos) permissions.push_back("manage_restaurants");
            if (permissionsJson.find("manage_users") != std::string::npos) permissions.push_back("manage_users");
            if (permissionsJson.find("view_admin_panel") != std::string::npos) permissions.push_back("view_admin_panel");
            if (permissionsJson.find("promote_users") != std::string::npos) permissions.push_back("promote_users");
            user.setPermissions(permissions);
            
            users.push_back(user);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAllUsers: " << e.what() << std::endl;
    }
    return users;
}

std::optional<User> UserData::getUserById(int id) {
    try {
        std::cout << "DEBUG: getUserById called with id: " << id << std::endl;
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, R"(
            SELECT u.id, u.username, u.email, u.password_hash, u.role_id, u.first_name, u.last_name, 
                   u.phone_number, u.is_active, u.created_at, ur.name as role_name, ur.permissions
            FROM users u 
            LEFT JOIN user_roles ur ON u.role_id = ur.id
            WHERE u.id = ?
        )");
        stmt.bind(0, &id);
        nanodbc::result result = nanodbc::execute(stmt);
        
        std::cout << "DEBUG: Query executed successfully" << std::endl;
        
        if (result.next()) {
            std::cout << "DEBUG: Found user record" << std::endl;
            User user;
            user.setId(result.get<int>("id"));
            user.setUsername(result.get<nanodbc::string>("username", ""));
            user.setEmail(result.get<nanodbc::string>("email", ""));
            user.setPasswordHash(result.get<nanodbc::string>("password_hash", ""));
            user.setRoleId(result.get<int>("role_id", 1));
            user.setFirstName(result.get<nanodbc::string>("first_name", ""));
            user.setLastName(result.get<nanodbc::string>("last_name", ""));
            user.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            user.setActive(result.get<int>("is_active", 1) == 1);
            user.setCreatedAt(result.get<nanodbc::string>("created_at", ""));
            user.setRoleName(result.get<nanodbc::string>("role_name", "user"));
            
            // Parse permissions JSON (simplified)
            std::string permissionsJson = result.get<nanodbc::string>("permissions", "[]");
            std::vector<std::string> permissions;
            if (permissionsJson.find("make_reservation") != std::string::npos) permissions.push_back("make_reservation");
            if (permissionsJson.find("view_reservations") != std::string::npos) permissions.push_back("view_reservations");
            if (permissionsJson.find("cancel_reservation") != std::string::npos) permissions.push_back("cancel_reservation");
            if (permissionsJson.find("write_review") != std::string::npos) permissions.push_back("write_review");
            if (permissionsJson.find("manage_restaurants") != std::string::npos) permissions.push_back("manage_restaurants");
            if (permissionsJson.find("manage_users") != std::string::npos) permissions.push_back("manage_users");
            if (permissionsJson.find("view_admin_panel") != std::string::npos) permissions.push_back("view_admin_panel");
            if (permissionsJson.find("promote_users") != std::string::npos) permissions.push_back("promote_users");
            user.setPermissions(permissions);
            
            std::cout << "DEBUG: User object created successfully" << std::endl;
            return user;
        } else {
            std::cout << "DEBUG: No user found with id: " << id << std::endl;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getUserById: " << e.what() << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "General error in getUserById: " << e.what() << std::endl;
    }
    return std::nullopt;
}

std::optional<User> UserData::getUserByUsername(const std::string& username) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, username, email, password_hash, is_active, email_verified, email_verification_token, email_verification_expires FROM users WHERE username = ?");
        stmt.bind(0, username.c_str());
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            User user;
            user.setId(result.get<int>("id"));
            user.setUsername(result.get<nanodbc::string>("username", ""));
            user.setEmail(result.get<nanodbc::string>("email", ""));
            user.setPasswordHash(result.get<nanodbc::string>("password_hash", ""));
            user.setActive(result.get<int>("is_active", 1) == 1);
            user.setEmailVerified(result.get<int>("email_verified", 0) == 1);
            user.setEmailVerificationToken(result.get<nanodbc::string>("email_verification_token", ""));
            user.setEmailVerificationExpires(result.get<nanodbc::string>("email_verification_expires", ""));
            return user;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getUserByUsername: " << e.what() << std::endl;
    }
    return std::nullopt;
}

std::optional<User> UserData::getUserByEmail(const std::string& email) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, username, email, password_hash, email_verified, email_verification_token, email_verification_expires FROM users WHERE email = ?");
        stmt.bind(0, email.c_str());
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            User user;
            user.setId(result.get<int>("id"));
            user.setUsername(result.get<nanodbc::string>("username", ""));
            user.setEmail(result.get<nanodbc::string>("email", ""));
            user.setPasswordHash(result.get<nanodbc::string>("password_hash", ""));
            user.setEmailVerified(result.get<int>("email_verified", 0) == 1);
            user.setEmailVerificationToken(result.get<nanodbc::string>("email_verification_token", ""));
            user.setEmailVerificationExpires(result.get<nanodbc::string>("email_verification_expires", ""));
            return user;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getUserByEmail: " << e.what() << std::endl;
    }
    return std::nullopt;
}

bool UserData::addUser(const User& user) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, 
            "INSERT INTO users (username, email, password_hash, first_name, last_name, email_verified, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))");
        
        std::string username = user.getUsername();
        std::string email = user.getEmail();
        std::string passwordHash = user.getPasswordHash();
        std::string firstName = user.getFirstName();
        std::string lastName = user.getLastName();
        std::string verificationToken = user.getEmailVerificationToken();
        std::string expiresStr = user.getEmailVerificationExpires();
        
        int emailVerified = user.isEmailVerified() ? 1 : 0;  // Convert bool to int
        long long expires = !expiresStr.empty() ? std::stoll(expiresStr) : 0;
        
        stmt.bind(0, username.c_str());
        stmt.bind(1, email.c_str());
        stmt.bind(2, passwordHash.c_str());
        stmt.bind(3, firstName.c_str());
        stmt.bind(4, lastName.c_str());
        stmt.bind(5, &emailVerified);
        stmt.bind(6, verificationToken.c_str());
        stmt.bind(7, &expires);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in addUser: " << e.what() << std::endl;
        return false;
    }
}

bool UserData::updateUser(const User& user) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?");
        
        std::string username = user.getUsername();
        std::string email = user.getEmail();
        std::string passwordHash = user.getPasswordHash();
        int id = user.getId();
        
        stmt.bind(0, username.c_str());
        stmt.bind(1, email.c_str());
        stmt.bind(2, passwordHash.c_str());
        stmt.bind(3, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateUser: " << e.what() << std::endl;
        return false;
    }
}

bool UserData::deleteUser(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "DELETE FROM users WHERE id = ?");
        
        stmt.bind(0, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in deleteUser: " << e.what() << std::endl;
        return false;
    }
}

bool UserData::validateUser(const std::string& username, const std::string& password) {
    try {
        auto user = getUserByUsername(username);
        if (!user) {
            return false;
        }
        
        // Check if user account is active
        if (!user->isActive()) {
            std::cerr << "Login attempt for inactive user: " << username << std::endl;
            return false;
        }
        
        // Password is already hashed by AuthService before being passed here
        return password == user->getPasswordHash();
    } catch (const std::exception& e) {
        std::cerr << "Error in validateUser: " << e.what() << std::endl;
        return false;
    }
}

// Role management methods
std::vector<UserRole> UserData::getAllRoles() {
    std::vector<UserRole> roles;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, name, description, permissions FROM user_roles ORDER BY id");
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            UserRole role;
            role.setId(result.get<int>("id"));
            role.setName(result.get<nanodbc::string>("name", ""));
            role.setDescription(result.get<nanodbc::string>("description", ""));
            
            // Parse permissions JSON (simplified)
            std::string permissionsJson = result.get<nanodbc::string>("permissions", "[]");
            std::vector<std::string> permissions;
            if (permissionsJson.find("make_reservation") != std::string::npos) permissions.push_back("make_reservation");
            if (permissionsJson.find("view_reservations") != std::string::npos) permissions.push_back("view_reservations");
            if (permissionsJson.find("cancel_reservation") != std::string::npos) permissions.push_back("cancel_reservation");
            if (permissionsJson.find("write_review") != std::string::npos) permissions.push_back("write_review");
            if (permissionsJson.find("manage_restaurants") != std::string::npos) permissions.push_back("manage_restaurants");
            if (permissionsJson.find("manage_users") != std::string::npos) permissions.push_back("manage_users");
            if (permissionsJson.find("view_admin_panel") != std::string::npos) permissions.push_back("view_admin_panel");
            if (permissionsJson.find("promote_users") != std::string::npos) permissions.push_back("promote_users");
            role.setPermissions(permissions);
            
            roles.push_back(role);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAllRoles: " << e.what() << std::endl;
    }
    return roles;
}

std::optional<UserRole> UserData::getRoleById(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, name, description, permissions FROM user_roles WHERE id = ?");
        stmt.bind(0, &id);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            UserRole role;
            role.setId(result.get<int>("id"));
            role.setName(result.get<nanodbc::string>("name", ""));
            role.setDescription(result.get<nanodbc::string>("description", ""));
            
            // Parse permissions JSON (simplified)
            std::string permissionsJson = result.get<nanodbc::string>("permissions", "[]");
            std::vector<std::string> permissions;
            if (permissionsJson.find("make_reservation") != std::string::npos) permissions.push_back("make_reservation");
            if (permissionsJson.find("view_reservations") != std::string::npos) permissions.push_back("view_reservations");
            if (permissionsJson.find("cancel_reservation") != std::string::npos) permissions.push_back("cancel_reservation");
            if (permissionsJson.find("write_review") != std::string::npos) permissions.push_back("write_review");
            if (permissionsJson.find("manage_restaurants") != std::string::npos) permissions.push_back("manage_restaurants");
            if (permissionsJson.find("manage_users") != std::string::npos) permissions.push_back("manage_users");
            if (permissionsJson.find("view_admin_panel") != std::string::npos) permissions.push_back("view_admin_panel");
            if (permissionsJson.find("promote_users") != std::string::npos) permissions.push_back("promote_users");
            role.setPermissions(permissions);
            
            return role;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getRoleById: " << e.what() << std::endl;
    }
    return std::nullopt;
}

bool UserData::updateUserRole(int userId, int roleId) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE users SET role_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        
        stmt.bind(0, &roleId);
        stmt.bind(1, &userId);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateUserRole: " << e.what() << std::endl;
        return false;
    }
}

bool UserData::updateUserStatus(int userId, bool isActive) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        
        int activeStatus = isActive ? 1 : 0;
        stmt.bind(0, &activeStatus);
        stmt.bind(1, &userId);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateUserStatus: " << e.what() << std::endl;
        return false;
    }
}

bool UserData::logAdminAction(int adminUserId, const std::string& action, const std::string& targetType, 
                             int targetId, const std::string& details, const std::string& ipAddress) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, R"(
            INSERT INTO admin_audit_log (admin_user_id, action, target_type, target_id, details, ip_address) 
            VALUES (?, ?, ?, ?, ?, ?)
        )");
        
        std::string targetTypeStr = targetType.empty() ? "" : targetType;
        std::string detailsStr = details.empty() ? "" : details;
        std::string ipStr = ipAddress.empty() ? "" : ipAddress;
        
        stmt.bind(0, &adminUserId);
        stmt.bind(1, action.c_str());
        stmt.bind(2, targetTypeStr.c_str());
        if (targetId > 0) {
            stmt.bind(3, &targetId);
        } else {
            // For null values, we need to use a different approach
            // nanodbc doesn't handle nullptr well, so we'll set it to 0 or handle it differently
            int nullTargetId = 0;
            stmt.bind(3, &nullTargetId);
        }
        stmt.bind(4, detailsStr.c_str());
        stmt.bind(5, ipStr.c_str());
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in logAdminAction: " << e.what() << std::endl;
        return false;
    }
}
