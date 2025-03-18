#pragma once

#include <vector>
#include <iostream>
#include <optional>
#include "../database/db_manager.h"
#include "../models/restaurant.h"
#include "../models/restaurant_table.h"

class RestaurantService {
private:
    Database& db;

public:
    RestaurantService(Database& database) : db(database) {}

    // Get all restaurants
    std::vector<Restaurant> getAllRestaurants();

    // Get restaurant by ID
    std::optional<Restaurant> getRestaurantById(int id);

    // Get features for a restaurant
    std::vector<RestaurantFeature> getRestaurantFeatures(int restaurantId);

    // Get tables for a restaurant
    std::vector<RestaurantTable> getRestaurantTables(int restaurantId);

    // Create a new restaurant
    int createRestaurant(const Restaurant& restaurant);

    // Update an existing restaurant
    bool updateRestaurant(const Restaurant& restaurant);

    // Delete a restaurant
    bool deleteRestaurant(int id);
}; 