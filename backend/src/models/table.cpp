#include "models/table.h"

Table::Table() : id(0), restaurantId(0), seatCount(0), isAvailable(true) {}

Table::Table(int id, int restaurantId, int seatCount, bool isAvailable)
    : id(id), restaurantId(restaurantId), seatCount(seatCount), isAvailable(isAvailable) {}

int Table::getId() const {
    return id;
}

int Table::getRestaurantId() const {
    return restaurantId;
}

int Table::getSeatCount() const {
    return seatCount;
}

bool Table::getIsAvailable() const {
    return isAvailable;
}

std::vector<ReservationInfo> Table::getReservations() const {
    return reservations;
}

void Table::setId(int id) {
    this->id = id;
}

void Table::setRestaurantId(int restaurantId) {
    this->restaurantId = restaurantId;
}

void Table::setSeatCount(int seatCount) {
    this->seatCount = seatCount;
}

void Table::setIsAvailable(bool isAvailable) {
    this->isAvailable = isAvailable;
}

void Table::setReservations(const std::vector<ReservationInfo>& reservations) {
    this->reservations = reservations;
}

void Table::addReservation(const ReservationInfo& reservation) {
    this->reservations.push_back(reservation);
}
