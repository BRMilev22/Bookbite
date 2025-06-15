#ifndef RESERVATION_DATA_H
#define RESERVATION_DATA_H

#include "models/reservation.h"
#include "utils/dbConnection.h"
#include <vector>
#include <optional>

class ReservationData {
public:
    ReservationData();
    std::vector<Reservation> getAllReservations();
    std::vector<Reservation> getReservationsByUserId(int userId);
    std::vector<Reservation> getReservationsByRestaurantId(int restaurantId);
    std::vector<Reservation> getReservationsByTableId(int tableId);
    std::optional<Reservation> getReservationById(int id);
    std::optional<Reservation> getReservationByIdWithDetails(int id);
    bool addReservation(const Reservation& reservation);
    bool updateReservation(const Reservation& reservation);
    bool deleteReservation(int id);
    bool updateReservationStatus(int id, const std::string& status);
    bool isTableAvailable(int tableId, const std::string& date, const std::string& startTime, const std::string& endTime, int excludeReservationId = 0);
    std::vector<int> getAvailableTableIds(int restaurantId, const std::string& date, const std::string& startTime, const std::string& endTime, int minCapacity = 0);
    
    // Confirmation token methods
    std::optional<Reservation> getReservationByConfirmationToken(const std::string& token);
    bool updateReservationConfirmationToken(int id, const std::string& token);
    bool confirmReservation(const std::string& token);

private:
    DbConnection dbConnection;
};

#endif // RESERVATION_DATA_H
