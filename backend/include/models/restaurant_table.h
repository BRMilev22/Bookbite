#pragma once

#include <string>

enum class TableShape {
    Rectangle,
    Circle,
    Custom
};

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
    // Layout information for interactive map
    int positionX = 0;
    int positionY = 0;
    int width = 50;
    int height = 50;
    TableShape shape = TableShape::Rectangle;
    bool isAvailable = true; // Flag to indicate if the table is available (not reserved)
}; 