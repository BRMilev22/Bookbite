#include <crow.h>
#include <crow/json.h>
#include <crow/middlewares/cors.h>
#include <iostream>
#include "../include/database/db_manager.h"
#include "../include/services/customer_service.h"
#include "../include/services/reservation_service.h"
#include "../include/models/customer.h"
#include "../include/models/reservation.h"
#include "../include/models/restaurant_table.h"

// Ensure we have at least one default customer in the database
void ensureDefaultCustomer(CustomerService& customerService) {
    auto customers = customerService.getAllCustomers();
    if (customers.empty()) {
        Customer defaultCustomer;
        defaultCustomer.firstName = "Guest";
        defaultCustomer.lastName = "User";
        defaultCustomer.email = "guest@example.com";
        defaultCustomer.phone = "555-1234";
        customerService.createCustomer(defaultCustomer);
        std::cout << "Created default customer" << std::endl;
    }
}

int main() {
    // Create database connection
    DatabaseConfig config;
    Database db(config);
    
    // Create services
    CustomerService customerService(db);
    ReservationService reservationService(db);
    
    // Ensure we have a default customer
    ensureDefaultCustomer(customerService);
    
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
    
    // Tables route
    CROW_ROUTE(app, "/api/tables")
        .methods("GET"_method)
        ([&db]() {
            std::vector<RestaurantTable> tables;
            auto result = db.query("SELECT * FROM restaurant_tables");
            
            while (result.next()) {
                RestaurantTable table;
                table.id = result.get<int>(0);
                table.tableNumber = result.get<int>(1);
                table.capacity = result.get<int>(2);
                table.location = result.get<std::string>(3);
                tables.push_back(table);
            }
            
            crow::json::wvalue response;
            crow::json::wvalue::list tableList;
            
            for (const auto& table : tables) {
                crow::json::wvalue tableJson;
                tableJson["id"] = table.id;
                tableJson["tableNumber"] = table.tableNumber;
                tableJson["capacity"] = table.capacity;
                tableJson["location"] = table.location;
                tableList.push_back(std::move(tableJson));
            }
            
            response["tables"] = std::move(tableList);
            return crow::response(200, response);
        });
    
    // Customer routes
    CROW_ROUTE(app, "/api/customers")
        .methods("GET"_method)
        ([&customerService]() {
            auto customers = customerService.getAllCustomers();
            crow::json::wvalue response;
            crow::json::wvalue::list customerList;
            
            for (const auto& customer : customers) {
                crow::json::wvalue customerJson;
                customerJson["id"] = customer.id;
                customerJson["firstName"] = customer.firstName;
                customerJson["lastName"] = customer.lastName;
                customerJson["email"] = customer.email;
                customerJson["phone"] = customer.phone;
                customerList.push_back(std::move(customerJson));
            }
            
            response["customers"] = std::move(customerList);
            return crow::response(200, response);
        });
    
    CROW_ROUTE(app, "/api/customers/<int>")
        .methods("GET"_method)
        ([&customerService](int customerId) {
            auto customer = customerService.getCustomerById(customerId);
            
            if (customer) {
                crow::json::wvalue response;
                response["id"] = customer->id;
                response["firstName"] = customer->firstName;
                response["lastName"] = customer->lastName;
                response["email"] = customer->email;
                response["phone"] = customer->phone;
                return crow::response(200, response);
            }
            
            crow::json::wvalue response;
            response["error"] = "Customer not found";
            return crow::response(404, response);
        });
    
    CROW_ROUTE(app, "/api/customers")
        .methods("POST"_method)
        ([&customerService](const crow::request& req) {
            auto x = crow::json::load(req.body);
            if (!x) {
                return crow::response(400, "{\"error\":\"Invalid JSON format\"}");
            }
            
            try {
                Customer customer;
                customer.firstName = x["firstName"].s();
                customer.lastName = x["lastName"].s();
                customer.email = x["email"].s();
                customer.phone = x["phone"].s();
                
                int id = customerService.createCustomer(customer);
                
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
                reservationJson["customerId"] = reservation.customerId;
                reservationJson["tableId"] = reservation.tableId;
                reservationJson["date"] = reservation.date;
                reservationJson["startTime"] = reservation.startTime;
                reservationJson["endTime"] = reservation.endTime;
                reservationJson["partySize"] = reservation.partySize;
                reservationJson["status"] = static_cast<int>(reservation.status);
                reservationJson["specialRequests"] = reservation.specialRequests;
                reservationList.push_back(std::move(reservationJson));
            }
            
            response["reservations"] = std::move(reservationList);
            return crow::response(200, response);
        });
    
    CROW_ROUTE(app, "/api/reservations")
        .methods("POST"_method)
        ([&reservationService, &customerService](const crow::request& req) {
            // Log the full request body for debugging
            std::cout << "Received reservation request: " << req.body << std::endl;
            
            auto x = crow::json::load(req.body);
            if (!x) {
                std::cout << "Invalid JSON received" << std::endl;
                return crow::response(400, "{\"error\":\"Invalid JSON format\"}");
            }
            
            try {
                // Log the parsed JSON fields
                std::cout << "JSON parsed successfully" << std::endl;
                
                Reservation reservation;
                
                // Check if customerId is present, if not use a default value of 1
                if (x.has("customerId")) {
                    reservation.customerId = x["customerId"].i();
                    std::cout << "Using provided customerId: " << reservation.customerId << std::endl;
                } else {
                    reservation.customerId = 1; // Default customer ID
                    std::cout << "Using default customerId: 1" << std::endl;
                }
                
                // Check and log each field
                std::cout << "Checking required fields..." << std::endl;
                std::cout << "tableId exists: " << (x.has("tableId") ? "yes" : "no") << std::endl;
                std::cout << "reservationDate exists: " << (x.has("reservationDate") ? "yes" : "no") << std::endl;
                std::cout << "startTime exists: " << (x.has("startTime") ? "yes" : "no") << std::endl;
                std::cout << "endTime exists: " << (x.has("endTime") ? "yes" : "no") << std::endl;
                std::cout << "partySize exists: " << (x.has("partySize") ? "yes" : "no") << std::endl;
                
                // Validate required fields
                std::vector<std::string> missingFields;
                if (!x.has("tableId")) missingFields.push_back("tableId");
                if (!x.has("reservationDate")) missingFields.push_back("reservationDate");
                if (!x.has("startTime")) missingFields.push_back("startTime");
                if (!x.has("endTime")) missingFields.push_back("endTime");
                if (!x.has("partySize")) missingFields.push_back("partySize");
                
                if (!missingFields.empty()) {
                    std::string errorMsg = "Missing required fields: ";
                    for (size_t i = 0; i < missingFields.size(); ++i) {
                        if (i > 0) errorMsg += ", ";
                        errorMsg += missingFields[i];
                    }
                    std::cout << errorMsg << std::endl;
                    
                    crow::json::wvalue error_response;
                    error_response["error"] = errorMsg;
                    return crow::response(400, error_response);
                }
                
                // Extract the values
                reservation.tableId = x["tableId"].i();
                reservation.date = x["reservationDate"].s();
                reservation.startTime = x["startTime"].s();
                reservation.endTime = x["endTime"].s();
                reservation.partySize = x["partySize"].i();
                
                std::cout << "Fields extracted successfully: " 
                          << "tableId=" << reservation.tableId
                          << ", date=" << reservation.date
                          << ", startTime=" << reservation.startTime
                          << ", endTime=" << reservation.endTime
                          << ", partySize=" << reservation.partySize
                          << std::endl;
                
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
                    
                reservation.specialRequests = x.has("specialRequests") 
                    ? std::string(x["specialRequests"].s()) 
                    : std::string("");
                
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
                
                std::cout << "Creating reservation..." << std::endl;
                int id = reservationService.createReservation(reservation);
                
                if (id > 0) {
                    std::cout << "Reservation created with ID: " << id << std::endl;
                    crow::json::wvalue response;
                    response["id"] = id;
                    response["message"] = "Reservation created successfully";
                    return crow::response(201, response);
                }
                
                std::cout << "Failed to create reservation" << std::endl;
                crow::json::wvalue error_response;
                error_response["error"] = "Failed to create reservation";
                return crow::response(500, error_response);
            } catch (const std::exception& e) {
                std::cout << "Exception while creating reservation: " << e.what() << std::endl;
                crow::json::wvalue error_response;
                error_response["error"] = std::string("Error: ") + e.what();
                return crow::response(500, error_response);
            }
        });
    
    // Start the server
    app.port(8080).multithreaded().run();
    
    return 0;
} 