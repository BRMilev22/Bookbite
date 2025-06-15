#ifndef AUTH_SERVICE_H
#define AUTH_SERVICE_H

#include "dataAccess/userData.h"
#include "utils/dbConnection.h"
#include <nanodbc/nanodbc.h>
#include <string>

class AuthService {
public:
    AuthService();
    bool registerUser(const std::string& username, const std::string& email, const std::string& password);
    std::string loginUser(const std::string& username, const std::string& password);
    bool validateToken(const std::string& token);
    int getUserIdFromToken(const std::string& token);
    void logoutUser(const std::string& token);

private:
    UserData userData;
    DbConnection dbConnection;

    std::string generateToken(int userId);
    std::string hashPassword(const std::string& password);
    
    // Database-backed token methods
    bool storeTokenInDatabase(const std::string& token, int userId);
    bool validateTokenInDatabase(const std::string& token);
    int getUserIdFromTokenInDatabase(const std::string& token);
    void removeTokenFromDatabase(const std::string& token);
    void cleanupExpiredTokens();
};

#endif // AUTH_SERVICE_H
