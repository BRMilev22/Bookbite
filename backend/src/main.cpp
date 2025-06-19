#include <iostream>
#include "crow.h"
#include "presentation/apiController.h"
#include "utils/dbConnection.h"
#include "utils/envLoader.h"

int main() {
    EnvLoader::loadFromFile(".env");
    
    DbConnection dbConn;
    if (!dbConn.isConnected()) {
        std::cerr << "Failed to connect to the database. Please check your configuration." << std::endl;
        return 1;
    }
    
    crow::App<> app;
    
    app.loglevel(crow::LogLevel::Info);
    
    ApiController apiController;
    apiController.setupRoutes(app);
    
    std::cout << "Starting BookBite server on port 8080..." << std::endl;
    app.port(8080).multithreaded().run();
    
    return 0;
}
