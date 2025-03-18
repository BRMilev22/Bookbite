#include "../../include/services/reservation_service.h"
#include <sstream>
#include <algorithm>

ReservationService::ReservationService(Database& db) : db(db) {}

std::vector<Reservation> ReservationService::getAllReservations() {
    std::vector<Reservation> reservations;
    auto result = db.query("SELECT * FROM reservations");
    
    while (result.next()) {
        Reservation reservation;
        reservation.id = result.get<int>(0);
        reservation.customerId = result.get<int>(1);
        reservation.tableId = result.get<int>(2);
        reservation.date = result.get<std::string>(3);
        reservation.startTime = result.get<std::string>(4);
        reservation.endTime = result.get<std::string>(5);
        reservation.partySize = result.get<int>(6);
        reservation.status = stringToStatus(result.get<std::string>(7));
        reservation.specialRequests = result.get<std::string>(8);
        
        // Get occasion if present
        if (!result.is_null(9)) {
            reservation.occasion = result.get<std::string>(9);
        }
        
        // Parse dietary restrictions from comma-separated string
        if (!result.is_null(10)) {
            std::string restrictionsStr = result.get<std::string>(10);
            reservation.dietaryRestrictions = parseDietaryRestrictions(restrictionsStr);
        }
        
        // Get promo code if present
        if (!result.is_null(11)) {
            reservation.promoCode = result.get<std::string>(11);
        }
        
        // Get price if present
        if (!result.is_null(12)) {
            reservation.price = result.get<double>(12);
        }
        
        reservations.push_back(reservation);
    }
    return reservations;
}

std::optional<Reservation> ReservationService::getReservationById(int id) {
    auto result = db.query("SELECT * FROM reservations WHERE reservation_id = " + std::to_string(id));
    
    if (result.next()) {
        Reservation reservation;
        reservation.id = result.get<int>(0);
        reservation.customerId = result.get<int>(1);
        reservation.tableId = result.get<int>(2);
        reservation.date = result.get<std::string>(3);
        reservation.startTime = result.get<std::string>(4);
        reservation.endTime = result.get<std::string>(5);
        reservation.partySize = result.get<int>(6);
        reservation.status = stringToStatus(result.get<std::string>(7));
        reservation.specialRequests = result.get<std::string>(8);
        
        // Get occasion if present
        if (!result.is_null(9)) {
            reservation.occasion = result.get<std::string>(9);
        }
        
        // Parse dietary restrictions from comma-separated string
        if (!result.is_null(10)) {
            std::string restrictionsStr = result.get<std::string>(10);
            reservation.dietaryRestrictions = parseDietaryRestrictions(restrictionsStr);
        }
        
        // Get promo code if present
        if (!result.is_null(11)) {
            reservation.promoCode = result.get<std::string>(11);
        }
        
        // Get price if present
        if (!result.is_null(12)) {
            reservation.price = result.get<double>(12);
        }
        
        return reservation;
    }
    return std::nullopt;
}

std::vector<Reservation> ReservationService::getReservationsByCustomerId(int customerId) {
    std::vector<Reservation> reservations;
    auto result = db.query("SELECT * FROM reservations WHERE customer_id = " + std::to_string(customerId));
    
    while (result.next()) {
        Reservation reservation;
        reservation.id = result.get<int>(0);
        reservation.customerId = result.get<int>(1);
        reservation.tableId = result.get<int>(2);
        reservation.date = result.get<std::string>(3);
        reservation.startTime = result.get<std::string>(4);
        reservation.endTime = result.get<std::string>(5);
        reservation.partySize = result.get<int>(6);
        reservation.status = stringToStatus(result.get<std::string>(7));
        reservation.specialRequests = result.get<std::string>(8);
        
        // Get occasion if present
        if (!result.is_null(9)) {
            reservation.occasion = result.get<std::string>(9);
        }
        
        // Parse dietary restrictions from comma-separated string
        if (!result.is_null(10)) {
            std::string restrictionsStr = result.get<std::string>(10);
            reservation.dietaryRestrictions = parseDietaryRestrictions(restrictionsStr);
        }
        
        // Get promo code if present
        if (!result.is_null(11)) {
            reservation.promoCode = result.get<std::string>(11);
        }
        
        // Get price if present
        if (!result.is_null(12)) {
            reservation.price = result.get<double>(12);
        }
        
        reservations.push_back(reservation);
    }
    return reservations;
}

int ReservationService::createReservation(const Reservation& reservation) {
    // Create the dietary restrictions string
    std::string dietaryRestrictionsStr = formatDietaryRestrictions(reservation.dietaryRestrictions);
    
    // Start with base reservation data
    std::string sql = "INSERT INTO reservations (customer_id, table_id, reservation_date, "
                     "start_time, end_time, party_size, status, special_requests";
    
    // Add optional fields if present
    if (!reservation.occasion.empty()) {
        sql += ", occasion";
    }
    
    if (!dietaryRestrictionsStr.empty()) {
        sql += ", dietary_restrictions";
    }
    
    if (!reservation.promoCode.empty()) {
        sql += ", promo_code";
    }
    
    // Add price field
    sql += ", price";
    
    sql += ") VALUES (" +
         std::to_string(reservation.customerId) + ", " +
         std::to_string(reservation.tableId) + ", '" +
         reservation.date + "', '" +
         reservation.startTime + "', '" +
         reservation.endTime + "', " +
         std::to_string(reservation.partySize) + ", '" +
         statusToString(reservation.status) + "', '" +
         reservation.specialRequests + "'";
    
    // Add occasion value if present
    if (!reservation.occasion.empty()) {
        sql += ", '" + reservation.occasion + "'";
    }
    
    // Add dietary restrictions value if present
    if (!dietaryRestrictionsStr.empty()) {
        sql += ", '" + dietaryRestrictionsStr + "'";
    }
    
    // Add promo code if present
    if (!reservation.promoCode.empty()) {
        sql += ", '" + reservation.promoCode + "'";
    }
    
    // Add price
    sql += ", " + std::to_string(reservation.price);
    
    sql += ")";
    
    db.execute(sql);
    auto result = db.query("SELECT LAST_INSERT_ID()");
    if (!result.next()) {
        return -1;
    }
    
    return result.get<int>(0);
}

bool ReservationService::updateReservation(const Reservation& reservation) {
    // Create the dietary restrictions string
    std::string dietaryRestrictionsStr = formatDietaryRestrictions(reservation.dietaryRestrictions);
    
    std::string sql = "UPDATE reservations SET customer_id = " + std::to_string(reservation.customerId) +
                     ", table_id = " + std::to_string(reservation.tableId) +
                     ", reservation_date = '" + reservation.date +
                     "', start_time = '" + reservation.startTime +
                     "', end_time = '" + reservation.endTime +
                     "', party_size = " + std::to_string(reservation.partySize) +
                     ", status = '" + statusToString(reservation.status) +
                     "', special_requests = '" + reservation.specialRequests + "'";
    
    // Add occasion
    if (!reservation.occasion.empty()) {
        sql += ", occasion = '" + reservation.occasion + "'";
    } else {
        sql += ", occasion = NULL";
    }
    
    // Add dietary restrictions
    if (!dietaryRestrictionsStr.empty()) {
        sql += ", dietary_restrictions = '" + dietaryRestrictionsStr + "'";
    } else {
        sql += ", dietary_restrictions = NULL";
    }
    
    // Add promo code if present
    if (!reservation.promoCode.empty()) {
        sql += ", promo_code = '" + reservation.promoCode + "'";
    } else {
        sql += ", promo_code = NULL";
    }
    
    // Update price
    sql += ", price = " + std::to_string(reservation.price);
    
    sql += " WHERE reservation_id = " + std::to_string(reservation.id);
    
    try {
        db.execute(sql);
        return true;
    } catch (...) {
        return false;
    }
}

bool ReservationService::deleteReservation(int id) {
    try {
        db.execute("DELETE FROM reservations WHERE reservation_id = " + std::to_string(id));
        return true;
    } catch (...) {
        return false;
    }
}

bool ReservationService::isTableAvailable(int tableId, const std::string& date, 
                                        const std::string& startTime, const std::string& endTime,
                                        int excludeReservationId) {
    std::string sql = "SELECT COUNT(*) FROM reservations WHERE table_id = " + std::to_string(tableId) +
                     " AND reservation_date = '" + date + "' AND status != 'cancelled' ";
    
    // If updating, exclude the current reservation
    if (excludeReservationId > 0) {
        sql += " AND reservation_id != " + std::to_string(excludeReservationId);
    }
    
    sql += " AND ((start_time <= '" + startTime + "' AND end_time > '" + startTime + "') " +
         "OR (start_time < '" + endTime + "' AND end_time >= '" + endTime + "') " +
         "OR (start_time >= '" + startTime + "' AND end_time <= '" + endTime + "'))";
    
    auto result = db.query(sql);
    if (result.next()) {
        return result.get<int>(0) == 0;
    }
    return false;
}

std::vector<std::string> ReservationService::getReservationDietaryRestrictions(int reservationId) {
    auto result = db.query("SELECT dietary_restrictions FROM reservations WHERE reservation_id = " + 
                           std::to_string(reservationId));
    
    if (result.next() && !result.is_null(0)) {
        std::string restrictionsStr = result.get<std::string>(0);
        return parseDietaryRestrictions(restrictionsStr);
    }
    
    return std::vector<std::string>();
}

bool ReservationService::changeReservationStatus(int reservationId, ReservationStatus status) {
    try {
        std::string sql = "UPDATE reservations SET status = '" + statusToString(status) +
                         "' WHERE reservation_id = " + std::to_string(reservationId);
        db.execute(sql);
        return true;
    } catch (...) {
        return false;
    }
}

std::string ReservationService::statusToString(ReservationStatus status) {
    switch (status) {
        case ReservationStatus::Confirmed: return "confirmed";
        case ReservationStatus::Pending: return "pending";
        case ReservationStatus::Cancelled: return "cancelled";
        case ReservationStatus::Completed: return "completed";
        default: return "unknown";
    }
}

ReservationStatus ReservationService::stringToStatus(const std::string& status) {
    if (status == "confirmed") return ReservationStatus::Confirmed;
    if (status == "pending") return ReservationStatus::Pending;
    if (status == "cancelled") return ReservationStatus::Cancelled;
    if (status == "completed") return ReservationStatus::Completed;
    return ReservationStatus::Pending;
}

// Helper method to format dietary restrictions as a comma-separated string
std::string ReservationService::formatDietaryRestrictions(const std::vector<std::string>& restrictions) {
    if (restrictions.empty()) {
        return "";
    }
    
    std::stringstream ss;
    for (size_t i = 0; i < restrictions.size(); ++i) {
        ss << restrictions[i];
        if (i < restrictions.size() - 1) {
            ss << ",";
        }
    }
    return ss.str();
}

// Helper method to parse comma-separated dietary restrictions into a vector
std::vector<std::string> ReservationService::parseDietaryRestrictions(const std::string& restrictionsStr) {
    std::vector<std::string> result;
    std::stringstream ss(restrictionsStr);
    std::string item;
    
    while (std::getline(ss, item, ',')) {
        if (!item.empty()) {
            result.push_back(item);
        }
    }
    
    return result;
} 