#include "dataAccess/restaurantData.h"
#include <nanodbc/nanodbc.h>
#include <iostream>

RestaurantData::RestaurantData() {}

std::vector<Restaurant> RestaurantData::getAllRestaurants() {
    std::vector<Restaurant> restaurants;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        // Modified query to include image_url and reservation_fee
        nanodbc::prepare(stmt, "SELECT id, name, address, phone_number, description, table_count, "
                             "cuisine_type, rating, is_featured, price_range, opening_time, closing_time, image_url, reservation_fee "
                             "FROM restaurants");
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Restaurant restaurant;
            restaurant.setId(result.get<int>("id"));
            restaurant.setName(result.get<nanodbc::string>("name", ""));
            restaurant.setAddress(result.get<nanodbc::string>("address", ""));
            restaurant.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            restaurant.setDescription(result.get<nanodbc::string>("description", ""));
            
            // Get the actual table count from the tables table instead of using the static value
            int restaurantId = result.get<int>("id");
            try {
                nanodbc::connection tableConn = dbConnection.getConnection();
                nanodbc::statement tableStmt(tableConn);
                nanodbc::prepare(tableStmt, "SELECT COUNT(*) FROM tables WHERE restaurant_id = ?");
                tableStmt.bind(0, &restaurantId);
                nanodbc::result tableResult = nanodbc::execute(tableStmt);
                
                if (tableResult.next()) {
                    restaurant.setTableCount(tableResult.get<int>(0));
                } else {
                    restaurant.setTableCount(0);
                }
            } catch (const nanodbc::database_error& e) {
                std::cerr << "Error counting tables for restaurant " << restaurantId << ": " << e.what() << std::endl;
                restaurant.setTableCount(result.get<int>("table_count")); // Fallback to stored value
            }
            
            restaurant.setCuisineType(result.get<nanodbc::string>("cuisine_type", "Not specified"));
            restaurant.setRating(result.get<float>("rating", 0.0));
            // Convert int to bool
            int isFeatured = result.get<int>("is_featured", 0);
            restaurant.setIsFeatured(isFeatured != 0);
            restaurant.setPriceRange(result.get<nanodbc::string>("price_range", ""));
            restaurant.setOpeningTime(result.get<nanodbc::string>("opening_time", ""));
            restaurant.setClosingTime(result.get<nanodbc::string>("closing_time", ""));
            restaurant.setImageUrl(result.get<nanodbc::string>("image_url", ""));
            restaurant.setReservationFee(result.get<double>("reservation_fee", 25.0));
            restaurants.push_back(restaurant);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAllRestaurants: " << e.what() << std::endl;
    }
    return restaurants;
}

std::optional<Restaurant> RestaurantData::getRestaurantById(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT r.id, r.name, r.address, r.phone_number, r.description, r.table_count, "
                             "r.cuisine_type, r.rating, r.is_featured, r.price_range, r.opening_time, r.closing_time, r.image_url, r.reservation_fee, "
                             "COALESCE(COUNT(t.id), 0) as actual_table_count "
                             "FROM restaurants r "
                             "LEFT JOIN tables t ON r.id = t.restaurant_id "
                             "WHERE r.id = ? GROUP BY r.id");
        stmt.bind(0, &id);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            Restaurant restaurant;
            restaurant.setId(result.get<int>("id"));
            restaurant.setName(result.get<nanodbc::string>("name", ""));
            restaurant.setAddress(result.get<nanodbc::string>("address", ""));
            restaurant.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            restaurant.setDescription(result.get<nanodbc::string>("description", ""));
            
            // Use the actual table count from the JOIN query
            restaurant.setTableCount(result.get<int>("actual_table_count"));
            
            restaurant.setCuisineType(result.get<nanodbc::string>("cuisine_type", ""));
            restaurant.setRating(result.get<float>("rating", 0.0));
            // Convert int to bool
            int isFeatured = result.get<int>("is_featured", 0);
            restaurant.setIsFeatured(isFeatured != 0);
            restaurant.setPriceRange(result.get<nanodbc::string>("price_range", ""));
            restaurant.setOpeningTime(result.get<nanodbc::string>("opening_time", ""));
            restaurant.setClosingTime(result.get<nanodbc::string>("closing_time", ""));
            restaurant.setImageUrl(result.get<nanodbc::string>("image_url", ""));
            restaurant.setReservationFee(result.get<double>("reservation_fee", 25.0));
            return restaurant;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getRestaurantById: " << e.what() << std::endl;
    }
    return std::nullopt;
}

bool RestaurantData::addRestaurant(const Restaurant& restaurant) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "INSERT INTO restaurants (name, address, phone_number, description, table_count, "
                           "cuisine_type, rating, is_featured, price_range, opening_time, closing_time, image_url) "
                           "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        std::string name = restaurant.getName();
        std::string address = restaurant.getAddress();
        std::string phoneNumber = restaurant.getPhoneNumber();
        std::string description = restaurant.getDescription();
        int tableCount = restaurant.getTableCount();
        std::string cuisineType = restaurant.getCuisineType();
        float rating = restaurant.getRating();
        bool boolIsFeatured = restaurant.getIsFeatured();
        // Convert bool to int for database binding
        int isFeatured = boolIsFeatured ? 1 : 0;
        std::string priceRange = restaurant.getPriceRange();
        std::string openingTime = restaurant.getOpeningTime();
        std::string closingTime = restaurant.getClosingTime();
        std::string imageUrl = restaurant.getImageUrl();
        
        stmt.bind(0, name.c_str());
        stmt.bind(1, address.c_str());
        stmt.bind(2, phoneNumber.c_str());
        stmt.bind(3, description.c_str());
        stmt.bind(4, &tableCount);
        stmt.bind(5, cuisineType.c_str());
        stmt.bind(6, &rating);
        stmt.bind(7, &isFeatured);
        stmt.bind(8, priceRange.c_str());
        stmt.bind(9, openingTime.c_str());
        stmt.bind(10, closingTime.c_str());
        stmt.bind(11, imageUrl.c_str());
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in addRestaurant: " << e.what() << std::endl;
        return false;
    }
}

bool RestaurantData::updateRestaurant(const Restaurant& restaurant) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE restaurants SET name = ?, address = ?, phone_number = ?, description = ?, "
                            "table_count = ?, cuisine_type = ?, rating = ?, is_featured = ?, "
                            "price_range = ?, opening_time = ?, closing_time = ?, image_url = ? WHERE id = ?");
        
        std::string name = restaurant.getName();
        std::string address = restaurant.getAddress();
        std::string phoneNumber = restaurant.getPhoneNumber();
        std::string description = restaurant.getDescription();
        int tableCount = restaurant.getTableCount();
        std::string cuisineType = restaurant.getCuisineType();
        float rating = restaurant.getRating();
        bool boolIsFeatured = restaurant.getIsFeatured();
        // Convert bool to int for database binding
        int isFeatured = boolIsFeatured ? 1 : 0;
        std::string priceRange = restaurant.getPriceRange();
        std::string openingTime = restaurant.getOpeningTime();
        std::string closingTime = restaurant.getClosingTime();
        std::string imageUrl = restaurant.getImageUrl();
        int id = restaurant.getId();
        
        stmt.bind(0, name.c_str());
        stmt.bind(1, address.c_str());
        stmt.bind(2, phoneNumber.c_str());
        stmt.bind(3, description.c_str());
        stmt.bind(4, &tableCount);
        stmt.bind(5, cuisineType.c_str());
        stmt.bind(6, &rating);
        stmt.bind(7, &isFeatured);
        stmt.bind(8, priceRange.c_str());
        stmt.bind(9, openingTime.c_str());
        stmt.bind(10, closingTime.c_str());
        stmt.bind(11, imageUrl.c_str());
        stmt.bind(12, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateRestaurant: " << e.what() << std::endl;
        return false;
    }
}

bool RestaurantData::deleteRestaurant(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "DELETE FROM restaurants WHERE id = ?");
        
        stmt.bind(0, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in deleteRestaurant: " << e.what() << std::endl;
        return false;
    }
}
