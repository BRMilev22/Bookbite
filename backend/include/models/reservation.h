#pragma once

#include <string>
#include <chrono>

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
}; 