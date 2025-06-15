#include "presentation/apiController.h"
#include "dataAccess/restaurantData.h"
#include <string>
#include <iostream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

ApiController::ApiController() {}

void ApiController::setupRoutes(crow::App<>& app) {
    // Handle CORS by adding headers to each response manually
    
    // Handle OPTIONS requests for CORS
    app.route_dynamic("/api/(.*)")
    .methods("OPTIONS"_method)
    ([](const crow::request& req) {
        crow::response res(200);
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return res;
    });
    
    // Set up API routes
    setupAuthRoutes(app);
    setupRestaurantRoutes(app);
    setupReservationRoutes(app);
    setupReviewRoutes(app);
    setupAdminRoutes(app);
    
    // Health check route
    app.route_dynamic("/api/health")
    .methods("GET"_method)
    ([this](const crow::request& req) {
        json response;
        response["status"] = "ok";
        response["message"] = "API is running";
        return createResponse(200, response.dump());
    });
}

bool ApiController::isAuthenticated(const crow::request& req) {
    // Get Authorization header
    auto authHeader = req.get_header_value("Authorization");
    if (authHeader.empty()) {
        return false;
    }
    
    // Check format: "Bearer <token>"
    if (authHeader.substr(0, 7) != "Bearer ") {
        return false;
    }
    
    // Extract token
    std::string token = authHeader.substr(7);
    
    // Validate token
    return authService.validateToken(token);
}

int ApiController::getUserIdFromRequest(const crow::request& req) {
    // Get Authorization header
    auto authHeader = req.get_header_value("Authorization");
    if (authHeader.empty()) {
        return -1;
    }
    
    // Check format: "Bearer <token>"
    if (authHeader.substr(0, 7) != "Bearer ") {
        return -1;
    }
    
    // Extract token
    std::string token = authHeader.substr(7);
    
    // Get user ID from token
    return authService.getUserIdFromToken(token);
}

crow::response ApiController::createResponse(int code, const std::string& body) {
    crow::response res(code, body);
    res.add_header("Access-Control-Allow-Origin", "*");
    res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res;
}

void ApiController::setupAuthRoutes(crow::App<>& app) {
    // Register route
    app.route_dynamic("/api/auth/register")
    .methods("POST"_method)
    ([this](const crow::request& req) {
        try {
            auto data = json::parse(req.body);
            std::string username = data["username"];
            std::string email = data["email"];
            std::string password = data["password"];
            
            bool success = authService.registerUser(username, email, password);
            if (success) {
                json response;
                response["success"] = true;
                response["message"] = "User registered successfully";
                return createResponse(201, response.dump());
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Username or email already exists";
                return createResponse(400, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid request data";
            return createResponse(400, response.dump());
        }
    });
    
    // Login route
    app.route_dynamic("/api/auth/login")
    .methods("POST"_method)
    ([this](const crow::request& req) {
        try {
            auto data = json::parse(req.body);
            std::string username = data["username"];
            std::string password = data["password"];
            
            std::string token = authService.loginUser(username, password);
            if (!token.empty()) {
                // Get user information with role data
                int userId = authService.getUserIdFromToken(token);
                auto user = userData.getUserById(userId);
                
                if (user) {
                    json response;
                    response["success"] = true;
                    response["token"] = token;
                    response["user"]["id"] = user->getId();
                    response["user"]["username"] = user->getUsername();
                    response["user"]["email"] = user->getEmail();
                    response["user"]["firstName"] = user->getFirstName();
                    response["user"]["lastName"] = user->getLastName();
                    response["user"]["phoneNumber"] = user->getPhoneNumber();
                    response["user"]["roleId"] = user->getRoleId();
                    response["user"]["roleName"] = user->getRoleName();
                    response["user"]["permissions"] = user->getPermissions();
                    response["user"]["isActive"] = user->isActive();
                    response["message"] = "Login successful";
                    return createResponse(200, response.dump());
                } else {
                    json response;
                    response["success"] = false;
                    response["message"] = "User data not found";
                    return createResponse(401, response.dump());
                }
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Invalid credentials";
                return createResponse(401, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid request data";
            return createResponse(400, response.dump());
        }
    });
    
    // Logout route
    app.route_dynamic("/api/auth/logout")
    .methods("POST"_method)
    ([this](const crow::request& req) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return createResponse(401, response.dump());
        }
        
        auto authHeader = req.get_header_value("Authorization");
        std::string token = authHeader.substr(7); // Remove "Bearer "
        
        authService.logoutUser(token);
        
        json response;
        response["success"] = true;
        response["message"] = "Logout successful";
        return createResponse(200, response.dump());
    });
}

void ApiController::setupRestaurantRoutes(crow::App<>& app) {
    // Get all restaurants
    app.route_dynamic("/api/restaurants")
    .methods("GET"_method)
    ([this](const crow::request& req) {
        auto restaurants = restaurantService.getAllRestaurants();
        
        json response = json::array();
        for (const auto& restaurant : restaurants) {
            json restaurantJson;
            restaurantJson["id"] = restaurant.getId();
            restaurantJson["name"] = restaurant.getName();
            restaurantJson["address"] = restaurant.getAddress();
            restaurantJson["phoneNumber"] = restaurant.getPhoneNumber();
            restaurantJson["description"] = restaurant.getDescription();
            restaurantJson["tableCount"] = restaurant.getTableCount();
            restaurantJson["cuisineType"] = restaurant.getCuisineType();
            restaurantJson["rating"] = restaurant.getRating();
            restaurantJson["isFeatured"] = restaurant.getIsFeatured();
            restaurantJson["priceRange"] = restaurant.getPriceRange();
            restaurantJson["openingTime"] = restaurant.getOpeningTime();
            restaurantJson["closingTime"] = restaurant.getClosingTime();
            restaurantJson["imageUrl"] = restaurant.getImageUrl();
            restaurantJson["reservation_fee"] = restaurant.getReservationFee();
            response.push_back(restaurantJson);
        }
        
        return createResponse(200, response.dump());
    });
    
    // Get restaurant by ID
    app.route_dynamic("/api/restaurants/<int>")
    .methods("GET"_method)
    ([this](const crow::request& req, int id) {
        auto restaurant = restaurantService.getRestaurantById(id);
        if (restaurant) {
            json response;
            response["id"] = restaurant->getId();
            response["name"] = restaurant->getName();
            response["address"] = restaurant->getAddress();
            response["phoneNumber"] = restaurant->getPhoneNumber();
            response["description"] = restaurant->getDescription();
            response["tableCount"] = restaurant->getTableCount();
            response["cuisineType"] = restaurant->getCuisineType();
            response["rating"] = restaurant->getRating();
            response["isFeatured"] = restaurant->getIsFeatured();
            response["priceRange"] = restaurant->getPriceRange();
            response["imageUrl"] = restaurant->getImageUrl();
            response["openingTime"] = restaurant->getOpeningTime();
            response["closingTime"] = restaurant->getClosingTime();
            response["reservation_fee"] = restaurant->getReservationFee();
            return createResponse(200, response.dump());
        } else {
            json response;
            response["message"] = "Restaurant not found";
            return createResponse(404, response.dump());
        }
    });
    
    // Create restaurant (admin only, but we'll skip the admin check for simplicity)
    app.route_dynamic("/api/restaurants")
    .methods("POST"_method)
    ([this](const crow::request& req) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return createResponse(401, response.dump());
        }
        
        try {
            auto data = json::parse(req.body);
            Restaurant restaurant;
            restaurant.setName(data["name"]);
            restaurant.setAddress(data["address"]);
            restaurant.setPhoneNumber(data["phoneNumber"]);
            restaurant.setDescription(data["description"]);
            restaurant.setTableCount(data["tableCount"]);
            
            bool success = restaurantService.addRestaurant(restaurant);
            if (success) {
                json response;
                response["success"] = true;
                response["message"] = "Restaurant created successfully";
                return createResponse(201, response.dump());
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Failed to create restaurant";
                return createResponse(500, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid request data";
            return createResponse(400, response.dump());
        }
    });
    
    // Update restaurant (admin only, but we'll skip the admin check for simplicity)
    app.route_dynamic("/api/restaurants/<int>")
    .methods("PUT"_method)
    ([this](const crow::request& req, int id) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return crow::response(401, response.dump());
        }
        
        try {
            auto data = json::parse(req.body);
            Restaurant restaurant;
            restaurant.setId(id);
            restaurant.setName(data["name"]);
            restaurant.setAddress(data["address"]);
            restaurant.setPhoneNumber(data["phoneNumber"]);
            restaurant.setDescription(data["description"]);
            restaurant.setTableCount(data["tableCount"]);
            
            bool success = restaurantService.updateRestaurant(restaurant);
            if (success) {
                json response;
                response["success"] = true;
                response["message"] = "Restaurant updated successfully";
                return crow::response(200, response.dump());
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Restaurant not found";
                return crow::response(404, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid request data";
            return crow::response(400, response.dump());
        }
    });
    
    // Delete restaurant (admin only, but we'll skip the admin check for simplicity)
    app.route_dynamic("/api/restaurants/<int>")
    .methods("DELETE"_method)
    ([this](const crow::request& req, int id) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return crow::response(401, response.dump());
        }
        
        bool success = restaurantService.deleteRestaurant(id);
        if (success) {
            json response;
            response["success"] = true;
            response["message"] = "Restaurant deleted successfully";
            return crow::response(200, response.dump());
        } else {
            json response;
            response["success"] = false;
            response["message"] = "Restaurant not found";
            return crow::response(404, response.dump());
        }
    });
    
    // Get tables by restaurant ID
    app.route_dynamic("/api/restaurants/<int>/tables")
    .methods("GET"_method)
    ([this](const crow::request& req, int restaurantId) {
        auto tables = restaurantService.getTablesByRestaurantId(restaurantId);
        
        json response = json::array();
        for (const auto& table : tables) {
            json tableJson;
            tableJson["id"] = table.getId();
            tableJson["restaurantId"] = table.getRestaurantId();
            tableJson["seatCount"] = table.getSeatCount();
            tableJson["isAvailable"] = table.getIsAvailable();
            response.push_back(tableJson);
        }
        
        return crow::response(200, response.dump());
    });
    
    // Get available tables by restaurant ID
    app.route_dynamic("/api/restaurants/<int>/availabletables")
    .methods("GET"_method)
    ([this](const crow::request& req, int restaurantId) {
        auto tables = restaurantService.getAvailableTablesByRestaurantId(restaurantId);
        
        json response = json::array();
        for (const auto& table : tables) {
            json tableJson;
            tableJson["id"] = table.getId();
            tableJson["restaurantId"] = table.getRestaurantId();
            tableJson["seatCount"] = table.getSeatCount();
            tableJson["isAvailable"] = table.getIsAvailable();
            response.push_back(tableJson);
        }
        
        return crow::response(200, response.dump());
    });
    
    // Add table to restaurant (admin only, but we'll skip the admin check for simplicity)
    app.route_dynamic("/api/restaurants/<int>/tables")
    .methods("POST"_method)
    ([this](const crow::request& req, int restaurantId) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return crow::response(401, response.dump());
        }
        
        try {
            auto data = json::parse(req.body);
            Table table;
            table.setRestaurantId(restaurantId);
            table.setSeatCount(data["seatCount"]);
            table.setIsAvailable(true);
            
            bool success = restaurantService.addTable(table);
            if (success) {
                json response;
                response["success"] = true;
                response["message"] = "Table added successfully";
                return crow::response(201, response.dump());
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Failed to add table";
                return crow::response(500, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid request data";
            return crow::response(400, response.dump());
        }
    });
    
    // Get tables with reservations by restaurant ID
    app.route_dynamic("/api/restaurants/<int>/tableswithreservations")
    .methods("GET"_method)
    ([this](const crow::request& req, int restaurantId) {
        auto tables = restaurantService.getTablesWithReservationsByRestaurantId(restaurantId);
        
        json response = json::array();
        for (const auto& table : tables) {
            json tableJson;
            tableJson["id"] = table.getId();
            tableJson["restaurantId"] = table.getRestaurantId();
            tableJson["seatCount"] = table.getSeatCount();
            tableJson["isAvailable"] = table.getIsAvailable();
            
            // Add reservation information
            json reservationsJson = json::array();
            for (const auto& reservation : table.getReservations()) {
                json reservationJson;
                reservationJson["id"] = reservation.id;
                reservationJson["date"] = reservation.date;
                reservationJson["startTime"] = reservation.startTime;
                reservationJson["endTime"] = reservation.endTime;
                reservationJson["status"] = reservation.status;
                reservationJson["guestCount"] = reservation.guestCount;
                reservationsJson.push_back(reservationJson);
            }
            tableJson["reservations"] = reservationsJson;
            
            response.push_back(tableJson);
        }
        
        return crow::response(200, response.dump());
    });
}

void ApiController::setupReservationRoutes(crow::App<>& app) {
    // Get all reservations (admin only, but we'll skip the admin check for simplicity)
    app.route_dynamic("/api/reservations")
    .methods("GET"_method)
    ([this](const crow::request& req) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return crow::response(401, response.dump());
        }
        
        auto reservations = reservationService.getAllReservations();
        
        json response = json::array();
        for (const auto& reservation : reservations) {
            json reservationJson;
            reservationJson["id"] = reservation.getId();
            reservationJson["userId"] = reservation.getUserId();
            reservationJson["tableId"] = reservation.getTableId();
            reservationJson["restaurantId"] = reservation.getRestaurantId();
            reservationJson["date"] = reservation.getDate();
            reservationJson["startTime"] = reservation.getStartTime();
            reservationJson["endTime"] = reservation.getEndTime();
            reservationJson["guestCount"] = reservation.getGuestCount();
            reservationJson["status"] = reservation.getStatus();
            reservationJson["specialRequests"] = reservation.getSpecialRequests();
            reservationJson["phoneNumber"] = reservation.getPhoneNumber();
            reservationJson["email"] = reservation.getEmail();
            reservationJson["totalAmount"] = reservation.getTotalAmount();
            reservationJson["paymentStatus"] = reservation.getPaymentStatus();
            reservationJson["paymentMethod"] = reservation.getPaymentMethod();
            response.push_back(reservationJson);
        }
        
        return crow::response(200, response.dump());
    });
    
    // Get user reservations
    app.route_dynamic("/api/user/reservations")
    .methods("GET"_method)
    ([this](const crow::request& req) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return crow::response(401, response.dump());
        }
        
        int userId = getUserIdFromRequest(req);
        if (userId < 0) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid authentication token";
            return crow::response(401, response.dump());
        }
        
        auto reservations = reservationService.getReservationsByUserId(userId);
        
        json response = json::array();
        for (const auto& reservation : reservations) {
            json reservationJson;
            reservationJson["id"] = reservation.getId();
            reservationJson["userId"] = reservation.getUserId();
            reservationJson["tableId"] = reservation.getTableId();
            reservationJson["restaurantId"] = reservation.getRestaurantId();
            reservationJson["date"] = reservation.getDate();
            reservationJson["startTime"] = reservation.getStartTime();
            reservationJson["endTime"] = reservation.getEndTime();
            reservationJson["guestCount"] = reservation.getGuestCount();
            reservationJson["status"] = reservation.getStatus();
            reservationJson["specialRequests"] = reservation.getSpecialRequests();
            reservationJson["phoneNumber"] = reservation.getPhoneNumber();
            reservationJson["email"] = reservation.getEmail();
            reservationJson["totalAmount"] = reservation.getTotalAmount();
            reservationJson["paymentStatus"] = reservation.getPaymentStatus();
            reservationJson["paymentMethod"] = reservation.getPaymentMethod();
            response.push_back(reservationJson);
        }
        
        return crow::response(200, response.dump());
    });
    
    // Get restaurant reservations (admin only, but we'll skip the admin check for simplicity)
    app.route_dynamic("/api/restaurants/<int>/reservations")
    .methods("GET"_method)
    ([this](const crow::request& req, int restaurantId) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return crow::response(401, response.dump());
        }
        
        auto reservations = reservationService.getReservationsByRestaurantId(restaurantId);
        
        json response = json::array();
        for (const auto& reservation : reservations) {
            json reservationJson;
            reservationJson["id"] = reservation.getId();
            reservationJson["userId"] = reservation.getUserId();
            reservationJson["tableId"] = reservation.getTableId();
            reservationJson["restaurantId"] = reservation.getRestaurantId();
            reservationJson["date"] = reservation.getDate();
            reservationJson["startTime"] = reservation.getStartTime();
            reservationJson["endTime"] = reservation.getEndTime();
            reservationJson["guestCount"] = reservation.getGuestCount();
            reservationJson["status"] = reservation.getStatus();
            reservationJson["specialRequests"] = reservation.getSpecialRequests();
            reservationJson["phoneNumber"] = reservation.getPhoneNumber();
            reservationJson["email"] = reservation.getEmail();
            reservationJson["totalAmount"] = reservation.getTotalAmount();
            reservationJson["paymentStatus"] = reservation.getPaymentStatus();
            reservationJson["paymentMethod"] = reservation.getPaymentMethod();
            response.push_back(reservationJson);
        }
        
        return crow::response(200, response.dump());
    });
    
    // Create reservation
    app.route_dynamic("/api/reservations")
    .methods("POST"_method)
    ([this](const crow::request& req) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return crow::response(401, response.dump());
        }
        
        int userId = getUserIdFromRequest(req);
        if (userId < 0) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid authentication token";
            return crow::response(401, response.dump());
        }
        
        try {
            auto data = json::parse(req.body);
            Reservation reservation;
            reservation.setUserId(userId);
            reservation.setTableId(data["tableId"]);
            reservation.setRestaurantId(data["restaurantId"]);
            reservation.setDate(data["date"]);
            reservation.setStartTime(data["startTime"]);
            reservation.setEndTime(data["endTime"]);
            reservation.setGuestCount(data["guestCount"]);
            // Status will be set to "pending" by the reservation service
            
            // Set payment fields
            if (data.contains("totalAmount") && !data["totalAmount"].is_null()) {
                reservation.setTotalAmount(data["totalAmount"]);
            } else {
                reservation.setTotalAmount(25.0); // Default fee
            }
            
            if (data.contains("paymentStatus") && !data["paymentStatus"].is_null()) {
                reservation.setPaymentStatus(data["paymentStatus"]);
            } else {
                reservation.setPaymentStatus("pending");
            }
            
            if (data.contains("paymentMethod") && !data["paymentMethod"].is_null()) {
                reservation.setPaymentMethod(data["paymentMethod"]);
            } else {
                reservation.setPaymentMethod("cash");
            }
            
            // Set optional fields if provided
            if (data.contains("specialRequests") && !data["specialRequests"].is_null()) {
                reservation.setSpecialRequests(data["specialRequests"]);
            }
            if (data.contains("phoneNumber") && !data["phoneNumber"].is_null()) {
                reservation.setPhoneNumber(data["phoneNumber"]);
            }
            if (data.contains("email") && !data["email"].is_null()) {
                reservation.setEmail(data["email"]);
            }
            
            bool success = reservationService.createReservation(reservation);
            if (success) {
                // If payment data is provided and it's a card payment, create payment record
                if (data.contains("paymentData") && data["paymentMethod"] == "card") {
                    // TODO: Create payment record and process payment
                    // This would integrate with a payment processor in a real application
                }
                
                json response;
                response["success"] = true;
                response["message"] = "Reservation created successfully. Please check your email for confirmation instructions.";
                response["status"] = "pending";
                return crow::response(201, response.dump());
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Table not available or invalid data";
                return crow::response(400, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid request data";
            return crow::response(400, response.dump());
        }
    });
    
    // Cancel reservation
    app.route_dynamic("/api/reservations/<int>/cancel")
    .methods("POST"_method)
    ([this](const crow::request& req, int id) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return crow::response(401, response.dump());
        }
        
        int userId = getUserIdFromRequest(req);
        if (userId < 0) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid authentication token";
            return crow::response(401, response.dump());
        }
        
        // Get the reservation to check if it belongs to the user
        auto reservation = reservationService.getReservationById(id);
        if (!reservation || reservation->getUserId() != userId) {
            json response;
            response["success"] = false;
            response["message"] = "Reservation not found or not owned by user";
            return crow::response(404, response.dump());
        }
        
        bool success = reservationService.cancelReservation(id);
        if (success) {
            json response;
            response["success"] = true;
            response["message"] = "Reservation cancelled successfully";
            return crow::response(200, response.dump());
        } else {
            json response;
            response["success"] = false;
            response["message"] = "Failed to cancel reservation";
            return crow::response(500, response.dump());
        }
    });
    
    // Complete reservation (admin only, but we'll skip the admin check for simplicity)
    app.route_dynamic("/api/reservations/<int>/complete")
    .methods("POST"_method)
    ([this](const crow::request& req, int id) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return crow::response(401, response.dump());
        }
        
        bool success = reservationService.completeReservation(id);
        if (success) {
            json response;
            response["success"] = true;
            response["message"] = "Reservation completed successfully";
            return crow::response(200, response.dump());
        } else {
            json response;
            response["success"] = false;
            response["message"] = "Reservation not found";
            return crow::response(404, response.dump());
        }
    });

    // Confirm reservation via email token
    app.route_dynamic("/api/reservations/confirm/<string>")
    .methods("GET"_method)
    ([this](const crow::request& req, std::string token) {
        try {
            bool success = reservationService.confirmReservation(token);
            if (success) {
                json response;
                response["success"] = true;
                response["message"] = "Reservation confirmed successfully";
                return createResponse(200, response.dump());
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Invalid or expired confirmation token";
                return createResponse(400, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Failed to confirm reservation";
            return createResponse(500, response.dump());
        }
    });

    // Resend confirmation email for a reservation
    app.route_dynamic("/api/reservations/<int>/resend-confirmation")
    .methods("POST"_method)
    ([this](const crow::request& req, int reservationId) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return createResponse(401, response.dump());
        }

        int userId = getUserIdFromRequest(req);
        if (userId < 0) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid authentication token";
            return createResponse(401, response.dump());
        }

        // Verify that the reservation belongs to the authenticated user
        auto reservation = reservationService.getReservationById(reservationId);
        if (!reservation) {
            json response;
            response["success"] = false;
            response["message"] = "Reservation not found";
            return createResponse(404, response.dump());
        }

        if (reservation->getUserId() != userId) {
            json response;
            response["success"] = false;
            response["message"] = "Access denied - reservation does not belong to user";
            return createResponse(403, response.dump());
        }

        try {
            bool success = reservationService.resendConfirmationEmail(reservationId);
            if (success) {
                json response;
                response["success"] = true;
                response["message"] = "Confirmation email resent successfully";
                return createResponse(200, response.dump());
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Failed to resend confirmation email. Make sure the reservation is still pending.";
                return createResponse(400, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Failed to resend confirmation email";
            return createResponse(500, response.dump());
        }
    });
}

void ApiController::setupReviewRoutes(crow::App<>& app) {
    // Get reviews for a restaurant
    app.route_dynamic("/api/restaurants/<int>/reviews")
    .methods("GET"_method)
    ([this](const crow::request& req, int restaurantId) {
        auto reviews = reviewService.getReviewsByRestaurantId(restaurantId);
        
        json response = json::array();
        for (const auto& review : reviews) {
            json reviewJson;
            reviewJson["id"] = review.getId();
            reviewJson["userId"] = review.getUserId();
            reviewJson["restaurantId"] = review.getRestaurantId();
            reviewJson["rating"] = review.getRating();
            reviewJson["comment"] = review.getComment();
            response.push_back(reviewJson);
        }
        
        return createResponse(200, response.dump());
    });
    
    // Add a new review for a restaurant
    app.route_dynamic("/api/restaurants/<int>/reviews")
    .methods("POST"_method)
    ([this](const crow::request& req, int restaurantId) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return createResponse(401, response.dump());
        }
        
        int userId = getUserIdFromRequest(req);
        if (userId <= 0) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid user";
            return createResponse(401, response.dump());
        }
        
        try {
            auto data = json::parse(req.body);
            
            // Check if user already submitted a review for this restaurant
            auto existingReview = reviewService.getUserReviewForRestaurant(userId, restaurantId);
            if (existingReview) {
                json response;
                response["success"] = false;
                response["message"] = "You have already submitted a review for this restaurant";
                return createResponse(400, response.dump());
            }
            
            Review review;
            review.setUserId(userId);
            review.setRestaurantId(restaurantId);
            review.setRating(data["rating"]);
            review.setComment(data["comment"]);
            
            bool success = reviewService.addReview(review);
            if (success) {
                json response;
                response["success"] = true;
                response["message"] = "Review submitted successfully";
                return createResponse(201, response.dump());
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Failed to submit review";
                return createResponse(500, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid request data";
            return createResponse(400, response.dump());
        }
    });
    
    // Update an existing review
    app.route_dynamic("/api/reviews/<int>")
    .methods("PUT"_method)
    ([this](const crow::request& req, int reviewId) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return createResponse(401, response.dump());
        }
        
        int userId = getUserIdFromRequest(req);
        if (userId <= 0) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid user";
            return createResponse(401, response.dump());
        }
        
        try {
            auto existingReview = reviewService.getReviewById(reviewId);
            if (!existingReview) {
                json response;
                response["success"] = false;
                response["message"] = "Review not found";
                return createResponse(404, response.dump());
            }
            
            // Check if the review belongs to the current user
            if (existingReview->getUserId() != userId) {
                json response;
                response["success"] = false;
                response["message"] = "You can only update your own reviews";
                return createResponse(403, response.dump());
            }
            
            auto data = json::parse(req.body);
            existingReview->setRating(data["rating"]);
            existingReview->setComment(data["comment"]);
            
            bool success = reviewService.updateReview(*existingReview);
            if (success) {
                json response;
                response["success"] = true;
                response["message"] = "Review updated successfully";
                return createResponse(200, response.dump());
            } else {
                json response;
                response["success"] = false;
                response["message"] = "Failed to update review";
                return createResponse(500, response.dump());
            }
        } catch (const std::exception& e) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid request data";
            return createResponse(400, response.dump());
        }
    });
    
    // Delete a review
    app.route_dynamic("/api/reviews/<int>")
    .methods("DELETE"_method)
    ([this](const crow::request& req, int reviewId) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return createResponse(401, response.dump());
        }
        
        int userId = getUserIdFromRequest(req);
        if (userId <= 0) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid user";
            return createResponse(401, response.dump());
        }
        
        auto existingReview = reviewService.getReviewById(reviewId);
        if (!existingReview) {
            json response;
            response["success"] = false;
            response["message"] = "Review not found";
            return createResponse(404, response.dump());
        }
        
        // Check if the review belongs to the current user
        if (existingReview->getUserId() != userId) {
            json response;
            response["success"] = false;
            response["message"] = "You can only delete your own reviews";
            return createResponse(403, response.dump());
        }
        
        bool success = reviewService.deleteReview(reviewId);
        if (success) {
            json response;
            response["success"] = true;
            response["message"] = "Review deleted successfully";
            return createResponse(200, response.dump());
        } else {
            json response;
            response["success"] = false;
            response["message"] = "Failed to delete review";
            return createResponse(500, response.dump());
        }
    });
    
    // Get user's review for a restaurant
    app.route_dynamic("/api/users/me/restaurants/<int>/review")
    .methods("GET"_method)
    ([this](const crow::request& req, int restaurantId) {
        if (!isAuthenticated(req)) {
            json response;
            response["success"] = false;
            response["message"] = "Unauthorized";
            return createResponse(401, response.dump());
        }
        
        int userId = getUserIdFromRequest(req);
        if (userId <= 0) {
            json response;
            response["success"] = false;
            response["message"] = "Invalid user";
            return createResponse(401, response.dump());
        }
        
        auto review = reviewService.getUserReviewForRestaurant(userId, restaurantId);
        if (review) {
            json response;
            response["id"] = review->getId();
            response["userId"] = review->getUserId();
            response["restaurantId"] = review->getRestaurantId();
            response["rating"] = review->getRating();
            response["comment"] = review->getComment();
            return createResponse(200, response.dump());
        } else {
            return createResponse(404, "{}");
        }
    });
}

// Helper function to check if user is admin
bool ApiController::isAdmin(const crow::request& req) {
    if (!isAuthenticated(req)) {
        return false;
    }
    
    int userId = getUserIdFromRequest(req);
    if (userId == -1) {
        return false;
    }
    
    auto user = userData.getUserById(userId);
    if (!user) {
        return false;
    }
    
    return user->isAdmin();
}

void ApiController::setupAdminRoutes(crow::App<>& app) {
    // Get all users (admin only)
    app.route_dynamic("/api/admin/users")
    .methods("GET"_method)
    ([this](const crow::request& req) {
        if (!isAdmin(req)) {
            return createResponse(403, "{\"error\": \"Access denied\"}");
        }
        
        try {
            auto users = userData.getAllUsers();
            json response = json::array();
            
            for (const auto& user : users) {
                json userJson;
                userJson["id"] = user.getId();
                userJson["username"] = user.getUsername();
                userJson["email"] = user.getEmail();
                userJson["roleId"] = user.getRoleId();
                userJson["roleName"] = user.getRoleName();
                userJson["firstName"] = user.getFirstName();
                userJson["lastName"] = user.getLastName();
                userJson["phoneNumber"] = user.getPhoneNumber();
                userJson["isActive"] = user.isActive();
                userJson["createdAt"] = user.getCreatedAt();
                userJson["permissions"] = user.getPermissions();
                response.push_back(userJson);
            }
            
            return createResponse(200, response.dump());
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Failed to fetch users";
            return createResponse(500, error.dump());
        }
    });
    
    // Get all roles (admin only)
    app.route_dynamic("/api/admin/roles")
    .methods("GET"_method)
    ([this](const crow::request& req) {
        if (!isAdmin(req)) {
            return createResponse(403, "{\"error\": \"Access denied\"}");
        }
        
        try {
            auto roles = userData.getAllRoles();
            json response = json::array();
            
            for (const auto& role : roles) {
                json roleJson;
                roleJson["id"] = role.getId();
                roleJson["name"] = role.getName();
                roleJson["description"] = role.getDescription();
                roleJson["permissions"] = role.getPermissions();
                response.push_back(roleJson);
            }
            
            return createResponse(200, response.dump());
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Failed to fetch roles";
            return createResponse(500, error.dump());
        }
    });
    
    // Update user role (admin only)
    app.route_dynamic("/api/admin/users/<int>/role")
    .methods("PUT"_method)
    ([this](const crow::request& req, int userId) {
        if (!isAdmin(req)) {
            return createResponse(403, "{\"error\": \"Access denied\"}");
        }
        
        try {
            auto data = json::parse(req.body);
            int roleId = data["roleId"];
            
            int adminUserId = getUserIdFromRequest(req);
            bool success = userData.updateUserRole(userId, roleId);
            
            if (success) {
                // Log admin action
                userData.logAdminAction(adminUserId, "UPDATE_USER_ROLE", "user", userId, 
                                      "Changed role to " + std::to_string(roleId));
                
                json response;
                response["success"] = true;
                response["message"] = "User role updated successfully";
                return createResponse(200, response.dump());
            } else {
                json error;
                error["error"] = "Failed to update user role";
                return createResponse(500, error.dump());
            }
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Invalid request data";
            return createResponse(400, error.dump());
        }
    });
    
    // Update user status (admin only)
    app.route_dynamic("/api/admin/users/<int>/status")
    .methods("PUT"_method)
    ([this](const crow::request& req, int userId) {
        if (!isAdmin(req)) {
            return createResponse(403, "{\"error\": \"Access denied\"}");
        }
        
        try {
            auto data = json::parse(req.body);
            bool isActive = data["isActive"];
            
            int adminUserId = getUserIdFromRequest(req);
            bool success = userData.updateUserStatus(userId, isActive);
            
            if (success) {
                // Log admin action
                std::string action = isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER";
                userData.logAdminAction(adminUserId, action, "user", userId, 
                                      isActive ? "Activated user" : "Deactivated user");
                
                json response;
                response["success"] = true;
                response["message"] = "User status updated successfully";
                return createResponse(200, response.dump());
            } else {
                json error;
                error["error"] = "Failed to update user status";
                return createResponse(500, error.dump());
            }
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Invalid request data";
            return createResponse(400, error.dump());
        }
    });
    
    // Delete user (admin only)
    app.route_dynamic("/api/admin/users/<int>")
    .methods("DELETE"_method)
    ([this](const crow::request& req, int userId) {
        if (!isAdmin(req)) {
            json error;
            error["error"] = "Admin access required";
            return createResponse(403, error.dump());
        }
        
        try {
            auto user = userData.getUserById(userId);
            
            if (!user) {
                json error;
                error["error"] = "User not found";
                return createResponse(404, error.dump());
            }
            
            bool success = userData.deleteUser(userId);
            
            if (success) {
                int adminUserId = getUserIdFromRequest(req);
                userData.logAdminAction(adminUserId, "DELETE_USER", "user", userId, 
                                      "Deleted user: " + user->getUsername());
                
                json response;
                response["success"] = true;
                response["message"] = "User deleted successfully";
                return createResponse(200, response.dump());
            } else {
                json error;
                error["error"] = "Failed to delete user";
                return createResponse(500, error.dump());
            }
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Internal server error";
            return createResponse(500, error.dump());
        }
    });

    // Get all reservations for admin (admin only)
    app.route_dynamic("/api/admin/reservations")
    .methods("GET"_method)
    ([this](const crow::request& req) {
        if (!isAdmin(req)) {
            return createResponse(403, "{\"error\": \"Access denied\"}");
        }
        
        try {
            auto reservations = reservationData.getAllReservations();
            json response = json::array();
            
            for (const auto& reservation : reservations) {
                json reservationJson;
                reservationJson["id"] = reservation.getId();
                reservationJson["userId"] = reservation.getUserId();
                reservationJson["tableId"] = reservation.getTableId();
                reservationJson["restaurantId"] = reservation.getRestaurantId();
                reservationJson["date"] = reservation.getDate();
                reservationJson["startTime"] = reservation.getStartTime();
                reservationJson["endTime"] = reservation.getEndTime();
                reservationJson["guestCount"] = reservation.getGuestCount();
                reservationJson["status"] = reservation.getStatus();
                reservationJson["phoneNumber"] = reservation.getPhoneNumber();
                reservationJson["email"] = reservation.getEmail();
                reservationJson["specialRequests"] = reservation.getSpecialRequests();
                reservationJson["totalAmount"] = reservation.getTotalAmount();
                reservationJson["paymentStatus"] = reservation.getPaymentStatus();
                reservationJson["paymentMethod"] = reservation.getPaymentMethod();
                reservationJson["restaurantName"] = reservation.getRestaurantName();
                reservationJson["customerName"] = reservation.getCustomerName();
                response.push_back(reservationJson);
            }
            
            return createResponse(200, response.dump());
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Failed to fetch reservations";
            return createResponse(500, error.dump());
        }
    });

    // Get single reservation for admin (admin only)
    app.route_dynamic("/api/admin/reservations/<int>")
    .methods("GET"_method)
    ([this](const crow::request& req, int reservationId) {
        if (!isAdmin(req)) {
            return createResponse(403, "{\"error\": \"Access denied\"}");
        }
        
        try {
            auto reservation = reservationData.getReservationByIdWithDetails(reservationId);
            if (!reservation.has_value()) {
                json error;
                error["error"] = "Reservation not found";
                return createResponse(404, error.dump());
            }
            
            json reservationJson;
            reservationJson["id"] = reservation->getId();
            reservationJson["userId"] = reservation->getUserId();
            reservationJson["tableId"] = reservation->getTableId();
            reservationJson["restaurantId"] = reservation->getRestaurantId();
            reservationJson["date"] = reservation->getDate();
            reservationJson["startTime"] = reservation->getStartTime();
            reservationJson["endTime"] = reservation->getEndTime();
            reservationJson["guestCount"] = reservation->getGuestCount();
            reservationJson["status"] = reservation->getStatus();
            reservationJson["phoneNumber"] = reservation->getPhoneNumber();
            reservationJson["email"] = reservation->getEmail();
            reservationJson["specialRequests"] = reservation->getSpecialRequests();
            reservationJson["totalAmount"] = reservation->getTotalAmount();
            reservationJson["paymentStatus"] = reservation->getPaymentStatus();
            reservationJson["paymentMethod"] = reservation->getPaymentMethod();
            reservationJson["restaurantName"] = reservation->getRestaurantName();
            reservationJson["customerName"] = reservation->getCustomerName();
            
            return createResponse(200, reservationJson.dump());
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Failed to fetch reservation details";
            return createResponse(500, error.dump());
        }
    });

    // Update reservation (admin only)
    app.route_dynamic("/api/admin/reservations/<int>")
    .methods("PUT"_method)
    ([this](const crow::request& req, int reservationId) {
        if (!isAdmin(req)) {
            return createResponse(403, "{\"error\": \"Access denied\"}");
        }
        
        try {
            auto data = json::parse(req.body);
            
            // Get the existing reservation
            auto existingReservation = reservationData.getReservationById(reservationId);
            if (!existingReservation) {
                json error;
                error["error"] = "Reservation not found";
                return createResponse(404, error.dump());
            }
            
            // Create updated reservation object
            Reservation reservation = *existingReservation;
            
            // Update fields if provided
            if (data.contains("date")) {
                reservation.setDate(data["date"]);
            }
            if (data.contains("startTime")) {
                reservation.setStartTime(data["startTime"]);
            }
            if (data.contains("endTime")) {
                reservation.setEndTime(data["endTime"]);
            }
            if (data.contains("guestCount")) {
                reservation.setGuestCount(data["guestCount"]);
            }
            if (data.contains("phoneNumber")) {
                reservation.setPhoneNumber(data["phoneNumber"]);
            }
            if (data.contains("email")) {
                reservation.setEmail(data["email"]);
            }
            if (data.contains("specialRequests")) {
                reservation.setSpecialRequests(data["specialRequests"]);
            }
            if (data.contains("status")) {
                reservation.setStatus(data["status"]);
            }
            if (data.contains("tableId")) {
                reservation.setTableId(data["tableId"]);
            }
            if (data.contains("totalAmount")) {
                reservation.setTotalAmount(data["totalAmount"]);
            }
            if (data.contains("paymentStatus")) {
                reservation.setPaymentStatus(data["paymentStatus"]);
            }
            if (data.contains("paymentMethod")) {
                reservation.setPaymentMethod(data["paymentMethod"]);
            }
            
            bool success = reservationService.updateReservation(reservation);
            
            if (success) {
                int adminUserId = getUserIdFromRequest(req);
                userData.logAdminAction(adminUserId, "UPDATE_RESERVATION", "reservation", reservationId, 
                                      "Updated reservation for customer: " + reservation.getEmail());
                
                json response;
                response["success"] = true;
                response["message"] = "Reservation updated successfully";
                return createResponse(200, response.dump());
            } else {
                json error;
                error["error"] = "Failed to update reservation. Check if the table is available for the new time slot.";
                return createResponse(400, error.dump());
            }
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Invalid request data";
            return createResponse(400, error.dump());
        }
    });
    
    // GET /api/admin/restaurants/:id - Get restaurant details (admin only)
    app.route_dynamic("/api/admin/restaurants/<int>")
    .methods("GET"_method)
    ([this](const crow::request& req, int restaurantId) {
        if (!isAdmin(req)) {
            json error;
            error["error"] = "Admin access required";
            return createResponse(403, error.dump());
        }
        
        try {
            RestaurantData restaurantData;
            auto restaurant = restaurantData.getRestaurantById(restaurantId);
            
            if (!restaurant) {
                json error;
                error["error"] = "Restaurant not found";
                return createResponse(404, error.dump());
            }
            
            json restaurantJson;
            restaurantJson["id"] = restaurant->getId();
            restaurantJson["name"] = restaurant->getName();
            restaurantJson["address"] = restaurant->getAddress();
            restaurantJson["phoneNumber"] = restaurant->getPhoneNumber();
            restaurantJson["description"] = restaurant->getDescription();
            restaurantJson["tableCount"] = restaurant->getTableCount();
            restaurantJson["cuisineType"] = restaurant->getCuisineType();
            restaurantJson["rating"] = restaurant->getRating();
            restaurantJson["isFeatured"] = restaurant->getIsFeatured();
            restaurantJson["priceRange"] = restaurant->getPriceRange();
            restaurantJson["openingTime"] = restaurant->getOpeningTime();
            restaurantJson["closingTime"] = restaurant->getClosingTime();
            restaurantJson["imageUrl"] = restaurant->getImageUrl();
            restaurantJson["reservationFee"] = restaurant->getReservationFee();
            restaurantJson["isActive"] = restaurant->getIsActive();
            
            return createResponse(200, restaurantJson.dump());
            
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Failed to get restaurant details: " + std::string(e.what());
            return createResponse(500, error.dump());
        }
    });
    
    // PUT /api/admin/restaurants/:id - Update restaurant (admin only)
    app.route_dynamic("/api/admin/restaurants/<int>")
    .methods("PUT"_method)
    ([this](const crow::request& req, int restaurantId) {
        if (!isAdmin(req)) {
            json error;
            error["error"] = "Admin access required";
            return createResponse(403, error.dump());
        }
        
        try {
            json data = json::parse(req.body);
            
            // Validate required fields
            if (!data.contains("name") || !data.contains("address") || 
                !data.contains("phoneNumber") || !data.contains("cuisineType")) {
                json error;
                error["error"] = "Missing required fields";
                return createResponse(400, error.dump());
            }
            
            RestaurantData restaurantData;
            auto existingRestaurant = restaurantData.getRestaurantById(restaurantId);
            
            if (!existingRestaurant) {
                json error;
                error["error"] = "Restaurant not found";
                return createResponse(404, error.dump());
            }
            
            // Create updated restaurant object
            Restaurant restaurant;
            restaurant.setId(restaurantId);
            restaurant.setName(data["name"]);
            restaurant.setAddress(data["address"]);
            restaurant.setPhoneNumber(data["phoneNumber"]);
            restaurant.setDescription(data.value("description", ""));
            restaurant.setTableCount(data.value("tableCount", 10));
            restaurant.setCuisineType(data["cuisineType"]);
            restaurant.setRating(data.value("rating", 4.0));
            restaurant.setIsFeatured(data.value("isFeatured", false));
            restaurant.setPriceRange(data.value("priceRange", "Moderate"));
            restaurant.setOpeningTime(data.value("openingTime", "09:00"));
            restaurant.setClosingTime(data.value("closingTime", "22:00"));
            restaurant.setImageUrl(data.value("imageUrl", ""));
            restaurant.setReservationFee(data.value("reservationFee", 0.0));
            restaurant.setIsActive(data.value("isActive", true));
            
            bool success = restaurantData.updateRestaurant(restaurant);
            
            // Handle table updates if provided
            if (success && data.contains("tableOperations")) {
                TableData tableData;
                const auto& operations = data["tableOperations"];
                
                // Handle existing table updates
                if (operations.contains("existing") && operations["existing"].is_array()) {
                    for (const auto& tableJson : operations["existing"]) {
                        if (tableJson.contains("id") && tableJson.contains("capacity")) {
                            auto existingTable = tableData.getTableById(tableJson["id"]);
                            if (existingTable.has_value()) {
                                Table table = existingTable.value();
                                table.setSeatCount(tableJson["capacity"]);
                                tableData.updateTable(table);
                            }
                        }
                    }
                }
                
                // Handle new tables
                if (operations.contains("new") && operations["new"].is_array()) {
                    for (const auto& tableJson : operations["new"]) {
                        if (tableJson.contains("capacity")) {
                            Table table;
                            table.setRestaurantId(restaurantId);
                            table.setSeatCount(tableJson["capacity"]);
                            table.setIsAvailable(true);
                            tableData.addTable(table);
                        }
                    }
                }
                
                // Handle table deletions
                if (operations.contains("delete") && operations["delete"].is_array()) {
                    for (const auto& tableId : operations["delete"]) {
                        if (tableId.is_number_integer()) {
                            tableData.deleteTable(tableId);
                        }
                    }
                }
                
                // Update table count in restaurant to reflect current tables
                auto updatedTables = tableData.getTablesByRestaurantId(restaurantId);
                restaurant.setTableCount(updatedTables.size());
                restaurantData.updateRestaurant(restaurant);
            }
            
            if (success) {
                int adminUserId = getUserIdFromRequest(req);
                userData.logAdminAction(adminUserId, "UPDATE_RESTAURANT", "restaurant", restaurantId, 
                                      "Updated restaurant: " + restaurant.getName());
                
                json response;
                response["success"] = true;
                response["message"] = "Restaurant updated successfully";
                return createResponse(200, response.dump());
            } else {
                json error;
                error["error"] = "Failed to update restaurant";
                return createResponse(500, error.dump());
            }
            
        } catch (const json::parse_error& e) {
            json error;
            error["error"] = "Invalid JSON format";
            return createResponse(400, error.dump());
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Failed to update restaurant: " + std::string(e.what());
            return createResponse(500, error.dump());
        }
    });
    
    // DELETE /api/admin/restaurants/:id - Delete restaurant (admin only)
    app.route_dynamic("/api/admin/restaurants/<int>")
    .methods("DELETE"_method)
    ([this](const crow::request& req, int restaurantId) {
        if (!isAdmin(req)) {
            json error;
            error["error"] = "Admin access required";
            return createResponse(403, error.dump());
        }
        
        try {
            RestaurantData restaurantData;
            auto restaurant = restaurantData.getRestaurantById(restaurantId);
            
            if (!restaurant) {
                json error;
                error["error"] = "Restaurant not found";
                return createResponse(404, error.dump());
            }
            
            bool success = restaurantData.deleteRestaurant(restaurantId);
            
            if (success) {
                int adminUserId = getUserIdFromRequest(req);
                userData.logAdminAction(adminUserId, "DELETE_RESTAURANT", "restaurant", restaurantId, 
                                      "Deleted restaurant: " + restaurant->getName());
                
                json response;
                response["success"] = true;
                response["message"] = "Restaurant deleted successfully";
                return createResponse(200, response.dump());
            } else {
                json error;
                error["error"] = "Failed to delete restaurant";
                return createResponse(500, error.dump());
            }
        } catch (const std::exception& e) {
            json error;
            error["error"] = "Internal server error";
            return createResponse(500, error.dump());
        }
    });
}
