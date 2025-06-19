#include "businessLogic/authService.h"
#include <openssl/sha.h>
#include <openssl/rand.h>
#include <iostream>
#include <iomanip>
#include <sstream>
#include <ctime>

AuthService::AuthService() {}

std::string AuthService::hashPassword(const std::string& password) {
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

std::string AuthService::generateToken(int userId) {
    unsigned char random[16];
    RAND_bytes(random, sizeof(random));

    std::stringstream ss;
    ss << userId << "_";
    for (int i = 0; i < sizeof(random); i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)random[i];
    }

    std::time_t now = std::time(nullptr);
    ss << "_" << now;

    return ss.str();
}

bool AuthService::registerUser(const std::string& username, const std::string& email, const std::string& password, 
                               const std::string& firstName, const std::string& lastName) {
    if (!isPasswordStrong(password)) {
        return false;
    }
    
    auto existingUsername = userData.getUserByUsername(username);
    auto existingEmail = userData.getUserByEmail(email);

    if (existingUsername || existingEmail) {
        return false;
    }

    User newUser;
    newUser.setUsername(username);
    newUser.setEmail(email);
    newUser.setPasswordHash(hashPassword(password));
    newUser.setFirstName(firstName);
    newUser.setLastName(lastName);
    newUser.setEmailVerified(false);
    
    std::string verificationToken = generateEmailVerificationToken();
    newUser.setEmailVerificationToken(verificationToken);
    
    std::time_t now = std::time(nullptr);
    std::time_t expires = now + (24 * 60 * 60);
    newUser.setEmailVerificationExpires(std::to_string(expires));

    return userData.addUser(newUser);
}

std::string AuthService::loginUser(const std::string& username, const std::string& password) {
    if (!userData.validateUser(username, hashPassword(password))) {
        return "";
    }

    auto user = userData.getUserByUsername(username);
    if (!user) {
        return "";
    }
    
    if (!user->isEmailVerified()) {
        return "EMAIL_NOT_VERIFIED";
    }

    std::string token = generateToken(user->getId());

    if (!storeTokenInDatabase(token, user->getId())) {
        return "";
    }

    return token;
}

bool AuthService::validateToken(const std::string& token) {
    return validateTokenInDatabase(token);
}

int AuthService::getUserIdFromToken(const std::string& token) {
    return getUserIdFromTokenInDatabase(token);
}

void AuthService::logoutUser(const std::string& token) {
    removeTokenFromDatabase(token);
}

bool AuthService::storeTokenInDatabase(const std::string& token, int userId) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);

        nanodbc::prepare(stmt, "INSERT INTO user_tokens (token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))");

        stmt.bind(0, token.c_str());
        stmt.bind(1, &userId);

        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error storing token: " << e.what() << std::endl;
        return false;
    }
}

bool AuthService::validateTokenInDatabase(const std::string& token) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT COUNT(*) FROM user_tokens WHERE token = ? AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())");

        stmt.bind(0, token.c_str());
        nanodbc::result result = nanodbc::execute(stmt);

        if (result.next()) {
            return result.get<int>(0) > 0;
        }
        return false;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error validating token: " << e.what() << std::endl;
        return false;
    }
}

int AuthService::getUserIdFromTokenInDatabase(const std::string& token) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT user_id FROM user_tokens WHERE token = ? AND is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW())");

        stmt.bind(0, token.c_str());
        nanodbc::result result = nanodbc::execute(stmt);

        if (result.next()) {
            return result.get<int>("user_id");
        }
        return -1;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error getting user ID from token: " << e.what() << std::endl;
        return -1;
    }
}

void AuthService::removeTokenFromDatabase(const std::string& token) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE user_tokens SET is_active = FALSE WHERE token = ?");

        stmt.bind(0, token.c_str());
        nanodbc::execute(stmt);
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error removing token: " << e.what() << std::endl;
    }
}

void AuthService::cleanupExpiredTokens() {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "DELETE FROM user_tokens WHERE expires_at IS NOT NULL AND expires_at < NOW()");

        nanodbc::execute(stmt);
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error cleaning up expired tokens: " << e.what() << std::endl;
    }
}

bool AuthService::isPasswordStrong(const std::string& password) {
    // Password requirements:
    // - At least 8 characters long
    // - Contains at least one uppercase letter
    // - Contains at least one lowercase letter
    // - Contains at least one digit
    // - Contains at least one special character
    
    if (password.length() < 8) {
        return false;
    }
    
    bool hasUpper = false;
    bool hasLower = false;
    bool hasDigit = false;
    bool hasSpecial = false;
    
    for (char c : password) {
        if (c >= 'A' && c <= 'Z') {
            hasUpper = true;
        } else if (c >= 'a' && c <= 'z') {
            hasLower = true;
        } else if (c >= '0' && c <= '9') {
            hasDigit = true;
        } else if (c == '!' || c == '@' || c == '#' || c == '$' || c == '%' || 
                   c == '^' || c == '&' || c == '*' || c == '(' || c == ')' ||
                   c == '-' || c == '_' || c == '+' || c == '=' || c == '{' ||
                   c == '}' || c == '[' || c == ']' || c == '|' || c == '\\' ||
                   c == ':' || c == ';' || c == '"' || c == '\'' || c == '<' ||
                   c == '>' || c == ',' || c == '.' || c == '?' || c == '/') {
            hasSpecial = true;
        }
    }
    
    return hasUpper && hasLower && hasDigit && hasSpecial;
}

std::string AuthService::getPasswordRequirements() {
    return "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.";
}

std::string AuthService::generateEmailVerificationToken() {
    unsigned char random[32];
    RAND_bytes(random, sizeof(random));

    std::stringstream ss;
    for (int i = 0; i < sizeof(random); i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)random[i];
    }

    return ss.str();
}

bool AuthService::verifyEmailToken(const std::string& token) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);

        nanodbc::prepare(stmt, 
            "SELECT id FROM users WHERE email_verification_token = ? AND email_verification_expires > NOW() AND email_verified = 0");
        
        stmt.bind(0, token.c_str());
        auto result = nanodbc::execute(stmt);

        if (result.next()) {
            int userId = result.get<int>(0);
            
            nanodbc::statement updateStmt(conn);
            nanodbc::prepare(updateStmt,
                "UPDATE users SET email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?");
            
            updateStmt.bind(0, &userId);
            nanodbc::execute(updateStmt);
            
            return true;
        }
        
        return false;
    } catch (const std::exception& e) {
        std::cerr << "Error verifying email token: " << e.what() << std::endl;
        return false;
    }
}
