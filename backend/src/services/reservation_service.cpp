#include "../../include/services/reservation_service.h"

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
        return reservation;
    }
    return std::nullopt;
}

int ReservationService::createReservation(const Reservation& reservation) {
    std::string sql = "INSERT INTO reservations (customer_id, table_id, reservation_date, "
                     "start_time, end_time, party_size, status, special_requests) VALUES (" +
                     std::to_string(reservation.customerId) + ", " +
                     std::to_string(reservation.tableId) + ", '" +
                     reservation.date + "', '" +
                     reservation.startTime + "', '" +
                     reservation.endTime + "', " +
                     std::to_string(reservation.partySize) + ", '" +
                     statusToString(reservation.status) + "', '" +
                     reservation.specialRequests + "')";
    
    db.execute(sql);
    auto result = db.query("SELECT LAST_INSERT_ID()");
    if (result.next()) {
        return result.get<int>(0);
    }
    return -1;
}

bool ReservationService::updateReservation(const Reservation& reservation) {
    std::string sql = "UPDATE reservations SET customer_id = " + std::to_string(reservation.customerId) +
                     ", table_id = " + std::to_string(reservation.tableId) +
                     ", reservation_date = '" + reservation.date +
                     "', start_time = '" + reservation.startTime +
                     "', end_time = '" + reservation.endTime +
                     "', party_size = " + std::to_string(reservation.partySize) +
                     ", status = '" + statusToString(reservation.status) +
                     "', special_requests = '" + reservation.specialRequests +
                     "' WHERE reservation_id = " + std::to_string(reservation.id);
    
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
                                        const std::string& startTime, const std::string& endTime) {
    std::string sql = "SELECT COUNT(*) FROM reservations WHERE table_id = " + std::to_string(tableId) +
                     " AND reservation_date = '" + date + "' AND status != 'cancelled' " +
                     "AND ((start_time <= '" + startTime + "' AND end_time > '" + startTime + "') " +
                     "OR (start_time < '" + endTime + "' AND end_time >= '" + endTime + "') " +
                     "OR (start_time >= '" + startTime + "' AND end_time <= '" + endTime + "'))";
    
    auto result = db.query(sql);
    if (result.next()) {
        return result.get<int>(0) == 0;
    }
    return false;
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