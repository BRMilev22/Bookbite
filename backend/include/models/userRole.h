#ifndef USER_ROLE_H
#define USER_ROLE_H

#include <string>
#include <vector>

class UserRole {
public:
    UserRole();
    UserRole(int id, const std::string& name, const std::string& description, 
             const std::vector<std::string>& permissions);
    
    int getId() const;
    std::string getName() const;
    std::string getDescription() const;
    std::vector<std::string> getPermissions() const;
    
    void setId(int id);
    void setName(const std::string& name);
    void setDescription(const std::string& description);
    void setPermissions(const std::vector<std::string>& permissions);
    
    bool hasPermission(const std::string& permission) const;

private:
    int id;
    std::string name;
    std::string description;
    std::vector<std::string> permissions;
};

#endif // USER_ROLE_H
