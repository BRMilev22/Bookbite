#ifndef ENV_LOADER_H
#define ENV_LOADER_H

#include <string>
#include <map>

class EnvLoader {
public:
    EnvLoader();
    static void loadFromFile(const std::string& filename = ".env");
    static std::string getEnv(const std::string& key, const std::string& defaultValue = "");
    
private:
    static std::map<std::string, std::string> envVars;
    static void setEnv(const std::string& key, const std::string& value);
};

#endif // ENV_LOADER_H
