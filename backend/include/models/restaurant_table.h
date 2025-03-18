#pragma once

#include <string>

// Simple restaurant table data structure
struct RestaurantTable {
    int id = 0;
    int restaurantId = 0;
    int tableNumber = 0;
    int capacity = 0;
    std::string location;
    std::string tableType = "Standard Table";
    std::string tableDetails;
    bool isActive = true;
}; 