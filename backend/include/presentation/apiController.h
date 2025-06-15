#ifndef API_CONTROLLER_H
#define API_CONTROLLER_H

#include "crow.h"
#include "businessLogic/authService.h"
#include "businessLogic/restaurantService.h"
#include "businessLogic/reservationService.h"
#include "businessLogic/reviewService.h"
#include "dataAccess/userData.h"
#include "dataAccess/restaurantData.h"
#include "dataAccess/reservationData.h"
#include "utils/emailService.h"

class ApiController {
public:
    ApiController();
    void setupRoutes(crow::App<>& app);

private:
    AuthService authService;
    RestaurantService restaurantService;
    ReservationService reservationService;
    ReviewService reviewService;
    UserData userData;
    RestaurantData restaurantData;
    ReservationData reservationData;
    EmailService emailService;

    void setupAuthRoutes(crow::App<>& app);
    void setupRestaurantRoutes(crow::App<>& app);
    void setupReservationRoutes(crow::App<>& app);
    void setupReviewRoutes(crow::App<>& app);
    void setupAdminRoutes(crow::App<>& app);
    bool isAuthenticated(const crow::request& req);
    bool isAdmin(const crow::request& req);
    int getUserIdFromRequest(const crow::request& req);

    // Helper to add CORS headers to responses
    crow::response createResponse(int code, const std::string& body);
};

#endif // API_CONTROLLER_H
