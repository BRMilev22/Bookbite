#ifndef REVIEW_DATA_H
#define REVIEW_DATA_H

#include "models/review.h"
#include "utils/dbConnection.h"
#include <vector>
#include <optional>

class ReviewData {
public:
    ReviewData();
    std::vector<Review> getAllReviews();
    std::vector<Review> getReviewsByUserId(int userId);
    std::vector<Review> getReviewsByRestaurantId(int restaurantId);
    std::optional<Review> getReviewById(int id);
    std::optional<Review> getUserReviewForRestaurant(int userId, int restaurantId);
    bool addReview(const Review& review);
    bool updateReview(const Review& review);
    bool deleteReview(int id);
    float getAverageRatingForRestaurant(int restaurantId);
    int getReviewCountForRestaurant(int restaurantId);
    void updateRestaurantRating(int restaurantId);

private:
    DbConnection dbConnection;
};

#endif // REVIEW_DATA_H
