#include "models/review.h"

Review::Review() : id(0), userId(0), restaurantId(0), rating(0) {}

Review::Review(int id, int userId, int restaurantId, int rating, const std::string& comment)
    : id(id), userId(userId), restaurantId(restaurantId), rating(rating), comment(comment) {}

int Review::getId() const {
    return id;
}

int Review::getUserId() const {
    return userId;
}

int Review::getRestaurantId() const {
    return restaurantId;
}

int Review::getRating() const {
    return rating;
}

std::string Review::getComment() const {
    return comment;
}

void Review::setId(int id) {
    this->id = id;
}

void Review::setUserId(int userId) {
    this->userId = userId;
}

void Review::setRestaurantId(int restaurantId) {
    this->restaurantId = restaurantId;
}

void Review::setRating(int rating) {
    this->rating = rating;
}

void Review::setComment(const std::string& comment) {
    this->comment = comment;
}
