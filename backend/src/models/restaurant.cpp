#include "models/restaurant.h"

Restaurant::Restaurant() : id(0), tableCount(0), rating(0.0), isFeatured(false), reservationFee(25.0), isActive(true) {}

Restaurant::Restaurant(int id, const std::string& name, const std::string& address, 
                     const std::string& phoneNumber, const std::string& description, int tableCount,
                     const std::string& cuisineType, float rating, bool isFeatured,
                     const std::string& priceRange, const std::string& openingTime, const std::string& closingTime,
                     const std::string& imageUrl)
    : id(id), name(name), address(address), phoneNumber(phoneNumber), 
      description(description), tableCount(tableCount), cuisineType(cuisineType),
      rating(rating), isFeatured(isFeatured), priceRange(priceRange),
      openingTime(openingTime), closingTime(closingTime), imageUrl(imageUrl), isActive(true) {}

int Restaurant::getId() const {
    return id;
}

std::string Restaurant::getName() const {
    return name;
}

std::string Restaurant::getAddress() const {
    return address;
}

std::string Restaurant::getPhoneNumber() const {
    return phoneNumber;
}

std::string Restaurant::getDescription() const {
    return description;
}

int Restaurant::getTableCount() const {
    return tableCount;
}

void Restaurant::setId(int id) {
    this->id = id;
}

void Restaurant::setName(const std::string& name) {
    this->name = name;
}

void Restaurant::setAddress(const std::string& address) {
    this->address = address;
}

void Restaurant::setPhoneNumber(const std::string& phoneNumber) {
    this->phoneNumber = phoneNumber;
}

void Restaurant::setDescription(const std::string& description) {
    this->description = description;
}

void Restaurant::setTableCount(int tableCount) {
    this->tableCount = tableCount;
}

std::string Restaurant::getCuisineType() const {
    return cuisineType;
}

float Restaurant::getRating() const {
    return rating;
}

bool Restaurant::getIsFeatured() const {
    return isFeatured;
}

std::string Restaurant::getPriceRange() const {
    return priceRange;
}

std::string Restaurant::getOpeningTime() const {
    return openingTime;
}

std::string Restaurant::getClosingTime() const {
    return closingTime;
}

std::string Restaurant::getImageUrl() const {
    return imageUrl;
}

bool Restaurant::getIsActive() const {
    return isActive;
}

void Restaurant::setCuisineType(const std::string& cuisineType) {
    this->cuisineType = cuisineType;
}

void Restaurant::setRating(float rating) {
    this->rating = rating;
}

void Restaurant::setIsFeatured(bool isFeatured) {
    this->isFeatured = isFeatured;
}

void Restaurant::setPriceRange(const std::string& priceRange) {
    this->priceRange = priceRange;
}

void Restaurant::setOpeningTime(const std::string& openingTime) {
    this->openingTime = openingTime;
}

void Restaurant::setClosingTime(const std::string& closingTime) {
    this->closingTime = closingTime;
}

void Restaurant::setImageUrl(const std::string& imageUrl) {
    this->imageUrl = imageUrl;
}

double Restaurant::getReservationFee() const {
    return reservationFee;
}

void Restaurant::setReservationFee(double reservationFee) {
    this->reservationFee = reservationFee;
}

void Restaurant::setIsActive(bool isActive) {
    this->isActive = isActive;
}
