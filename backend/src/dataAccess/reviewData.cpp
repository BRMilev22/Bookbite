#include "dataAccess/reviewData.h"
#include <nanodbc/nanodbc.h>
#include <iostream>

ReviewData::ReviewData() {}

std::vector<Review> ReviewData::getAllReviews() {
    std::vector<Review> reviews;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, restaurant_id, rating, comment FROM reviews");
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Review review;
            review.setId(result.get<int>("id"));
            review.setUserId(result.get<int>("user_id"));
            review.setRestaurantId(result.get<int>("restaurant_id"));
            review.setRating(result.get<int>("rating"));
            review.setComment(result.get<nanodbc::string>("comment", ""));
            reviews.push_back(review);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAllReviews: " << e.what() << std::endl;
    }
    return reviews;
}

std::vector<Review> ReviewData::getReviewsByUserId(int userId) {
    std::vector<Review> reviews;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, restaurant_id, rating, comment FROM reviews WHERE user_id = ?");
        stmt.bind(0, &userId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Review review;
            review.setId(result.get<int>("id"));
            review.setUserId(result.get<int>("user_id"));
            review.setRestaurantId(result.get<int>("restaurant_id"));
            review.setRating(result.get<int>("rating"));
            review.setComment(result.get<nanodbc::string>("comment", ""));
            reviews.push_back(review);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReviewsByUserId: " << e.what() << std::endl;
    }
    return reviews;
}

std::vector<Review> ReviewData::getReviewsByRestaurantId(int restaurantId) {
    std::vector<Review> reviews;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, restaurant_id, rating, comment FROM reviews WHERE restaurant_id = ?");
        stmt.bind(0, &restaurantId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Review review;
            review.setId(result.get<int>("id"));
            review.setUserId(result.get<int>("user_id"));
            review.setRestaurantId(result.get<int>("restaurant_id"));
            review.setRating(result.get<int>("rating"));
            review.setComment(result.get<nanodbc::string>("comment", ""));
            reviews.push_back(review);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReviewsByRestaurantId: " << e.what() << std::endl;
    }
    return reviews;
}

std::optional<Review> ReviewData::getReviewById(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, restaurant_id, rating, comment FROM reviews WHERE id = ?");
        stmt.bind(0, &id);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            Review review;
            review.setId(result.get<int>("id"));
            review.setUserId(result.get<int>("user_id"));
            review.setRestaurantId(result.get<int>("restaurant_id"));
            review.setRating(result.get<int>("rating"));
            review.setComment(result.get<nanodbc::string>("comment", ""));
            return review;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReviewById: " << e.what() << std::endl;
    }
    return std::nullopt;
}

std::optional<Review> ReviewData::getUserReviewForRestaurant(int userId, int restaurantId) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, restaurant_id, rating, comment FROM reviews WHERE user_id = ? AND restaurant_id = ?");
        stmt.bind(0, &userId);
        stmt.bind(1, &restaurantId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            Review review;
            review.setId(result.get<int>("id"));
            review.setUserId(result.get<int>("user_id"));
            review.setRestaurantId(result.get<int>("restaurant_id"));
            review.setRating(result.get<int>("rating"));
            review.setComment(result.get<nanodbc::string>("comment", ""));
            return review;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getUserReviewForRestaurant: " << e.what() << std::endl;
    }
    return std::nullopt;
}

bool ReviewData::addReview(const Review& review) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)");
        
        int userId = review.getUserId();
        int restaurantId = review.getRestaurantId();
        int rating = review.getRating();
        std::string comment = review.getComment();
        
        stmt.bind(0, &userId);
        stmt.bind(1, &restaurantId);
        stmt.bind(2, &rating);
        stmt.bind(3, comment.c_str());
        
        nanodbc::execute(stmt);
        
        // Update restaurant rating
        updateRestaurantRating(restaurantId);
        
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in addReview: " << e.what() << std::endl;
        return false;
    }
}

bool ReviewData::updateReview(const Review& review) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?");
        
        int rating = review.getRating();
        std::string comment = review.getComment();
        int id = review.getId();
        
        stmt.bind(0, &rating);
        stmt.bind(1, comment.c_str());
        stmt.bind(2, &id);
        
        nanodbc::execute(stmt);
        
        // Update restaurant rating
        int restaurantId = review.getRestaurantId();
        updateRestaurantRating(restaurantId);
        
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateReview: " << e.what() << std::endl;
        return false;
    }
}

bool ReviewData::deleteReview(int id) {
    try {
        // First, get the restaurant ID to update its rating later
        int restaurantId = 0;
        
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement getStmt(conn);
        nanodbc::prepare(getStmt, "SELECT restaurant_id FROM reviews WHERE id = ?");
        getStmt.bind(0, &id);
        nanodbc::result getResult = nanodbc::execute(getStmt);
        
        if (getResult.next()) {
            restaurantId = getResult.get<int>("restaurant_id");
        }
        
        // Delete the review
        nanodbc::statement deleteStmt(conn);
        nanodbc::prepare(deleteStmt, "DELETE FROM reviews WHERE id = ?");
        deleteStmt.bind(0, &id);
        nanodbc::execute(deleteStmt);
        
        // Update restaurant rating if we found a restaurant ID
        if (restaurantId > 0) {
            updateRestaurantRating(restaurantId);
        }
        
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in deleteReview: " << e.what() << std::endl;
        return false;
    }
}

float ReviewData::getAverageRatingForRestaurant(int restaurantId) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT AVG(rating) as avg_rating FROM reviews WHERE restaurant_id = ?");
        stmt.bind(0, &restaurantId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            float avgRating = result.get<float>(0, 0.0);
            std::cout << "Calculated average rating for restaurant " << restaurantId << ": " << avgRating << std::endl;
            return avgRating;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAverageRatingForRestaurant: " << e.what() << std::endl;
    }
    std::cout << "No reviews found for restaurant " << restaurantId << ", returning 0.0" << std::endl;
    return 0.0;
}

int ReviewData::getReviewCountForRestaurant(int restaurantId) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?");
        stmt.bind(0, &restaurantId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            return result.get<int>(0, 0);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReviewCountForRestaurant: " << e.what() << std::endl;
    }
    return 0;
}

// Helper method to update restaurant rating based on reviews
void ReviewData::updateRestaurantRating(int restaurantId) {
    try {
        float avgRating = getAverageRatingForRestaurant(restaurantId);
        
        std::cout << "Updating restaurant " << restaurantId << " rating to: " << avgRating << std::endl;
        
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE restaurants SET rating = ? WHERE id = ?");
        
        stmt.bind(0, &avgRating);
        stmt.bind(1, &restaurantId);
        
        nanodbc::result result = nanodbc::execute(stmt);
        
        std::cout << "Restaurant " << restaurantId << " rating updated successfully" << std::endl;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateRestaurantRating: " << e.what() << std::endl;
    }
}
