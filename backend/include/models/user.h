#ifndef USER_H
#define USER_H

#include <string>
#include <vector>

class User {
public:
    User();
    User(int id, const std::string& username, const std::string& email, const std::string& passwordHash);
    User(int id, const std::string& username, const std::string& email, const std::string& passwordHash, 
         int roleId, const std::string& roleName, const std::vector<std::string>& permissions);
    
    int getId() const;
    std::string getUsername() const;
    std::string getEmail() const;
    std::string getPasswordHash() const;
    int getRoleId() const;
    std::string getRoleName() const;
    std::vector<std::string> getPermissions() const;
    std::string getFirstName() const;
    std::string getLastName() const;
    std::string getPhoneNumber() const;
    bool isActive() const;
    
    void setId(int id);
    void setUsername(const std::string& username);
    void setEmail(const std::string& email);
    void setPasswordHash(const std::string& passwordHash);
    void setRoleId(int roleId);
    void setRoleName(const std::string& roleName);
    void setPermissions(const std::vector<std::string>& permissions);
    void setFirstName(const std::string& firstName);
    void setLastName(const std::string& lastName);
    void setPhoneNumber(const std::string& phoneNumber);
    void setActive(bool active);
    
    bool hasPermission(const std::string& permission) const;
    bool isAdmin() const;

private:
    int id;
    std::string username;
    std::string email;
    std::string passwordHash;
    int roleId;
    std::string roleName;
    std::vector<std::string> permissions;
    std::string firstName;
    std::string lastName;
    std::string phoneNumber;
    bool active;
};

#endif // USER_H
