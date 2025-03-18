#pragma once

#include <string>
#include <chrono>
#include <vector>

// Simple reservation status enum
enum class ReservationStatus {
    Confirmed,
    Pending,
    Cancelled,
    Completed
};

// Simple reservation data structure
struct Reservation {
    int id = 0;
    int customerId = 0;
    int tableId = 0;
    std::string date;
    std::string startTime;
    std::string endTime;
    int partySize = 0;
    ReservationStatus status = ReservationStatus::Pending;
    std::string specialRequests;
    std::string occasion;  // Now storing occasion directly as text
    std::vector<std::string> dietaryRestrictions; // Now storing dietary restrictions as strings
    std::string promoCode; // Promo code for discount if applicable
    double price = 0.0;    // Price of the reservation in dollars
}; 