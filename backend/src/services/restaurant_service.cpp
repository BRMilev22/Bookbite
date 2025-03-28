#include "../../include/services/restaurant_service.h"
#include <sstream>
#include <stdexcept>
#include <iomanip>  // For std::setfill and std::setw
#include <unordered_set>  // For std::unordered_set

std::vector<Restaurant> RestaurantService::getAllRestaurants() {
    std::vector<Restaurant> restaurants;
    
    try {
        auto result = db.query("SELECT * FROM restaurants");
        
        while (result.next()) {
            try {
                Restaurant restaurant;
                restaurant.id = result.get<int>("restaurant_id");
                restaurant.name = result.get<std::string>("name");
                restaurant.imageUrl = result.get<std::string>("image_url");
                restaurant.location = result.get<std::string>("location");
                restaurant.distance = result.get<std::string>("distance");
                restaurant.category = result.get<std::string>("category");
                restaurant.priceRange = result.get<std::string>("price_range");
                
                // Handle rating - if it can't be converted to double, use a default value
                try {
                    restaurant.rating = result.get<double>("rating");
                } catch (const std::exception& e) {
                    std::cerr << "Error converting rating to double: " << e.what() << std::endl;
                    // Use default value
                    restaurant.rating = 4.0;
                }
                
                restaurant.ratingLabel = result.get<std::string>("rating_label");
                restaurant.reviews = result.get<int>("reviews");
                restaurant.isSpecial = result.get<int>("is_special") != 0;
                restaurant.isRecommended = result.get<int>("is_recommended") != 0;
                restaurant.isTrending = result.get<int>("is_trending") != 0;
                
                // Get features for this restaurant
                restaurant.features = getRestaurantFeatures(restaurant.id);
                
                restaurants.push_back(restaurant);
            } catch (const std::exception& e) {
                std::cerr << "Error processing restaurant record: " << e.what() << std::endl;
                // Continue to the next record instead of failing completely
                continue;
            }
        }
    } catch (const std::exception& e) {
        std::cerr << "Error in getAllRestaurants: " << e.what() << std::endl;
    }
    
    return restaurants;
}

std::optional<Restaurant> RestaurantService::getRestaurantById(int id) {
    try {
        std::ostringstream sql;
        sql << "SELECT * FROM restaurants WHERE restaurant_id = " << id;
        
        auto result = db.query(sql.str());
        
        if (result.next()) {
            Restaurant restaurant;
            restaurant.id = result.get<int>("restaurant_id");
            restaurant.name = result.get<std::string>("name");
            restaurant.imageUrl = result.get<std::string>("image_url");
            restaurant.location = result.get<std::string>("location");
            restaurant.distance = result.get<std::string>("distance");
            restaurant.category = result.get<std::string>("category");
            restaurant.priceRange = result.get<std::string>("price_range");
            
            // Handle rating with error handling
            try {
                restaurant.rating = result.get<double>("rating");
            } catch (const std::exception& e) {
                std::cerr << "Error converting rating to double: " << e.what() << std::endl;
                restaurant.rating = 4.0; // Default value
            }
            
            restaurant.ratingLabel = result.get<std::string>("rating_label");
            restaurant.reviews = result.get<int>("reviews");
            restaurant.isSpecial = result.get<int>("is_special") != 0;
            restaurant.isRecommended = result.get<int>("is_recommended") != 0;
            restaurant.isTrending = result.get<int>("is_trending") != 0;
            
            // Get features for this restaurant
            restaurant.features = getRestaurantFeatures(restaurant.id);
            
            return restaurant;
        }
    } catch (const std::exception& e) {
        std::cerr << "Error in getRestaurantById: " << e.what() << std::endl;
    }
    
    return std::nullopt;
}

std::vector<RestaurantFeature> RestaurantService::getRestaurantFeatures(int restaurantId) {
    std::vector<RestaurantFeature> features;
    
    std::ostringstream sql;
    sql << "SELECT * FROM restaurant_features WHERE restaurant_id = " << restaurantId;
    
    auto result = db.query(sql.str());
    
    while (result.next()) {
        RestaurantFeature feature;
        feature.id = result.get<int>("feature_id");
        feature.name = result.get<std::string>("feature_name");
        features.push_back(feature);
    }
    
    return features;
}

std::vector<RestaurantTable> RestaurantService::getRestaurantTables(int restaurantId) {
    std::vector<RestaurantTable> tables;
    
    std::ostringstream sql;
    sql << "SELECT table_id, restaurant_id, table_number, capacity, location, "
        << "table_type, table_details, is_active, position_x, position_y, "
        << "width, height, shape "
        << "FROM restaurant_tables WHERE restaurant_id = " << restaurantId;
    
    auto result = db.query(sql.str());
    
    while (result.next()) {
        RestaurantTable table;
        table.id = result.get<int>("table_id");
        table.restaurantId = result.get<int>("restaurant_id");
        table.tableNumber = result.get<int>("table_number");
        table.capacity = result.get<int>("capacity");
        table.location = result.get<std::string>("location");
        table.tableType = result.get<std::string>("table_type");
        table.tableDetails = result.get<std::string>("table_details");
        table.isActive = result.get<int>("is_active") != 0;
        table.positionX = result.get<int>("position_x");
        table.positionY = result.get<int>("position_y");
        table.width = result.get<int>("width");
        table.height = result.get<int>("height");
        
        // Convert shape string to enum
        std::string shapeStr = result.get<std::string>("shape");
        if (shapeStr == "circle") {
            table.shape = TableShape::Circle;
        } else if (shapeStr == "custom") {
            table.shape = TableShape::Custom;
        } else {
            table.shape = TableShape::Rectangle;
        }
        
        tables.push_back(table);
    }
    
    return tables;
}

int RestaurantService::createRestaurant(const Restaurant& restaurant) {
    // For security, you'd want to properly escape these values in a real application
    std::ostringstream sql;
    sql << "INSERT INTO restaurants (name, image_url, location, distance, category, price_range, rating, rating_label, reviews, is_special, is_recommended, is_trending) "
        << "VALUES ('" << restaurant.name << "', '" 
        << restaurant.imageUrl << "', '" 
        << restaurant.location << "', '" 
        << restaurant.distance << "', '" 
        << restaurant.category << "', '" 
        << restaurant.priceRange << "', " 
        << restaurant.rating << ", '" 
        << restaurant.ratingLabel << "', " 
        << restaurant.reviews << ", " 
        << (restaurant.isSpecial ? 1 : 0) << ", " 
        << (restaurant.isRecommended ? 1 : 0) << ", " 
        << (restaurant.isTrending ? 1 : 0) << ")";
    
    try {
        db.execute(sql.str());
        
        // Get the ID of the newly inserted restaurant
        auto idResult = db.query("SELECT LAST_INSERT_ID()");
        if (idResult.next()) {
            int restaurantId = idResult.get<int>(0);
            
            // Insert features if any
            for (const auto& feature : restaurant.features) {
                std::ostringstream featureSql;
                featureSql << "INSERT INTO restaurant_features (restaurant_id, feature_name) VALUES (" 
                           << restaurantId << ", '" << feature.name << "')";
                db.execute(featureSql.str());
            }
            
            return restaurantId;
        }
    } catch (const std::exception& e) {
        std::cerr << "Error creating restaurant: " << e.what() << std::endl;
    }
    
    return 0;
}

bool RestaurantService::updateRestaurant(const Restaurant& restaurant) {
    std::ostringstream sql;
    sql << "UPDATE restaurants SET "
        << "name = '" << restaurant.name << "', "
        << "image_url = '" << restaurant.imageUrl << "', "
        << "location = '" << restaurant.location << "', "
        << "distance = '" << restaurant.distance << "', "
        << "category = '" << restaurant.category << "', "
        << "price_range = '" << restaurant.priceRange << "', "
        << "rating = " << restaurant.rating << ", "
        << "rating_label = '" << restaurant.ratingLabel << "', "
        << "reviews = " << restaurant.reviews << ", "
        << "is_special = " << (restaurant.isSpecial ? 1 : 0) << ", "
        << "is_recommended = " << (restaurant.isRecommended ? 1 : 0) << ", "
        << "is_trending = " << (restaurant.isTrending ? 1 : 0) 
        << " WHERE restaurant_id = " << restaurant.id;
    
    try {
        db.execute(sql.str());
        
        // Delete existing features
        std::ostringstream deleteSql;
        deleteSql << "DELETE FROM restaurant_features WHERE restaurant_id = " << restaurant.id;
        db.execute(deleteSql.str());
        
        // Insert updated features
        for (const auto& feature : restaurant.features) {
            std::ostringstream featureSql;
            featureSql << "INSERT INTO restaurant_features (restaurant_id, feature_name) VALUES (" 
                       << restaurant.id << ", '" << feature.name << "')";
            db.execute(featureSql.str());
        }
        
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Error updating restaurant: " << e.what() << std::endl;
        return false;
    }
}

bool RestaurantService::deleteRestaurant(int id) {
    try {
        // First delete features
        std::ostringstream deleteFeatSql;
        deleteFeatSql << "DELETE FROM restaurant_features WHERE restaurant_id = " << id;
        db.execute(deleteFeatSql.str());
        
        // Then delete tables
        std::ostringstream deleteTableSql;
        deleteTableSql << "DELETE FROM restaurant_tables WHERE restaurant_id = " << id;
        db.execute(deleteTableSql.str());
        
        // Finally delete the restaurant
        std::ostringstream deleteRestSql;
        deleteRestSql << "DELETE FROM restaurants WHERE restaurant_id = " << id;
        db.execute(deleteRestSql.str());
        
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Error deleting restaurant: " << e.what() << std::endl;
        return false;
    }
}

std::vector<Restaurant> RestaurantService::getFilteredRestaurants(const RestaurantFilter& filter) {
    std::vector<Restaurant> restaurants;
    std::map<std::string, std::string> queryParams;
    
    try {
        // Base query
        std::stringstream query;
        query << "SELECT DISTINCT r.restaurant_id, r.name, r.image_url, r.location, r.distance, "
              << "r.category, r.price_range, r.rating, r.rating_label, r.reviews, "
              << "r.is_special, r.is_recommended, r.is_trending "
              << "FROM restaurants r ";
        
        // Join with restaurant_tables if we're checking availability
        if (filter.date.has_value() && filter.time.has_value() && filter.partySize.has_value()) {
            query << "LEFT JOIN restaurant_tables t ON r.restaurant_id = t.restaurant_id ";
        }
        
        // Build WHERE clause from filter
        std::string whereClause = buildFilterWhereClause(filter, queryParams);
        if (!whereClause.empty()) {
            query << "WHERE " << whereClause << " ";
        }
        
        // Execute the query - using the db.query() method instead of executeQuery
        auto result = db.query(query.str());
        
        // Iterate through results and fill vector
        while (result.next()) {
            Restaurant restaurant;
            restaurant.id = result.get<int>("restaurant_id");
            restaurant.name = result.get<std::string>("name");
            restaurant.imageUrl = result.get<std::string>("image_url");
            restaurant.location = result.get<std::string>("location");
            restaurant.distance = result.get<std::string>("distance");
            restaurant.category = result.get<std::string>("category");
            restaurant.priceRange = result.get<std::string>("price_range");
            restaurant.rating = result.get<double>("rating");
            restaurant.ratingLabel = result.get<std::string>("rating_label");
            restaurant.reviews = result.get<int>("reviews");
            restaurant.isSpecial = result.get<int>("is_special") != 0;
            restaurant.isRecommended = result.get<int>("is_recommended") != 0;
            restaurant.isTrending = result.get<int>("is_trending") != 0;
            
            // Get features for this restaurant
            restaurant.features = getRestaurantFeatures(restaurant.id);
            
            restaurants.push_back(restaurant);
        }
    } catch (const std::exception& e) {
        std::cerr << "Error fetching filtered restaurants: " << e.what() << std::endl;
    }
    
    return restaurants;
}

std::string RestaurantService::buildFilterWhereClause(const RestaurantFilter& filter, std::map<std::string, std::string>& params) {
    std::vector<std::string> conditions;
    
    if (filter.location.has_value() && !filter.location.value().empty()) {
        conditions.push_back("r.location = '" + filter.location.value() + "'");
    }
    
    if (filter.category.has_value() && !filter.category.value().empty()) {
        conditions.push_back("r.category = '" + filter.category.value() + "'");
    }
    
    if (filter.minRating.has_value()) {
        conditions.push_back("r.rating >= " + std::to_string(filter.minRating.value()));
    }
    
    if (filter.priceRange.has_value() && !filter.priceRange.value().empty()) {
        conditions.push_back("r.price_range = '" + filter.priceRange.value() + "'");
    }
    
    if (filter.isSpecial.has_value()) {
        conditions.push_back("r.is_special = " + std::string(filter.isSpecial.value() ? "1" : "0"));
    }
    
    if (filter.isRecommended.has_value()) {
        conditions.push_back("r.is_recommended = " + std::string(filter.isRecommended.value() ? "1" : "0"));
    }
    
    if (filter.isTrending.has_value()) {
        conditions.push_back("r.is_trending = " + std::string(filter.isTrending.value() ? "1" : "0"));
    }
    
    // Check availability if all required parameters are provided
    if (filter.date.has_value() && filter.time.has_value() && filter.partySize.has_value()) {
        // Calculate end time (default to 2 hours after start)
        std::string startTime = filter.time.value();
        int hours = std::stoi(startTime.substr(0, 2));
        int minutes = std::stoi(startTime.substr(3, 2));
        
        // Add 2 hours
        hours += 2;
        if (hours >= 24) {
            hours -= 24;
        }
        
        // Format back to HH:MM
        std::stringstream ss;
        ss << std::setfill('0') << std::setw(2) << hours << ":"
           << std::setfill('0') << std::setw(2) << minutes;
        std::string endTime = ss.str();
        
        conditions.push_back(
            "EXISTS (SELECT 1 FROM restaurant_tables t WHERE t.restaurant_id = r.restaurant_id "
            "AND t.is_active = 1 AND t.capacity >= " + std::to_string(filter.partySize.value()) + " "
            "AND t.table_id NOT IN (SELECT res.table_id FROM reservations res "
            "WHERE res.reservation_date = '" + filter.date.value() + "' AND res.status IN ('confirmed', 'pending') "
            "AND NOT (res.end_time <= '" + startTime + "' OR res.start_time >= '" + endTime + "')))"
        );
    }
    
    // Join all conditions with AND
    if (conditions.empty()) {
        return "";
    }
    
    std::string whereClause;
    for (size_t i = 0; i < conditions.size(); i++) {
        if (i > 0) {
            whereClause += " AND ";
        }
        whereClause += conditions[i];
    }
    
    return whereClause;
}

std::vector<RestaurantTable> RestaurantService::getRestaurantTablesWithAvailability(
    int restaurantId, const std::string& date, 
    const std::string& startTime, const std::string& endTime) {
    
    // Get all tables for the restaurant
    std::vector<RestaurantTable> tables = getRestaurantTables(restaurantId);
    
    try {
        // Calculate end time if not provided (default to 2 hours after start)
        std::string actualEndTime = endTime;
        if (actualEndTime.empty()) {
            // Simple implementation assuming startTime is in HH:MM format
            int hours = std::stoi(startTime.substr(0, 2));
            int minutes = std::stoi(startTime.substr(3, 2));
            
            // Add 2 hours
            hours += 2;
            if (hours >= 24) {
                hours -= 24;
            }
            
            // Format back to HH:MM
            std::stringstream ss;
            ss << std::setfill('0') << std::setw(2) << hours << ":"
               << std::setfill('0') << std::setw(2) << minutes;
            actualEndTime = ss.str();
        }
        
        // Query for reserved tables during the specified time - using standard query method
        std::ostringstream sql;
        sql << "SELECT DISTINCT rt.table_id "
            << "FROM restaurant_tables rt "
            << "INNER JOIN reservations r ON rt.table_id = r.table_id "
            << "WHERE rt.restaurant_id = " << restaurantId
            << " AND r.reservation_date = '" << date << "'"
            << " AND r.status IN ('confirmed', 'pending')"
            << " AND NOT (r.end_time <= '" << startTime << "' OR r.start_time >= '" << actualEndTime << "')";
        
        auto result = db.query(sql.str());
        
        // Create a set of reserved table IDs
        std::unordered_set<int> reservedTableIds;
        while (result.next()) {
            reservedTableIds.insert(result.get<int>("table_id"));
        }
        
        // Mark tables as available or not
        for (auto& table : tables) {
            table.isAvailable = reservedTableIds.find(table.id) == reservedTableIds.end() && table.isActive;
        }
    } catch (const std::exception& e) {
        std::cerr << "Error checking availability for restaurant " << restaurantId 
                  << " at date " << date << " time " << startTime 
                  << ": " << e.what() << std::endl;
    }
    
    return tables;
}

bool RestaurantService::hasAvailableTables(int restaurantId, const std::string& date, 
                       const std::string& startTime, const std::string& endTime, 
                       int partySize) {
    try {
        // Query for available tables
        std::string actualEndTime = endTime;
        if (actualEndTime.empty()) {
            // Simple implementation assuming startTime is in HH:MM format
            int hours = std::stoi(startTime.substr(0, 2));
            int minutes = std::stoi(startTime.substr(3, 2));
            
            // Add 2 hours
            hours += 2;
            if (hours >= 24) {
                hours -= 24;
            }
            
            // Format back to HH:MM
            std::stringstream ss;
            ss << std::setfill('0') << std::setw(2) << hours << ":"
               << std::setfill('0') << std::setw(2) << minutes;
            actualEndTime = ss.str();
        }
        
        // Use standard query method with SQL string
        std::ostringstream sql;
        sql << "SELECT COUNT(*) as available_tables "
            << "FROM restaurant_tables rt "
            << "WHERE rt.restaurant_id = " << restaurantId
            << " AND rt.is_active = 1 "
            << " AND rt.capacity >= " << partySize
            << " AND rt.table_id NOT IN ( "
            << "   SELECT r.table_id "
            << "   FROM reservations r "
            << "   WHERE r.reservation_date = '" << date << "'"
            << "   AND r.status IN ('confirmed', 'pending') "
            << "   AND NOT (r.end_time <= '" << startTime << "' OR r.start_time >= '" << actualEndTime << "') "
            << ")";
        
        auto result = db.query(sql.str());
        
        if (result.next()) {
            int availableTables = result.get<int>("available_tables");
            return availableTables > 0;
        }
    } catch (const std::exception& e) {
        std::cerr << "Error checking table availability for restaurant " << restaurantId 
                  << ": " << e.what() << std::endl;
    }
    
    return false;
}

std::map<int, std::vector<std::pair<std::string, std::string>>> RestaurantService::getTableReservationsForDate(
    int restaurantId, const std::string& date) {
    
    std::map<int, std::vector<std::pair<std::string, std::string>>> tableReservations;
    
    try {
        // Query for reserved tables during the specified date
        std::ostringstream sql;
        sql << "SELECT r.table_id, r.start_time, r.end_time "
            << "FROM reservations r "
            << "INNER JOIN restaurant_tables rt ON r.table_id = rt.table_id "
            << "WHERE rt.restaurant_id = " << restaurantId
            << " AND r.reservation_date = '" << date << "'"
            << " AND r.status IN ('confirmed', 'pending')";
        
        auto result = db.query(sql.str());
        
        // Group reservations by table ID
        while (result.next()) {
            int tableId = result.get<int>("table_id");
            std::string startTime = result.get<std::string>("start_time");
            std::string endTime = result.get<std::string>("end_time");
            
            // Add reservation time slot to the table's list
            tableReservations[tableId].push_back(std::make_pair(startTime, endTime));
        }
    } catch (const std::exception& e) {
        std::cerr << "Error fetching table reservations for restaurant " << restaurantId 
                  << " on date " << date << ": " << e.what() << std::endl;
    }
    
    return tableReservations;
} 