#ifndef REVIEW_SERVICE_H
#define REVIEW_SERVICE_H

#include "dataAccess/reviewData.h"
#include <vector>
#include <optional>

class ReviewService {
public:
    ReviewService();
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

private:
    ReviewData reviewData;
};

#endif // REVIEW_SERVICE_H
