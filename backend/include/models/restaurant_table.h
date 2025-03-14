#pragma once

#include <string>

// Simple restaurant table data structure
struct RestaurantTable {
    int id = 0;
    int tableNumber = 0;
    int capacity = 0;
    std::string location;
}; 