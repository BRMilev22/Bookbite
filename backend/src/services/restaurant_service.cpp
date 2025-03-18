#include "../../include/services/restaurant_service.h"
#include <sstream>
#include <stdexcept>

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
    sql << "SELECT * FROM restaurant_tables WHERE restaurant_id = " << restaurantId;
    
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