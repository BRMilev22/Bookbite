#ifndef USER_DATA_H
#define USER_DATA_H

#include "models/user.h"
#include "models/userRole.h"
#include "utils/dbConnection.h"
#include <vector>
#include <optional>

class UserData {
public:
    UserData();
    std::vector<User> getAllUsers();
    std::optional<User> getUserById(int id);
    std::optional<User> getUserByUsername(const std::string& username);
    std::optional<User> getUserByEmail(const std::string& email);
    bool addUser(const User& user);
    bool updateUser(const User& user);
    bool deleteUser(int id);
    bool validateUser(const std::string& username, const std::string& password);
    
    // Role management
    std::vector<UserRole> getAllRoles();
    std::optional<UserRole> getRoleById(int id);
    bool updateUserRole(int userId, int roleId);
    bool updateUserStatus(int userId, bool isActive);
    
    // Admin audit logging
    bool logAdminAction(int adminUserId, const std::string& action, const std::string& targetType = "", 
                       int targetId = 0, const std::string& details = "", const std::string& ipAddress = "");

private:
    DbConnection dbConnection;
};

#endif // USER_DATA_H
