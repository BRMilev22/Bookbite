#include "businessLogic/reservationService.h"

ReservationService::ReservationService() {}

std::vector<Reservation> ReservationService::getAllReservations() {
    return reservationData.getAllReservations();
}

std::vector<Reservation> ReservationService::getReservationsByUserId(int userId) {
    return reservationData.getReservationsByUserId(userId);
}

std::vector<Reservation> ReservationService::getReservationsByRestaurantId(int restaurantId) {
    return reservationData.getReservationsByRestaurantId(restaurantId);
}

std::optional<Reservation> ReservationService::getReservationById(int id) {
    return reservationData.getReservationById(id);
}

bool ReservationService::createReservation(const Reservation& reservation) {
    // Check if the table exists
    auto table = tableData.getTableById(reservation.getTableId());
    if (!table) {
        return false; // Table not found
    }

    // Check if the table is available for the requested time slot
    if (!reservationData.isTableAvailable(reservation.getTableId(),
                                          reservation.getDate(),
                                          reservation.getStartTime(),
                                          reservation.getEndTime())) {
        return false; // Table not available for this time slot
    }

    // Create the reservation without changing global table availability
    return reservationData.addReservation(reservation);
}

bool ReservationService::updateReservation(const Reservation& reservation) {
    // Get the existing reservation
    auto existingReservation = reservationData.getReservationById(reservation.getId());
    if (!existingReservation) {
        return false; // Reservation not found
    }

    // Check if the table exists
    auto table = tableData.getTableById(reservation.getTableId());
    if (!table) {
        return false; // Table not found
    }

    // Check if the table is available for the new time slot (excluding current reservation)
    if (!reservationData.isTableAvailable(reservation.getTableId(),
                                          reservation.getDate(),
                                          reservation.getStartTime(),
                                          reservation.getEndTime(),
                                          reservation.getId())) {
        return false; // Table not available for this time slot
    }

    return reservationData.updateReservation(reservation);
}

bool ReservationService::cancelReservation(int id) {
    // Get the reservation
    auto reservation = reservationData.getReservationById(id);
    if (!reservation) {
        return false; // Reservation not found
    }

    // Update the reservation status
    return reservationData.updateReservationStatus(id, "cancelled");
}

bool ReservationService::completeReservation(int id) {
    // Get the reservation
    auto reservation = reservationData.getReservationById(id);
    if (!reservation) {
        return false; // Reservation not found
    }

    // Update the reservation status
    return reservationData.updateReservationStatus(id, "completed");
}

void ReservationService::updateTableAvailability(int tableId, bool isAvailable) {
    tableData.updateTableAvailability(tableId, isAvailable);
}
