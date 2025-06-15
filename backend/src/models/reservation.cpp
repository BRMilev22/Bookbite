#include "models/reservation.h"

Reservation::Reservation() : id(0), userId(0), tableId(0), restaurantId(0), guestCount(0), totalAmount(0.0) {}

Reservation::Reservation(int id, int userId, int tableId, int restaurantId, 
                       const std::string& date, const std::string& startTime, const std::string& endTime, 
                       int guestCount, const std::string& status)
    : id(id), userId(userId), tableId(tableId), restaurantId(restaurantId),
      date(date), startTime(startTime), endTime(endTime), guestCount(guestCount), status(status) {}

int Reservation::getId() const {
    return id;
}

int Reservation::getUserId() const {
    return userId;
}

int Reservation::getTableId() const {
    return tableId;
}

int Reservation::getRestaurantId() const {
    return restaurantId;
}

std::string Reservation::getDate() const {
    return date;
}

std::string Reservation::getStartTime() const {
    return startTime;
}

std::string Reservation::getEndTime() const {
    return endTime;
}

int Reservation::getGuestCount() const {
    return guestCount;
}

std::string Reservation::getStatus() const {
    return status;
}

std::string Reservation::getSpecialRequests() const {
    return specialRequests;
}

std::string Reservation::getPhoneNumber() const {
    return phoneNumber;
}

std::string Reservation::getEmail() const {
    return email;
}

double Reservation::getTotalAmount() const {
    return totalAmount;
}

std::string Reservation::getPaymentStatus() const {
    return paymentStatus;
}

std::string Reservation::getPaymentMethod() const {
    return paymentMethod;
}

std::string Reservation::getConfirmationToken() const {
    return confirmationToken;
}

void Reservation::setId(int id) {
    this->id = id;
}

void Reservation::setUserId(int userId) {
    this->userId = userId;
}

void Reservation::setTableId(int tableId) {
    this->tableId = tableId;
}

void Reservation::setRestaurantId(int restaurantId) {
    this->restaurantId = restaurantId;
}

void Reservation::setDate(const std::string& date) {
    this->date = date;
}

void Reservation::setStartTime(const std::string& startTime) {
    this->startTime = startTime;
}

void Reservation::setEndTime(const std::string& endTime) {
    this->endTime = endTime;
}

void Reservation::setGuestCount(int guestCount) {
    this->guestCount = guestCount;
}

void Reservation::setStatus(const std::string& status) {
    this->status = status;
}

void Reservation::setSpecialRequests(const std::string& specialRequests) {
    this->specialRequests = specialRequests;
}

void Reservation::setPhoneNumber(const std::string& phoneNumber) {
    this->phoneNumber = phoneNumber;
}

void Reservation::setEmail(const std::string& email) {
    this->email = email;
}

void Reservation::setTotalAmount(double totalAmount) {
    this->totalAmount = totalAmount;
}

void Reservation::setPaymentStatus(const std::string& paymentStatus) {
    this->paymentStatus = paymentStatus;
}

void Reservation::setPaymentMethod(const std::string& paymentMethod) {
    this->paymentMethod = paymentMethod;
}

void Reservation::setConfirmationToken(const std::string& confirmationToken) {
    this->confirmationToken = confirmationToken;
}
