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
    std::string occasion;  // Occasion directly as text
    std::vector<std::string> dietaryRestrictions; // Dietary restrictions as strings
    std::string promoCode; // Promo code for discount if applicable
    
    // Billing information
    std::string billingAddress;
    std::string postalCode;
    std::string city;
    std::string paymentMethod;
    std::string cardLastFour; // Only store last 4 digits of card for security
    std::string paymentToken; // Store payment processor token instead of full card details
    std::string nameOnCard;
    
    // Contact information
    std::string email;
    std::string phoneNumber;
    
    // Pricing information
    double price = 0.0;    // Total price of the reservation
    double baseFee = 0.0;  // Base reservation fee
    double serviceFee = 0.0; // Service fee
    double personFee = 0.0;  // Additional fee per person
    double discountAmount = 0.0; // Discount amount
    int discountPercentage = 0; // Discount percentage
}; 