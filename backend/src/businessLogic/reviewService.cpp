#include "businessLogic/reviewService.h"

ReviewService::ReviewService() {}

std::vector<Review> ReviewService::getAllReviews() {
    return reviewData.getAllReviews();
}

std::vector<Review> ReviewService::getReviewsByUserId(int userId) {
    return reviewData.getReviewsByUserId(userId);
}

std::vector<Review> ReviewService::getReviewsByRestaurantId(int restaurantId) {
    return reviewData.getReviewsByRestaurantId(restaurantId);
}

std::optional<Review> ReviewService::getReviewById(int id) {
    return reviewData.getReviewById(id);
}

std::optional<Review> ReviewService::getUserReviewForRestaurant(int userId, int restaurantId) {
    return reviewData.getUserReviewForRestaurant(userId, restaurantId);
}

bool ReviewService::addReview(const Review& review) {
    return reviewData.addReview(review);
}

bool ReviewService::updateReview(const Review& review) {
    return reviewData.updateReview(review);
}

bool ReviewService::deleteReview(int id) {
    return reviewData.deleteReview(id);
}

float ReviewService::getAverageRatingForRestaurant(int restaurantId) {
    return reviewData.getAverageRatingForRestaurant(restaurantId);
}

int ReviewService::getReviewCountForRestaurant(int restaurantId) {
    return reviewData.getReviewCountForRestaurant(restaurantId);
}
