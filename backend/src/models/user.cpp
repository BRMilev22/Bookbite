#include "models/user.h"
#include <algorithm>

User::User() : id(0), roleId(1), active(true) {}

User::User(int id, const std::string& username, const std::string& email, const std::string& passwordHash)
    : id(id), username(username), email(email), passwordHash(passwordHash), roleId(1), active(true) {}

User::User(int id, const std::string& username, const std::string& email, const std::string& passwordHash, 
           int roleId, const std::string& roleName, const std::vector<std::string>& permissions)
    : id(id), username(username), email(email), passwordHash(passwordHash), 
      roleId(roleId), roleName(roleName), permissions(permissions), active(true) {}

int User::getId() const {
    return id;
}

std::string User::getUsername() const {
    return username;
}

std::string User::getEmail() const {
    return email;
}

std::string User::getPasswordHash() const {
    return passwordHash;
}

int User::getRoleId() const {
    return roleId;
}

std::string User::getRoleName() const {
    return roleName;
}

std::vector<std::string> User::getPermissions() const {
    return permissions;
}

std::string User::getFirstName() const {
    return firstName;
}

std::string User::getLastName() const {
    return lastName;
}

std::string User::getPhoneNumber() const {
    return phoneNumber;
}

bool User::isActive() const {
    return active;
}

void User::setId(int id) {
    this->id = id;
}

void User::setUsername(const std::string& username) {
    this->username = username;
}

void User::setEmail(const std::string& email) {
    this->email = email;
}

void User::setPasswordHash(const std::string& passwordHash) {
    this->passwordHash = passwordHash;
}

void User::setRoleId(int roleId) {
    this->roleId = roleId;
}

void User::setRoleName(const std::string& roleName) {
    this->roleName = roleName;
}

void User::setPermissions(const std::vector<std::string>& permissions) {
    this->permissions = permissions;
}

void User::setFirstName(const std::string& firstName) {
    this->firstName = firstName;
}

void User::setLastName(const std::string& lastName) {
    this->lastName = lastName;
}

void User::setPhoneNumber(const std::string& phoneNumber) {
    this->phoneNumber = phoneNumber;
}

void User::setActive(bool active) {
    this->active = active;
}

bool User::hasPermission(const std::string& permission) const {
    return std::find(permissions.begin(), permissions.end(), permission) != permissions.end();
}

bool User::isAdmin() const {
    return roleName == "admin" || hasPermission("manage_restaurants");
}
