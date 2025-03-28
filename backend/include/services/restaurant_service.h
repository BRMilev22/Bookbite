#pragma once

#include <vector>
#include <iostream>
#include <optional>
#include <map>
#include <string>
#include "../database/db_manager.h"
#include "../models/restaurant.h"
#include "../models/restaurant_table.h"

// Filter structure for restaurants
struct RestaurantFilter {
    std::optional<std::string> location;
    std::optional<std::string> category;
    std::optional<double> minRating;
    std::optional<std::string> priceRange;
    std::optional<bool> isSpecial;
    std::optional<bool> isRecommended;
    std::optional<bool> isTrending;
    std::optional<std::string> date; // For availability filtering
    std::optional<std::string> time; // For availability filtering
    std::optional<int> partySize;    // For availability filtering
};

class RestaurantService {
private:
    Database& db;

public:
    RestaurantService(Database& database) : db(database) {}

    // Get all restaurants
    std::vector<Restaurant> getAllRestaurants();

    // Get all restaurants with filters
    std::vector<Restaurant> getFilteredRestaurants(const RestaurantFilter& filter);

    // Get restaurant by ID
    std::optional<Restaurant> getRestaurantById(int id);

    // Get features for a restaurant
    std::vector<RestaurantFeature> getRestaurantFeatures(int restaurantId);

    // Get tables for a restaurant
    std::vector<RestaurantTable> getRestaurantTables(int restaurantId);

    // Get tables for a restaurant with availability information for a specific date and time
    std::vector<RestaurantTable> getRestaurantTablesWithAvailability(
        int restaurantId, const std::string& date, 
        const std::string& startTime, const std::string& endTime);

    // Check if a restaurant has available tables for a given date, time range, and party size
    bool hasAvailableTables(int restaurantId, const std::string& date, 
                           const std::string& startTime, const std::string& endTime, 
                           int partySize);

    // Get all reservations for tables in a restaurant on a specific date
    std::map<int, std::vector<std::pair<std::string, std::string>>> getTableReservationsForDate(
        int restaurantId, const std::string& date);

    // Get restaurant image by ID
    std::optional<std::string> getRestaurantImageById(int restaurantId);

    // Create a new restaurant
    int createRestaurant(const Restaurant& restaurant);

    // Update an existing restaurant
    bool updateRestaurant(const Restaurant& restaurant);

    // Delete a restaurant
    bool deleteRestaurant(int id);

private:
    // Build a WHERE clause from filter parameters
    std::string buildFilterWhereClause(const RestaurantFilter& filter, std::map<std::string, std::string>& params);
}; 