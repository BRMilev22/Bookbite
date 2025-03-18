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

    // Get reservations by customer ID
    std::vector<Reservation> getReservationsByCustomerId(int customerId);

    // Create new reservation
    int createReservation(const Reservation& reservation);

    // Update reservation
    bool updateReservation(const Reservation& reservation);

    // Delete reservation
    bool deleteReservation(int id);

    // Check if table is available
    bool isTableAvailable(int tableId, const std::string& date, 
                         const std::string& startTime, const std::string& endTime,
                         int excludeReservationId = 0);

    // Get all dietary restrictions for a reservation
    std::vector<std::string> getReservationDietaryRestrictions(int reservationId);

    // Change reservation status
    bool changeReservationStatus(int reservationId, ReservationStatus status);

private:
    Database& db;

    static std::string statusToString(ReservationStatus status);
    static ReservationStatus stringToStatus(const std::string& status);
    
    // Helper method to format dietary restrictions as a comma-separated string
    std::string formatDietaryRestrictions(const std::vector<std::string>& restrictions);
    
    // Helper method to parse comma-separated dietary restrictions into a vector
    std::vector<std::string> parseDietaryRestrictions(const std::string& restrictionsStr);
}; 