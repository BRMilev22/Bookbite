#include <crow.h>
#include <crow/json.h>
#include <crow/middlewares/cors.h>
#include <iostream>
#include <cmath> // For std::round
#include "../include/database/db_manager.h"
#include "../include/services/reservation_service.h"
#include "../include/services/promo_code_service.h"
#include "../include/services/restaurant_service.h"
#include "../include/services/user_service.h"
#include "../include/models/reservation.h"
#include "../include/models/restaurant_table.h"
#include "../include/models/restaurant.h"
#include "../include/models/promo_code.h"
#include "../include/models/user.h"

// Helper function to ensure a default admin exists
void ensureDefaultAdmin(UserService& userService) {
    // Check if admin user exists
    auto admin = userService.getUserByUsername("admin");
    if (!admin) {
        // Create a default admin user
        User defaultAdmin;
        defaultAdmin.username = "admin";
        defaultAdmin.email = "admin@bookbite.com";
        defaultAdmin.passwordHash = UserService::hashPassword("admin123");
        defaultAdmin.role = "admin";
        defaultAdmin.firstName = "Admin";
        defaultAdmin.lastName = "User";
        defaultAdmin.phone = "555-0000";
        
        userService.createUser(defaultAdmin);
        
        std::cout << "Created default admin user" << std::endl;
    } else {
        std::cout << "Default admin user already exists" << std::endl;
    }
}

int main() {
    // Create database connection
    DatabaseConfig config;
    Database db(config);
    
    // Create services
    ReservationService reservationService(db);
    PromoCodeService promoCodeService(db);
    RestaurantService restaurantService(db);
    UserService userService(db);
    
    // Ensure we have a default admin
    ensureDefaultAdmin(userService);
    
    // Create web app with CORS middleware
    crow::App<crow::CORSHandler> app;
    
    // Configure CORS
    auto& cors = app.get_middleware<crow::CORSHandler>();
    cors.global()
        .origin("*")
        .methods(crow::HTTPMethod::Get, crow::HTTPMethod::Post, 
                 crow::HTTPMethod::Put, crow::HTTPMethod::Delete, 
                 crow::HTTPMethod::Options)
        .headers("X-Requested-With, Content-Type, Accept, Authorization")
        .allow_credentials();
    
    // Base route
    CROW_ROUTE(app, "/")([]() {
        return "BookBite API is running";
    });
    
    // Restaurants route
    CROW_ROUTE(app, "/api/restaurants")
        .methods("GET"_method)
        ([&restaurantService]() {
            auto restaurants = restaurantService.getAllRestaurants();
            crow::json::wvalue response;
            crow::json::wvalue::list restaurantList;
            
            for (const auto& restaurant : restaurants) {
                crow::json::wvalue restaurantJson;
                restaurantJson["id"] = restaurant.id;
                restaurantJson["name"] = restaurant.name;
                restaurantJson["image"] = restaurant.imageUrl;
                restaurantJson["location"] = restaurant.location;
                restaurantJson["distance"] = restaurant.distance;
                restaurantJson["category"] = restaurant.category;
                restaurantJson["priceRange"] = restaurant.priceRange;
                restaurantJson["rating"] = restaurant.rating;
                restaurantJson["ratingLabel"] = restaurant.ratingLabel;
                restaurantJson["reviews"] = restaurant.reviews;
                restaurantJson["isSpecial"] = restaurant.isSpecial;
                restaurantJson["isRecommended"] = restaurant.isRecommended;
                restaurantJson["isTrending"] = restaurant.isTrending;
                
                // Add features if any
                if (!restaurant.features.empty()) {
                    crow::json::wvalue::list featuresList;
                    for (const auto& feature : restaurant.features) {
                        featuresList.push_back(feature.name);
                    }
                    restaurantJson["features"] = std::move(featuresList);
                } else {
                    restaurantJson["features"] = crow::json::wvalue::list{};
                }
                
                restaurantList.push_back(std::move(restaurantJson));
            }
            
            response["restaurants"] = std::move(restaurantList);
            return crow::response(200, response);
        });
    
    // Restaurant by ID route
    CROW_ROUTE(app, "/api/restaurants/<int>")
        .methods("GET"_method)
        ([&restaurantService](int restaurantId) {
            auto restaurant = restaurantService.getRestaurantById(restaurantId);
            
            if (restaurant) {
                crow::json::wvalue response;
                response["id"] = restaurant->id;
                response["name"] = restaurant->name;
                response["image"] = restaurant->imageUrl;
                response["location"] = restaurant->location;
                response["distance"] = restaurant->distance;
                response["category"] = restaurant->category;
                response["priceRange"] = restaurant->priceRange;
                response["rating"] = restaurant->rating;
                response["ratingLabel"] = restaurant->ratingLabel;
                response["reviews"] = restaurant->reviews;
                response["isSpecial"] = restaurant->isSpecial;
                response["isRecommended"] = restaurant->isRecommended;
                response["isTrending"] = restaurant->isTrending;
                
                // Add features
                crow::json::wvalue::list featuresList;
                for (const auto& feature : restaurant->features) {
                    featuresList.push_back(feature.name);
                }
                response["features"] = std::move(featuresList);
                
                // Get tables for this restaurant
                auto tables = restaurantService.getRestaurantTables(restaurantId);
                crow::json::wvalue::list tableList;
                
                for (const auto& table : tables) {
                    crow::json::wvalue tableJson;
                    tableJson["id"] = table.id;
                    tableJson["tableNumber"] = table.tableNumber;
                    tableJson["capacity"] = table.capacity;
                    tableJson["location"] = table.location;
                    tableJson["tableType"] = table.tableType;
                    tableJson["tableDetails"] = table.tableDetails;
                    tableJson["isActive"] = table.isActive;
                    tableList.push_back(std::move(tableJson));
                }
                
                response["tables"] = std::move(tableList);
                
                return crow::response(200, response);
            }
            
            crow::json::wvalue response;
            response["error"] = "Restaurant not found";
            return crow::response(404, response);
        });
    
    // Tables route - updated to include restaurant information
    CROW_ROUTE(app, "/api/tables")
        .methods("GET"_method)
        ([&db]() {
            std::vector<RestaurantTable> tables;
            auto result = db.query(
                "SELECT t.*, r.name as restaurant_name, r.location as restaurant_location "
                "FROM restaurant_tables t "
                "JOIN restaurants r ON t.restaurant_id = r.restaurant_id"
            );
            
            while (result.next()) {
                RestaurantTable table;
                table.id = result.get<int>("table_id");
                table.restaurantId = result.get<int>("restaurant_id");
                table.tableNumber = result.get<int>("table_number");
                table.capacity = result.get<int>("capacity");
                table.location = result.get<std::string>("location");
                table.tableType = result.get<std::string>("table_type");
                table.tableDetails = result.get<std::string>("table_details");
                table.isActive = result.get<int>("is_active") != 0;
                tables.push_back(table);
            }
            
            crow::json::wvalue response;
            crow::json::wvalue::list tableList;
            
            for (const auto& table : tables) {
                crow::json::wvalue tableJson;
                tableJson["id"] = table.id;
                tableJson["restaurantId"] = table.restaurantId;
                tableJson["tableNumber"] = table.tableNumber;
                tableJson["capacity"] = table.capacity;
                tableJson["location"] = table.location;
                tableJson["tableType"] = table.tableType;
                tableJson["tableDetails"] = table.tableDetails;
                tableJson["isActive"] = table.isActive;
                tableList.push_back(std::move(tableJson));
            }
            
            response["tables"] = std::move(tableList);
            return crow::response(200, response);
        });
    
    // Tables by restaurant ID route
    CROW_ROUTE(app, "/api/restaurants/<int>/tables")
        .methods("GET"_method)
        ([&restaurantService](int restaurantId) {
            auto tables = restaurantService.getRestaurantTables(restaurantId);
            
            crow::json::wvalue response;
            crow::json::wvalue::list tableList;
            
            for (const auto& table : tables) {
                crow::json::wvalue tableJson;
                tableJson["id"] = table.id;
                tableJson["restaurantId"] = table.restaurantId;
                tableJson["tableNumber"] = table.tableNumber;
                tableJson["capacity"] = table.capacity;
                tableJson["location"] = table.location;
                tableJson["tableType"] = table.tableType;
                tableJson["tableDetails"] = table.tableDetails;
                tableJson["isActive"] = table.isActive;
                tableList.push_back(std::move(tableJson));
            }
            
            response["tables"] = std::move(tableList);
            return crow::response(200, response);
        });
    
    // Customer routes
    CROW_ROUTE(app, "/api/customers")
        .methods("GET"_method)
        ([&userService]() {
            auto users = userService.getAllUsers();
            crow::json::wvalue response;
            crow::json::wvalue::list customerList;
            
            for (const auto& user : users) {
                crow::json::wvalue customerJson;
                customerJson["id"] = user.id;
                customerJson["firstName"] = user.firstName;
                customerJson["lastName"] = user.lastName;
                customerJson["email"] = user.email;
                customerJson["phone"] = user.phone;
                customerList.push_back(std::move(customerJson));
            }
            
            response["customers"] = std::move(customerList);
            return crow::response(200, response);
        });
    
    CROW_ROUTE(app, "/api/customers/<int>")
        .methods("GET"_method)
        ([&userService](int userId) {
            auto user = userService.getUserById(userId);
            
            if (user) {
                crow::json::wvalue response;
                response["id"] = user->id;
                response["firstName"] = user->firstName;
                response["lastName"] = user->lastName;
                response["email"] = user->email;
                response["phone"] = user->phone;
                return crow::response(200, response);
            }
            
            crow::json::wvalue response;
            response["error"] = "Customer not found";
            return crow::response(404, response);
        });
    
    CROW_ROUTE(app, "/api/customers")
        .methods("POST"_method)
        ([&userService](const crow::request& req) {
            auto x = crow::json::load(req.body);
            if (!x) {
                return crow::response(400, "{\"error\":\"Invalid JSON format\"}");
            }
            
            try {
                User customer;
                customer.username = x["username"].s();
                customer.email = x["email"].s();
                customer.firstName = x["firstName"].s();
                customer.lastName = x["lastName"].s();
                customer.phone = x["phone"].s();
                
                int id = userService.createUser(customer);
                
                if (id > 0) {
                    crow::json::wvalue response;
                    response["id"] = id;
                    response["message"] = "Customer created successfully";
                    return crow::response(201, response);
                }
                
                crow::json::wvalue error_response;
                error_response["error"] = "Failed to create customer";
                return crow::response(500, error_response);
            } catch (const std::exception& e) {
                std::cout << "Error creating customer: " << e.what() << std::endl;
                crow::json::wvalue error_response;
                
                std::string error_msg = e.what();
                if (error_msg.find("Duplicate entry") != std::string::npos && 
                    error_msg.find("email") != std::string::npos) {
                    // This is a duplicate email error
                    error_response["error"] = "A customer with this email already exists";
                    return crow::response(409, error_response);
                }
                
                error_response["error"] = std::string("Error: ") + e.what();
                return crow::response(500, error_response);
            }
        });
    
    // Reservation routes
    CROW_ROUTE(app, "/api/reservations")
        .methods("GET"_method)
        ([&reservationService]() {
            auto reservations = reservationService.getAllReservations();
            crow::json::wvalue response;
            crow::json::wvalue::list reservationList;
            
            for (const auto& reservation : reservations) {
                crow::json::wvalue reservationJson;
                reservationJson["id"] = reservation.id;
                reservationJson["userId"] = reservation.userId;
                reservationJson["tableId"] = reservation.tableId;
                reservationJson["date"] = reservation.date;
                reservationJson["startTime"] = reservation.startTime;
                reservationJson["endTime"] = reservation.endTime;
                reservationJson["partySize"] = reservation.partySize;
                reservationJson["status"] = static_cast<int>(reservation.status);
                reservationJson["specialRequests"] = reservation.specialRequests;
                
                // Add occasion if present
                if (!reservation.occasion.empty()) {
                    reservationJson["occasion"] = reservation.occasion;
                }
                
                // Add dietary restrictions if present
                if (!reservation.dietaryRestrictions.empty()) {
                    crow::json::wvalue::list restrictionsList;
                    for (const auto& restriction : reservation.dietaryRestrictions) {
                        restrictionsList.push_back(restriction);
                    }
                    reservationJson["dietaryRestrictions"] = std::move(restrictionsList);
                }
                
                // Add promo code if present
                if (!reservation.promoCode.empty()) {
                    reservationJson["promoCode"] = reservation.promoCode;
                }
                
                // Add price
                reservationJson["price"] = reservation.price;
                
                reservationList.push_back(std::move(reservationJson));
            }
            
            response["reservations"] = std::move(reservationList);
            return crow::response(200, response);
        });
    
    CROW_ROUTE(app, "/api/reservations")
        .methods("POST"_method)
        ([&reservationService, &promoCodeService, &userService, &db](const crow::request& req) {
            auto x = crow::json::load(req.body);
            if (!x) {
                return crow::response(400, "{\"error\":\"Invalid JSON format\"}");
            }
            
            try {
                // Debug print the received JSON
                std::cout << "Received reservation JSON: " << req.body << std::endl;
                
                Reservation reservation;
                reservation.tableId = x.has("tableId") ? x["tableId"].i() : 1; // Default to table ID 1
                reservation.date = x["reservationDate"].s();
                reservation.startTime = x["startTime"].s();
                reservation.endTime = x["endTime"].s();
                reservation.partySize = x["partySize"].i();
                
                // Handle user ID - check all possible field names
                if (!x.has("userId") && !x.has("user_id") && !x.has("id")) {
                    crow::json::wvalue error_response;
                    error_response["error"] = "Authentication required - must be logged in to make reservations";
                    std::cout << "No userId found in request" << std::endl;
                    return crow::response(401, error_response);
                }
                
                // Try to get userId from multiple possible field names
                if (x.has("userId")) {
                    reservation.userId = x["userId"].i();
                    std::cout << "Using userId: " << reservation.userId << std::endl;
                } else if (x.has("user_id")) {
                    reservation.userId = x["user_id"].i();
                    std::cout << "Using user_id: " << reservation.userId << std::endl;
                } else if (x.has("id")) {
                    reservation.userId = x["id"].i();
                    std::cout << "Using id: " << reservation.userId << std::endl;
                }
                
                // Verify the user exists
                auto result = db.query("SELECT COUNT(*) FROM users WHERE user_id = " + 
                                      std::to_string(reservation.userId));
                if (result.next() && result.get<int>(0) == 0) {
                    // User doesn't exist
                    crow::json::wvalue error_response;
                    error_response["error"] = "User not found";
                    std::cout << "User with ID " << reservation.userId << " not found" << std::endl;
                    return crow::response(404, error_response);
                }
                
                // Use defaults for optional fields
                if (x.has("status")) {
                    if (x["status"].t() == crow::json::type::Number) {
                        reservation.status = static_cast<ReservationStatus>(x["status"].i());
                    } else if (x["status"].t() == crow::json::type::String) {
                        std::string statusStr = x["status"].s();
                        if (statusStr == "pending") reservation.status = ReservationStatus::Pending;
                        else if (statusStr == "confirmed") reservation.status = ReservationStatus::Confirmed;
                        else if (statusStr == "cancelled") reservation.status = ReservationStatus::Cancelled;
                        else if (statusStr == "completed") reservation.status = ReservationStatus::Completed;
                        else reservation.status = ReservationStatus::Pending;
                    } else {
                        reservation.status = ReservationStatus::Pending;
                    }
                } else {
                    reservation.status = ReservationStatus::Pending;
                }
                    
                // Handle specialRequests field
                reservation.specialRequests = x.has("specialRequests") 
                    ? std::string(x["specialRequests"].s()) 
                    : std::string("");
                
                // Handle occasion
                if (x.has("occasion") && x["occasion"].t() == crow::json::type::String) {
                    reservation.occasion = x["occasion"].s();
                }
                
                // Handle dietary restrictions
                if (x.has("dietaryRestrictions") && x["dietaryRestrictions"].t() == crow::json::type::List) {
                    for (const auto& item : x["dietaryRestrictions"]) {
                        if (item.t() == crow::json::type::String) {
                            reservation.dietaryRestrictions.push_back(item.s());
                        }
                    }
                }
                
                // Handle promo code
                if (x.has("promoCode") && !std::string(x["promoCode"].s()).empty()) {
                    std::string promoCode = x["promoCode"].s();
                    if (promoCodeService.validatePromoCode(promoCode)) {
                        reservation.promoCode = promoCode;
                    } else {
                        crow::json::wvalue error_response;
                        error_response["error"] = "Invalid promo code";
                        return crow::response(400, error_response);
                    }
                }
                
                // Handle billing information
                if (x.has("billingAddress") && x["billingAddress"].t() == crow::json::type::String) {
                    reservation.billingAddress = x["billingAddress"].s();
                }
                
                if (x.has("postalCode") && x["postalCode"].t() == crow::json::type::String) {
                    reservation.postalCode = x["postalCode"].s();
                }
                
                if (x.has("city") && x["city"].t() == crow::json::type::String) {
                    reservation.city = x["city"].s();
                }
                
                if (x.has("paymentMethod") && x["paymentMethod"].t() == crow::json::type::String) {
                    reservation.paymentMethod = x["paymentMethod"].s();
                }
                
                if (x.has("cardNumber") && x["cardNumber"].t() == crow::json::type::String) {
                    // DON'T store full card number, only last 4 digits
                    std::string cardNumber = x["cardNumber"].s();
                    // Extract last 4 digits if card number is long enough
                    if (cardNumber.length() >= 4) {
                        // Remove spaces and get only last 4 digits
                        std::string cleanNumber = cardNumber;
                        cleanNumber.erase(std::remove_if(cleanNumber.begin(), cleanNumber.end(), ::isspace), cleanNumber.end());
                        std::string lastFour = cleanNumber.substr(cleanNumber.length() - 4);
                        reservation.cardLastFour = lastFour;
                    }
                }
                
                if (x.has("paymentToken") && x["paymentToken"].t() == crow::json::type::String) {
                    reservation.paymentToken = x["paymentToken"].s();
                }
                
                // Handle contact information
                auto user = userService.getUserById(reservation.userId);
                if (user) {
                    reservation.phoneNumber = user->phone;
                }
                
                // Add handling for nameOnCard field
                if (x.has("nameOnCard") && x["nameOnCard"].t() == crow::json::type::String) {
                    reservation.nameOnCard = x["nameOnCard"].s();
                    std::cout << "Name on card: " << reservation.nameOnCard << std::endl;
                }
                
                // Add handling for cardLastFour that is sent directly
                if (x.has("cardLastFour") && x["cardLastFour"].t() == crow::json::type::String) {
                    reservation.cardLastFour = x["cardLastFour"].s();
                    std::cout << "Card last four: " << reservation.cardLastFour << std::endl;
                }
                
                // Check if the table is available
                std::cout << "Checking table availability..." << std::endl;
                bool isAvailable = reservationService.isTableAvailable(
                    reservation.tableId, reservation.date, 
                    reservation.startTime, reservation.endTime);
                    
                std::cout << "Table " << (isAvailable ? "is" : "is not") << " available" << std::endl;
                
                if (!isAvailable) {
                    crow::json::wvalue error_response;
                    error_response["error"] = "Table is not available for the selected time";
                    return crow::response(409, error_response);
                }
                
                // Calculate the price based on frontend display
                double baseFee = 10.0; // Base reservation fee
                double additionalGuestFee = 5.0; // Fee for the party (beyond just 1 person)
                double serviceFeePct = 0.05; // 5% service fee
                
                // Calculate subtotal (base fee + additional guests)
                double additionalGuests = reservation.partySize > 1 ? reservation.partySize - 1 : 0;
                double personFee = additionalGuestFee * additionalGuests;
                double subtotal = baseFee + personFee;
                
                // Add service fee
                double serviceFee = subtotal * serviceFeePct;
                double totalBeforeDiscount = subtotal + serviceFee;
                
                // Apply discount from promo code if valid
                double discount = 0.0;
                int discountPercentage = 0;
                if (!reservation.promoCode.empty()) {
                    auto promoCode = promoCodeService.getPromoCodeByCode(reservation.promoCode);
                    if (promoCode && promoCodeService.validatePromoCode(reservation.promoCode)) {
                        discountPercentage = promoCode->discountPercentage;
                        discount = totalBeforeDiscount * (discountPercentage / 100.0);
                    }
                }
                
                // Calculate final price
                double finalPrice = totalBeforeDiscount - discount;
                
                // Round to 2 decimal places
                finalPrice = std::round(finalPrice * 100) / 100;
                
                // Set the calculated price and pricing details
                reservation.price = finalPrice;
                reservation.baseFee = baseFee;
                reservation.serviceFee = serviceFee;
                reservation.personFee = personFee;
                reservation.discountAmount = discount;
                reservation.discountPercentage = discountPercentage;
                
                std::cout << "Creating reservation with price breakdown:" << std::endl;
                std::cout << "Base Fee: $" << baseFee << std::endl;
                std::cout << "Additional Guests Fee: $" << personFee << std::endl;
                std::cout << "Service Fee: $" << serviceFee << std::endl;
                std::cout << "Discount: $" << discount << std::endl;
                std::cout << "Final Price: $" << finalPrice << std::endl;
                
                std::cout << "Creating reservation with price: $" << reservation.price << std::endl;
                int id = reservationService.createReservation(reservation);
                
                if (id > 0) {
                    std::cout << "Reservation created with ID: " << id << std::endl;
                    crow::json::wvalue response;
                    response["id"] = id;
                    response["message"] = "Reservation created successfully";
                    
                    // Apply promo code if it was provided and valid
                    if (!reservation.promoCode.empty()) {
                        promoCodeService.applyPromoCode(reservation.promoCode);
                    }
                    
                    return crow::response(201, response);
                }
                
                std::cout << "Failed to create reservation" << std::endl;
                crow::json::wvalue error_response;
                error_response["error"] = "Failed to create reservation";
                return crow::response(500, error_response);
            } catch (const std::exception& e) {
                std::cout << "Exception creating reservation: " << e.what() << std::endl;
                crow::json::wvalue error_response;
                error_response["error"] = std::string("Error: ") + e.what();
                return crow::response(500, error_response);
            } catch (...) {
                std::cout << "Unknown exception creating reservation" << std::endl;
                crow::json::wvalue error_response;
                error_response["error"] = "Unknown error creating reservation";
                return crow::response(500, error_response);
            }
        });
    
    // Get dietary restrictions for a specific reservation
    CROW_ROUTE(app, "/api/reservations/<int>/dietary-restrictions")
        .methods("GET"_method)
        ([&reservationService](int reservationId) {
            auto restrictions = reservationService.getReservationDietaryRestrictions(reservationId);
            
            crow::json::wvalue response;
            crow::json::wvalue::list restrictionList;
            
            for (const auto& restriction : restrictions) {
                restrictionList.push_back(restriction);
            }
            
            response["dietaryRestrictions"] = std::move(restrictionList);
            return crow::response(200, response);
        });
    
    // Promo Code routes
    CROW_ROUTE(app, "/api/promo-codes")
        .methods("GET"_method)
        ([&promoCodeService]() {
            auto promoCodes = promoCodeService.getAllPromoCodes();
            crow::json::wvalue response;
            crow::json::wvalue::list promoCodeList;
            
            for (const auto& promoCode : promoCodes) {
                crow::json::wvalue promoCodeJson;
                promoCodeJson["id"] = promoCode.id;
                promoCodeJson["code"] = promoCode.code;
                promoCodeJson["discountPercentage"] = promoCode.discountPercentage;
                promoCodeJson["startDate"] = promoCode.startDate;
                promoCodeJson["endDate"] = promoCode.endDate;
                promoCodeJson["isActive"] = promoCode.isActive;
                promoCodeJson["maxUses"] = promoCode.maxUses;
                promoCodeJson["currentUses"] = promoCode.currentUses;
                promoCodeList.push_back(std::move(promoCodeJson));
            }
            
            response["promoCodes"] = std::move(promoCodeList);
            return crow::response(200, response);
        });
    
    CROW_ROUTE(app, "/api/promo-codes/<int>")
        .methods("GET"_method)
        ([&promoCodeService](int promoId) {
            auto promoCode = promoCodeService.getPromoCodeById(promoId);
            
            if (promoCode) {
                crow::json::wvalue response;
                response["id"] = promoCode->id;
                response["code"] = promoCode->code;
                response["discountPercentage"] = promoCode->discountPercentage;
                response["startDate"] = promoCode->startDate;
                response["endDate"] = promoCode->endDate;
                response["isActive"] = promoCode->isActive;
                response["maxUses"] = promoCode->maxUses;
                response["currentUses"] = promoCode->currentUses;
                return crow::response(200, response);
            }
            
            crow::json::wvalue response;
            response["error"] = "Promo code not found";
            return crow::response(404, response);
        });
    
    CROW_ROUTE(app, "/api/promo-codes/validate/<string>")
        .methods("GET"_method)
        ([&promoCodeService](const std::string& code) {
            try {
                std::cout << "Validating promo code: " << code << std::endl;
                bool isValid = promoCodeService.validatePromoCode(code);
                
                // Get more details about the promo code for debugging
                auto promoCode = promoCodeService.getPromoCodeByCode(code);
                
                crow::json::wvalue response;
                response["isValid"] = isValid;
                
                if (isValid && promoCode) {
                    response["discountPercentage"] = promoCode->discountPercentage;
                } else {
                    response["discountPercentage"] = 0;
                }
                
                // Add detailed information for debugging
                response["promoCodeExists"] = promoCode.has_value();
                
                if (promoCode) {
                    response["code"] = promoCode->code;
                    response["startDate"] = promoCode->startDate;
                    response["endDate"] = promoCode->endDate;
                    response["isActive"] = promoCode->isActive;
                    response["maxUses"] = promoCode->maxUses;
                    response["currentUses"] = promoCode->currentUses;
                }
                
                // Get the current date for comparison
                auto now = std::chrono::system_clock::now();
                auto time = std::chrono::system_clock::to_time_t(now);
                std::tm tm = *std::localtime(&time);
                std::stringstream ss;
                ss << std::put_time(&tm, "%Y-%m-%d");
                std::string currentDate = ss.str();
                
                response["currentDate"] = currentDate;
                
                return crow::response(200, response);
            } catch (const std::exception& e) {
                std::cout << "Exception in promo code validation: " << e.what() << std::endl;
                crow::json::wvalue error_response;
                error_response["error"] = std::string("Error validating promo code: ") + e.what();
                error_response["isValid"] = false;
                error_response["discountPercentage"] = 0;
                return crow::response(200, error_response); // Return 200 to avoid frontend failures
            } catch (...) {
                std::cout << "Unknown exception in promo code validation" << std::endl;
                crow::json::wvalue error_response;
                error_response["error"] = "Unknown error validating promo code";
                error_response["isValid"] = false;
                error_response["discountPercentage"] = 0;
                return crow::response(200, error_response); // Return 200 to avoid frontend failures
            }
        });
    
    CROW_ROUTE(app, "/api/promo-codes")
        .methods("POST"_method)
        ([&promoCodeService](const crow::request& req) {
            auto x = crow::json::load(req.body);
            if (!x) {
                return crow::response(400, "{\"error\":\"Invalid JSON format\"}");
            }
            
            try {
                PromoCode promoCode;
                promoCode.code = x["code"].s();
                promoCode.discountPercentage = x["discountPercentage"].i();
                promoCode.startDate = x["startDate"].s();
                promoCode.endDate = x["endDate"].s();
                
                if (x.has("isActive")) {
                    promoCode.isActive = x["isActive"].b();
                }
                
                if (x.has("maxUses")) {
                    promoCode.maxUses = x["maxUses"].i();
                }
                
                if (x.has("currentUses")) {
                    promoCode.currentUses = x["currentUses"].i();
                }
                
                int id = promoCodeService.createPromoCode(promoCode);
                
                if (id > 0) {
                    crow::json::wvalue response;
                    response["id"] = id;
                    response["message"] = "Promo code created successfully";
                    return crow::response(201, response);
                }
                
                crow::json::wvalue error_response;
                error_response["error"] = "Failed to create promo code";
                return crow::response(500, error_response);
            } catch (const std::exception& e) {
                crow::json::wvalue error_response;
                error_response["error"] = std::string("Error: ") + e.what();
                return crow::response(500, error_response);
            }
        });
        
    CROW_ROUTE(app, "/api/promo-codes/<int>")
        .methods("PUT"_method)
        ([&promoCodeService](const crow::request& req, int promoId) {
            auto x = crow::json::load(req.body);
            if (!x) {
                return crow::response(400, "{\"error\":\"Invalid JSON format\"}");
            }
            
            auto existingPromoCode = promoCodeService.getPromoCodeById(promoId);
            if (!existingPromoCode) {
                crow::json::wvalue error_response;
                error_response["error"] = "Promo code not found";
                return crow::response(404, error_response);
            }
            
            try {
                PromoCode promoCode;
                promoCode.id = promoId;
                promoCode.code = x.has("code") ? x["code"].s() : existingPromoCode->code;
                promoCode.discountPercentage = x.has("discountPercentage") ? x["discountPercentage"].i() : existingPromoCode->discountPercentage;
                promoCode.startDate = x.has("startDate") ? x["startDate"].s() : existingPromoCode->startDate;
                promoCode.endDate = x.has("endDate") ? x["endDate"].s() : existingPromoCode->endDate;
                promoCode.isActive = x.has("isActive") ? x["isActive"].b() : existingPromoCode->isActive;
                promoCode.maxUses = x.has("maxUses") ? x["maxUses"].i() : existingPromoCode->maxUses;
                promoCode.currentUses = x.has("currentUses") ? x["currentUses"].i() : existingPromoCode->currentUses;
                
                if (promoCodeService.updatePromoCode(promoCode)) {
                    crow::json::wvalue response;
                    response["message"] = "Promo code updated successfully";
                    return crow::response(200, response);
                }
                
                crow::json::wvalue error_response;
                error_response["error"] = "Failed to update promo code";
                return crow::response(500, error_response);
            } catch (const std::exception& e) {
                crow::json::wvalue error_response;
                error_response["error"] = std::string("Error: ") + e.what();
                return crow::response(500, error_response);
            }
        });
        
    CROW_ROUTE(app, "/api/promo-codes/<int>")
        .methods("DELETE"_method)
        ([&promoCodeService](int promoId) {
            if (promoCodeService.deletePromoCode(promoId)) {
                crow::json::wvalue response;
                response["message"] = "Promo code deleted successfully";
                return crow::response(200, response);
            }
            
            crow::json::wvalue error_response;
            error_response["error"] = "Failed to delete promo code or promo code not found";
            return crow::response(404, error_response);
        });
    
    // User Authentication Routes
    
    // Register a new user (open to all)
    CROW_ROUTE(app, "/api/auth/register")
        .methods("POST"_method)
        ([&userService](const crow::request& req) {
            auto bodyContent = crow::json::load(req.body);
            
            if (!bodyContent) {
                return crow::response(400, "Invalid JSON body");
            }
            
            // Extract user data from request
            User newUser;
            
            try {
                newUser.username = bodyContent["username"].s();
                newUser.email = bodyContent["email"].s();
                newUser.firstName = bodyContent["firstName"].s();
                newUser.lastName = bodyContent["lastName"].s();
                newUser.phone = bodyContent["phone"].s();
                newUser.role = "user"; // Default role for new registrations
                
                // Hash the password
                std::string plainPassword = bodyContent["password"].s();
                newUser.passwordHash = UserService::hashPassword(plainPassword);
                
                // Check if username or email already exists
                if (userService.getUserByUsername(newUser.username) || 
                    userService.getUserByEmail(newUser.email)) {
                    return crow::response(409, "Username or email already exists");
                }
                
                // Create the user
                int userId = userService.createUser(newUser);
                if (userId > 0) {
                    // Success - return the new user ID
                    crow::json::wvalue response;
                    response["userId"] = userId;
                    response["username"] = newUser.username;
                    response["email"] = newUser.email;
                    response["firstName"] = newUser.firstName;
                    response["lastName"] = newUser.lastName;
                    response["phone"] = newUser.phone;
                    response["role"] = newUser.role;
                    
                    return crow::response(201, response);
                } else {
                    return crow::response(500, "Failed to create user");
                }
            } catch (const std::exception& e) {
                return crow::response(400, "Invalid request data: " + std::string(e.what()));
            }
        });
    
    // Login route
    CROW_ROUTE(app, "/api/auth/login")
        .methods("POST"_method)
        ([&userService](const crow::request& req) {
            auto bodyContent = crow::json::load(req.body);
            
            if (!bodyContent) {
                return crow::response(400, "Invalid JSON body");
            }
            
            try {
                std::string usernameOrEmail = bodyContent["usernameOrEmail"].s();
                std::string password = bodyContent["password"].s();
                
                // Authenticate user
                auto user = userService.login(usernameOrEmail, password);
                
                if (user) {
                    // Login successful
                    crow::json::wvalue response;
                    response["id"] = user->id;  // Include id for consistency
                    response["userId"] = user->id;  // Include userId as well
                    response["username"] = user->username;
                    response["email"] = user->email;
                    response["firstName"] = user->firstName;
                    response["lastName"] = user->lastName;
                    response["phone"] = user->phone;
                    response["role"] = user->role;
                    
                    return crow::response(200, response);
                } else {
                    // Authentication failed
                    return crow::response(401, "Invalid credentials");
                }
            } catch (const std::exception& e) {
                return crow::response(400, "Invalid request data: " + std::string(e.what()));
            }
        });
    
    // Get all users (admin only)
    CROW_ROUTE(app, "/api/users")
        .methods("GET"_method)
        ([&userService](const crow::request& req) {
            // Check for admin role
            // In a real application, this would use a proper auth middleware
            // For now, we'll just assume the admin is authenticated if they have the route
            
            auto users = userService.getAllUsers();
            crow::json::wvalue response;
            crow::json::wvalue::list userList;
            
            for (const auto& user : users) {
                crow::json::wvalue userJson;
                userJson["id"] = user.id;
                userJson["username"] = user.username;
                userJson["email"] = user.email;
                userJson["firstName"] = user.firstName;
                userJson["lastName"] = user.lastName;
                userJson["phone"] = user.phone;
                userJson["role"] = user.role;
                userJson["createdAt"] = user.createdAt;
                
                // Don't include password hash in response
                userList.push_back(std::move(userJson));
            }
            
            response["users"] = std::move(userList);
            return crow::response(200, response);
        });
    
    // Get user by ID
    CROW_ROUTE(app, "/api/users/<int>")
        .methods("GET"_method)
        ([&userService](int userId) {
            auto user = userService.getUserById(userId);
            
            if (user) {
                crow::json::wvalue response;
                response["id"] = user->id;
                response["username"] = user->username;
                response["email"] = user->email;
                response["firstName"] = user->firstName;
                response["lastName"] = user->lastName;
                response["phone"] = user->phone;
                response["role"] = user->role;
                response["createdAt"] = user->createdAt;
                
                return crow::response(200, response);
            } else {
                return crow::response(404, "User not found");
            }
        });
    
    // Update user role (admin only)
    CROW_ROUTE(app, "/api/users/<int>/role")
        .methods("PUT"_method)
        ([&userService](const crow::request& req, int userId) {
            auto bodyContent = crow::json::load(req.body);
            
            if (!bodyContent) {
                return crow::response(400, "Invalid JSON body");
            }
            
            try {
                std::string newRole = bodyContent["role"].s();
                
                // Validate role
                if (newRole != "user" && newRole != "admin") {
                    return crow::response(400, "Invalid role. Must be 'user' or 'admin'");
                }
                
                // Check if user exists
                auto user = userService.getUserById(userId);
                if (!user) {
                    return crow::response(404, "User not found");
                }
                
                // Update role
                if (userService.updateUserRole(userId, newRole)) {
                    crow::json::wvalue response;
                    response["userId"] = userId;
                    response["role"] = newRole;
                    return crow::response(200, response);
                } else {
                    return crow::response(500, "Failed to update user role");
                }
            } catch (const std::exception& e) {
                return crow::response(400, "Invalid request data: " + std::string(e.what()));
            }
        });
    
    // Update user profile 
    CROW_ROUTE(app, "/api/users/<int>")
        .methods("PUT"_method)
        ([&userService](const crow::request& req, int userId) {
            auto bodyContent = crow::json::load(req.body);
            
            if (!bodyContent) {
                return crow::response(400, "Invalid JSON body");
            }
            
            try {
                // Get current user data
                auto existingUser = userService.getUserById(userId);
                if (!existingUser) {
                    return crow::response(404, "User not found");
                }
                
                User updatedUser = *existingUser;
                
                // Update fields from request body
                if (bodyContent.has("firstName")) {
                    updatedUser.firstName = bodyContent["firstName"].s();
                }
                
                if (bodyContent.has("lastName")) {
                    updatedUser.lastName = bodyContent["lastName"].s();
                }
                
                if (bodyContent.has("phone")) {
                    updatedUser.phone = bodyContent["phone"].s();
                }
                
                // Optionally update password if provided and authenticated
                if (bodyContent.has("currentPassword") && bodyContent.has("newPassword")) {
                    std::string currentPassword = bodyContent["currentPassword"].s();
                    std::string newPassword = bodyContent["newPassword"].s();
                    
                    // Verify current password
                    if (!userService.verifyPassword(currentPassword, updatedUser.passwordHash)) {
                        return crow::response(401, "Current password is incorrect");
                    }
                    
                    // Update password
                    updatedUser.passwordHash = UserService::hashPassword(newPassword);
                }
                
                // Update the user
                if (userService.updateUser(updatedUser)) {
                    // Return updated user data without password hash
                    crow::json::wvalue response;
                    response["id"] = updatedUser.id;
                    response["username"] = updatedUser.username;
                    response["email"] = updatedUser.email;
                    response["firstName"] = updatedUser.firstName;
                    response["lastName"] = updatedUser.lastName;
                    response["phone"] = updatedUser.phone;
                    response["role"] = updatedUser.role;
                    
                    return crow::response(200, response);
                } else {
                    return crow::response(500, "Failed to update user");
                }
            } catch (const std::exception& e) {
                return crow::response(400, "Invalid request data: " + std::string(e.what()));
            }
        });
    
    // Start the server
    app.port(8080).multithreaded().run();
    
    return 0;
} 