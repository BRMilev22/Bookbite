#include "utils/envLoader.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <cstdlib>

std::map<std::string, std::string> EnvLoader::envVars;

EnvLoader::EnvLoader() {}

void EnvLoader::loadFromFile(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cout << "📄 No .env file found (" << filename << "), using system environment variables" << std::endl;
        return;
    }
    
    std::string line;
    while (std::getline(file, line)) {
        // Skip empty lines and comments
        if (line.empty() || line[0] == '#') {
            continue;
        }
        
        // Find the = sign
        size_t equalPos = line.find('=');
        if (equalPos == std::string::npos) {
            continue;
        }
        
        std::string key = line.substr(0, equalPos);
        std::string value = line.substr(equalPos + 1);
        
        // Trim whitespace
        key.erase(0, key.find_first_not_of(" \t\r\n"));
        key.erase(key.find_last_not_of(" \t\r\n") + 1);
        value.erase(0, value.find_first_not_of(" \t\r\n"));
        value.erase(value.find_last_not_of(" \t\r\n") + 1);
        
        // Set the environment variable
        setEnv(key, value);
        envVars[key] = value;
    }
    
    file.close();
    std::cout << "📄 Loaded " << envVars.size() << " environment variables from " << filename << std::endl;
}

std::string EnvLoader::getEnv(const std::string& key, const std::string& defaultValue) {
    // First check our loaded env vars
    auto it = envVars.find(key);
    if (it != envVars.end()) {
        return it->second;
    }
    
    // Then check system environment
    const char* value = std::getenv(key.c_str());
    if (value) {
        return std::string(value);
    }
    
    return defaultValue;
}

void EnvLoader::setEnv(const std::string& key, const std::string& value) {
    // Set in system environment
    setenv(key.c_str(), value.c_str(), 1);
}
