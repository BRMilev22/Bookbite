#ifndef RESERVATION_SERVICE_H
#define RESERVATION_SERVICE_H

#include "dataAccess/reservationData.h"
#include "dataAccess/tableData.h"
#include "dataAccess/userData.h"
#include "dataAccess/restaurantData.h"
#include "utils/emailService.h"
#include <vector>
#include <optional>
#include <string>

class ReservationService {
public:
    ReservationService();
    std::vector<Reservation> getAllReservations();
    std::vector<Reservation> getReservationsByUserId(int userId);
    std::vector<Reservation> getReservationsByRestaurantId(int restaurantId);
    std::optional<Reservation> getReservationById(int id);

    bool createReservation(const Reservation& reservation);
    bool updateReservation(const Reservation& reservation);
    bool cancelReservation(int id);
    bool completeReservation(int id);
    bool confirmReservation(const std::string& token);
    bool resendConfirmationEmail(int reservationId);

private:
    ReservationData reservationData;
    TableData tableData;
    UserData userData;
    RestaurantData restaurantData;
    EmailService emailService;

    // Helper method to update table availability
    void updateTableAvailability(int tableId, bool isAvailable);
};

#endif // RESERVATION_SERVICE_H
