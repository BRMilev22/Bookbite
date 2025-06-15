#include <iostream>
#include "crow.h"
#include "presentation/apiController.h"
#include "utils/dbConnection.h"
#include "utils/envLoader.h"

int main() {
    // Load environment variables from .env file
    EnvLoader::loadFromFile(".env");
    
    // Initialize database connection to make sure it works
    DbConnection dbConn;
    if (!dbConn.isConnected()) {
        std::cerr << "Failed to connect to the database. Please check your configuration." << std::endl;
        return 1;
    }
    
    // Create Crow app
    crow::App<> app;
    
    // Configure app
    app.loglevel(crow::LogLevel::Info);
    
    // Set up API routes
    ApiController apiController;
    apiController.setupRoutes(app);
    
    // Start the server
    std::cout << "Starting BookBite server on port 8080..." << std::endl;
    app.port(8080).multithreaded().run();
    
    return 0;
}
