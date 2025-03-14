#pragma once

#include "../models/reservation.h"
#include "../database/db_manager.h"
#include <vector>
#include <optional>

// Simple reservation service for handling reservation operations
class ReservationService {
public:
    ReservationService(Database& db);

    // Get all reservations
    std::vector<Reservation> getAllReservations();

    // Get reservation by ID
    std::optional<Reservation> getReservationById(int id);

    // Create new reservation
    int createReservation(const Reservation& reservation);

    // Update reservation
    bool updateReservation(const Reservation& reservation);

    // Delete reservation
    bool deleteReservation(int id);

    // Check if table is available
    bool isTableAvailable(int tableId, const std::string& date, 
                         const std::string& startTime, const std::string& endTime);

private:
    Database& db;

    static std::string statusToString(ReservationStatus status);
    static ReservationStatus stringToStatus(const std::string& status);
}; 