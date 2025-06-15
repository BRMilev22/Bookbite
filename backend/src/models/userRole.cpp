#include "models/userRole.h"
#include <algorithm>

UserRole::UserRole() : id(0) {}

UserRole::UserRole(int id, const std::string& name, const std::string& description, 
                   const std::vector<std::string>& permissions)
    : id(id), name(name), description(description), permissions(permissions) {}

int UserRole::getId() const {
    return id;
}

std::string UserRole::getName() const {
    return name;
}

std::string UserRole::getDescription() const {
    return description;
}

std::vector<std::string> UserRole::getPermissions() const {
    return permissions;
}

void UserRole::setId(int id) {
    this->id = id;
}

void UserRole::setName(const std::string& name) {
    this->name = name;
}

void UserRole::setDescription(const std::string& description) {
    this->description = description;
}

void UserRole::setPermissions(const std::vector<std::string>& permissions) {
    this->permissions = permissions;
}

bool UserRole::hasPermission(const std::string& permission) const {
    return std::find(permissions.begin(), permissions.end(), permission) != permissions.end();
}
