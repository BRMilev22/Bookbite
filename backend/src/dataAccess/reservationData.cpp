#include "dataAccess/reservationData.h"
#include <nanodbc/nanodbc.h>
#include <iostream>

ReservationData::ReservationData() {}

std::vector<Reservation> ReservationData::getAllReservations() {
    std::vector<Reservation> reservations;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, R"(
            SELECT r.id, r.user_id, r.table_id, r.restaurant_id, r.date, r.start_time, r.end_time, 
                   r.guest_count, r.status, r.special_requests, r.phone_number, r.email, 
                   r.total_amount, r.payment_status, r.payment_method,
                   rest.name as restaurant_name,
                   CONCAT(u.first_name, ' ', u.last_name) as customer_name
            FROM reservations r
            LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
            LEFT JOIN users u ON r.user_id = u.id
        )");
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Reservation reservation;
            reservation.setId(result.get<int>("id"));
            reservation.setUserId(result.get<int>("user_id"));
            reservation.setTableId(result.get<int>("table_id"));
            reservation.setRestaurantId(result.get<int>("restaurant_id"));
            reservation.setDate(result.get<nanodbc::string>("date", ""));
            reservation.setStartTime(result.get<nanodbc::string>("start_time", ""));
            reservation.setEndTime(result.get<nanodbc::string>("end_time", ""));
            reservation.setGuestCount(result.get<int>("guest_count"));
            reservation.setStatus(result.get<nanodbc::string>("status", ""));
            reservation.setSpecialRequests(result.get<nanodbc::string>("special_requests", ""));
            reservation.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            reservation.setEmail(result.get<nanodbc::string>("email", ""));
            reservation.setTotalAmount(result.get<double>("total_amount", 0.0));
            reservation.setPaymentStatus(result.get<nanodbc::string>("payment_status", ""));
            reservation.setPaymentMethod(result.get<nanodbc::string>("payment_method", ""));
            reservation.setRestaurantName(result.get<nanodbc::string>("restaurant_name", ""));
            reservation.setCustomerName(result.get<nanodbc::string>("customer_name", ""));
            reservations.push_back(reservation);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAllReservations: " << e.what() << std::endl;
    }
    return reservations;
}

std::vector<Reservation> ReservationData::getReservationsByUserId(int userId) {
    std::vector<Reservation> reservations;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, table_id, restaurant_id, date, start_time, end_time, guest_count, status, special_requests, phone_number, email, total_amount, payment_status, payment_method FROM reservations WHERE user_id = ?");
        stmt.bind(0, &userId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Reservation reservation;
            reservation.setId(result.get<int>("id"));
            reservation.setUserId(result.get<int>("user_id"));
            reservation.setTableId(result.get<int>("table_id"));
            reservation.setRestaurantId(result.get<int>("restaurant_id"));
            reservation.setDate(result.get<nanodbc::string>("date", ""));
            reservation.setStartTime(result.get<nanodbc::string>("start_time", ""));
            reservation.setEndTime(result.get<nanodbc::string>("end_time", ""));
            reservation.setGuestCount(result.get<int>("guest_count"));
            reservation.setStatus(result.get<nanodbc::string>("status", ""));
            reservation.setSpecialRequests(result.get<nanodbc::string>("special_requests", ""));
            reservation.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            reservation.setEmail(result.get<nanodbc::string>("email", ""));
            reservation.setTotalAmount(result.get<double>("total_amount", 0.0));
            reservation.setPaymentStatus(result.get<nanodbc::string>("payment_status", ""));
            reservation.setPaymentMethod(result.get<nanodbc::string>("payment_method", ""));
            reservations.push_back(reservation);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReservationsByUserId: " << e.what() << std::endl;
    }
    return reservations;
}

std::vector<Reservation> ReservationData::getReservationsByRestaurantId(int restaurantId) {
    std::vector<Reservation> reservations;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, table_id, restaurant_id, date, start_time, end_time, guest_count, status, special_requests, phone_number, email FROM reservations WHERE restaurant_id = ?");
        stmt.bind(0, &restaurantId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Reservation reservation;
            reservation.setId(result.get<int>("id"));
            reservation.setUserId(result.get<int>("user_id"));
            reservation.setTableId(result.get<int>("table_id"));
            reservation.setRestaurantId(result.get<int>("restaurant_id"));
            reservation.setDate(result.get<nanodbc::string>("date", ""));
            reservation.setStartTime(result.get<nanodbc::string>("start_time", ""));
            reservation.setEndTime(result.get<nanodbc::string>("end_time", ""));
            reservation.setGuestCount(result.get<int>("guest_count"));
            reservation.setStatus(result.get<nanodbc::string>("status", ""));
            reservation.setSpecialRequests(result.get<nanodbc::string>("special_requests", ""));
            reservation.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            reservation.setEmail(result.get<nanodbc::string>("email", ""));
            reservations.push_back(reservation);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReservationsByRestaurantId: " << e.what() << std::endl;
    }
    return reservations;
}

std::vector<Reservation> ReservationData::getReservationsByTableId(int tableId) {
    std::vector<Reservation> reservations;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, table_id, restaurant_id, date, start_time, end_time, guest_count, status, special_requests, phone_number, email FROM reservations WHERE table_id = ?");
        stmt.bind(0, &tableId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Reservation reservation;
            reservation.setId(result.get<int>("id"));
            reservation.setUserId(result.get<int>("user_id"));
            reservation.setTableId(result.get<int>("table_id"));
            reservation.setRestaurantId(result.get<int>("restaurant_id"));
            reservation.setDate(result.get<nanodbc::string>("date", ""));
            reservation.setStartTime(result.get<nanodbc::string>("start_time", ""));
            reservation.setEndTime(result.get<nanodbc::string>("end_time", ""));
            reservation.setGuestCount(result.get<int>("guest_count"));
            reservation.setStatus(result.get<nanodbc::string>("status", ""));
            reservation.setSpecialRequests(result.get<nanodbc::string>("special_requests", ""));
            reservation.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            reservation.setEmail(result.get<nanodbc::string>("email", ""));
            reservations.push_back(reservation);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReservationsByTableId: " << e.what() << std::endl;
    }
    return reservations;
}

std::optional<Reservation> ReservationData::getReservationById(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, table_id, restaurant_id, date, start_time, end_time, guest_count, status, special_requests, phone_number, email FROM reservations WHERE id = ?");
        stmt.bind(0, &id);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            Reservation reservation;
            reservation.setId(result.get<int>("id"));
            reservation.setUserId(result.get<int>("user_id"));
            reservation.setTableId(result.get<int>("table_id"));
            reservation.setRestaurantId(result.get<int>("restaurant_id"));
            reservation.setDate(result.get<nanodbc::string>("date", ""));
            reservation.setStartTime(result.get<nanodbc::string>("start_time", ""));
            reservation.setEndTime(result.get<nanodbc::string>("end_time", ""));
            reservation.setGuestCount(result.get<int>("guest_count"));
            reservation.setStatus(result.get<nanodbc::string>("status", ""));
            reservation.setSpecialRequests(result.get<nanodbc::string>("special_requests", ""));
            reservation.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            reservation.setEmail(result.get<nanodbc::string>("email", ""));
            return reservation;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReservationById: " << e.what() << std::endl;
    }
    return std::nullopt;
}

std::optional<Reservation> ReservationData::getReservationByIdWithDetails(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, R"(
            SELECT r.id, r.user_id, r.table_id, r.restaurant_id, r.date, r.start_time, r.end_time, 
                   r.guest_count, r.status, r.special_requests, r.phone_number, r.email,
                   r.total_amount, r.payment_status, r.payment_method,
                   rest.name as restaurant_name,
                   CONCAT(u.first_name, ' ', u.last_name) as customer_name
            FROM reservations r
            LEFT JOIN restaurants rest ON r.restaurant_id = rest.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        )");
        stmt.bind(0, &id);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            Reservation reservation;
            reservation.setId(result.get<int>("id"));
            reservation.setUserId(result.get<int>("user_id"));
            reservation.setTableId(result.get<int>("table_id"));
            reservation.setRestaurantId(result.get<int>("restaurant_id"));
            reservation.setDate(result.get<nanodbc::string>("date", ""));
            reservation.setStartTime(result.get<nanodbc::string>("start_time", ""));
            reservation.setEndTime(result.get<nanodbc::string>("end_time", ""));
            reservation.setGuestCount(result.get<int>("guest_count"));
            reservation.setStatus(result.get<nanodbc::string>("status", ""));
            reservation.setSpecialRequests(result.get<nanodbc::string>("special_requests", ""));
            reservation.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            reservation.setEmail(result.get<nanodbc::string>("email", ""));
            reservation.setTotalAmount(result.get<double>("total_amount", 0.0));
            reservation.setPaymentStatus(result.get<nanodbc::string>("payment_status", ""));
            reservation.setPaymentMethod(result.get<nanodbc::string>("payment_method", ""));
            reservation.setRestaurantName(result.get<nanodbc::string>("restaurant_name", ""));
            reservation.setCustomerName(result.get<nanodbc::string>("customer_name", ""));
            return reservation;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReservationByIdWithDetails: " << e.what() << std::endl;
    }
    return std::nullopt;
}

bool ReservationData::addReservation(const Reservation& reservation) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "INSERT INTO reservations (user_id, table_id, restaurant_id, date, start_time, end_time, guest_count, status, special_requests, phone_number, email, total_amount, payment_status, payment_method, confirmation_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        int userId = reservation.getUserId();
        int tableId = reservation.getTableId();
        int restaurantId = reservation.getRestaurantId();
        std::string date = reservation.getDate();
        std::string startTime = reservation.getStartTime();
        std::string endTime = reservation.getEndTime();
        int guestCount = reservation.getGuestCount();
        std::string status = reservation.getStatus();
        std::string specialRequests = reservation.getSpecialRequests();
        std::string phoneNumber = reservation.getPhoneNumber();
        std::string email = reservation.getEmail();
        double totalAmount = reservation.getTotalAmount();
        std::string paymentStatus = reservation.getPaymentStatus();
        std::string paymentMethod = reservation.getPaymentMethod();
        std::string confirmationToken = reservation.getConfirmationToken();
        
        stmt.bind(0, &userId);
        stmt.bind(1, &tableId);
        stmt.bind(2, &restaurantId);
        stmt.bind(3, date.c_str());
        stmt.bind(4, startTime.c_str());
        stmt.bind(5, endTime.c_str());
        stmt.bind(6, &guestCount);
        stmt.bind(7, status.c_str());
        stmt.bind(8, specialRequests.c_str());
        stmt.bind(9, phoneNumber.c_str());
        stmt.bind(10, email.c_str());
        stmt.bind(11, &totalAmount);
        stmt.bind(12, paymentStatus.c_str());
        stmt.bind(13, paymentMethod.c_str());
        stmt.bind(14, confirmationToken.c_str());
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in addReservation: " << e.what() << std::endl;
        return false;
    }
}

bool ReservationData::updateReservation(const Reservation& reservation) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE reservations SET user_id = ?, table_id = ?, restaurant_id = ?, date = ?, start_time = ?, end_time = ?, guest_count = ?, status = ?, special_requests = ?, phone_number = ?, email = ?, total_amount = ?, payment_status = ?, payment_method = ? WHERE id = ?");
        
        int userId = reservation.getUserId();
        int tableId = reservation.getTableId();
        int restaurantId = reservation.getRestaurantId();
        std::string date = reservation.getDate();
        std::string startTime = reservation.getStartTime();
        std::string endTime = reservation.getEndTime();
        int guestCount = reservation.getGuestCount();
        std::string status = reservation.getStatus();
        std::string specialRequests = reservation.getSpecialRequests();
        std::string phoneNumber = reservation.getPhoneNumber();
        std::string email = reservation.getEmail();
        double totalAmount = reservation.getTotalAmount();
        std::string paymentStatus = reservation.getPaymentStatus();
        std::string paymentMethod = reservation.getPaymentMethod();
        int id = reservation.getId();
        
        stmt.bind(0, &userId);
        stmt.bind(1, &tableId);
        stmt.bind(2, &restaurantId);
        stmt.bind(3, date.c_str());
        stmt.bind(4, startTime.c_str());
        stmt.bind(5, endTime.c_str());
        stmt.bind(6, &guestCount);
        stmt.bind(7, status.c_str());
        stmt.bind(8, specialRequests.c_str());
        stmt.bind(9, phoneNumber.c_str());
        stmt.bind(10, email.c_str());
        stmt.bind(11, &totalAmount);
        stmt.bind(12, paymentStatus.c_str());
        stmt.bind(13, paymentMethod.c_str());
        stmt.bind(14, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateReservation: " << e.what() << std::endl;
        return false;
    }
}

bool ReservationData::deleteReservation(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "DELETE FROM reservations WHERE id = ?");
        
        stmt.bind(0, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in deleteReservation: " << e.what() << std::endl;
        return false;
    }
}

bool ReservationData::updateReservationStatus(int id, const std::string& status) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE reservations SET status = ? WHERE id = ?");
        
        stmt.bind(0, status.c_str());
        stmt.bind(1, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateReservationStatus: " << e.what() << std::endl;
        return false;
    }
}

bool ReservationData::isTableAvailable(int tableId, const std::string& date, const std::string& startTime, const std::string& endTime, int excludeReservationId) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        
        std::string query = "SELECT COUNT(*) as conflict_count FROM reservations WHERE table_id = ? AND date = ? AND status != 'cancelled' AND "
                           "((start_time < ? AND end_time > ?) OR "
                           " (start_time < ? AND end_time > ?) OR "
                           " (start_time >= ? AND end_time <= ?))";
        
        if (excludeReservationId > 0) {
            query += " AND id != ?";
        }
        
        nanodbc::prepare(stmt, query);
        
        stmt.bind(0, &tableId);
        stmt.bind(1, date.c_str());
        stmt.bind(2, startTime.c_str());
        stmt.bind(3, startTime.c_str());
        stmt.bind(4, endTime.c_str());
        stmt.bind(5, endTime.c_str());
        stmt.bind(6, startTime.c_str());
        stmt.bind(7, endTime.c_str());
        
        if (excludeReservationId > 0) {
            stmt.bind(8, &excludeReservationId);
        }
        
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            int conflictCount = result.get<int>("conflict_count");
            return conflictCount == 0;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in isTableAvailable: " << e.what() << std::endl;
    }
    return false;
}

std::vector<int> ReservationData::getAvailableTableIds(int restaurantId, const std::string& date, const std::string& startTime, const std::string& endTime, int minCapacity) {
    std::vector<int> availableTableIds;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        
        std::string query = "SELECT t.id FROM tables t WHERE t.restaurant_id = ?";
        
        if (minCapacity > 0) {
            query += " AND t.capacity >= ?";
        }
        
        query += " AND t.id NOT IN ("
                 "SELECT DISTINCT r.table_id FROM reservations r "
                 "WHERE r.date = ? AND r.status != 'cancelled' AND "
                 "((r.start_time < ? AND r.end_time > ?) OR "  // Reservation spans over new start time
                 " (r.start_time < ? AND r.end_time > ?) OR "  // Reservation spans over new end time
                 " (r.start_time >= ? AND r.end_time <= ?))"   // Reservation is within new time range
                 ")";
        
        nanodbc::prepare(stmt, query);
        
        int paramIndex = 0;
        stmt.bind(paramIndex++, &restaurantId);
        
        if (minCapacity > 0) {
            stmt.bind(paramIndex++, &minCapacity);
        }
        
        stmt.bind(paramIndex++, date.c_str());
        stmt.bind(paramIndex++, startTime.c_str());
        stmt.bind(paramIndex++, startTime.c_str());
        stmt.bind(paramIndex++, endTime.c_str());
        stmt.bind(paramIndex++, endTime.c_str());
        stmt.bind(paramIndex++, startTime.c_str());
        stmt.bind(paramIndex++, endTime.c_str());
        
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            availableTableIds.push_back(result.get<int>("id"));
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAvailableTableIds: " << e.what() << std::endl;
    }
    return availableTableIds;
}

std::optional<Reservation> ReservationData::getReservationByConfirmationToken(const std::string& token) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, user_id, table_id, restaurant_id, date, start_time, end_time, guest_count, status, special_requests, phone_number, email, total_amount, payment_status, payment_method, confirmation_token FROM reservations WHERE confirmation_token = ?");
        stmt.bind(0, token.c_str());
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            Reservation reservation;
            reservation.setId(result.get<int>("id"));
            reservation.setUserId(result.get<int>("user_id"));
            reservation.setTableId(result.get<int>("table_id"));
            reservation.setRestaurantId(result.get<int>("restaurant_id"));
            reservation.setDate(result.get<nanodbc::string>("date", ""));
            reservation.setStartTime(result.get<nanodbc::string>("start_time", ""));
            reservation.setEndTime(result.get<nanodbc::string>("end_time", ""));
            reservation.setGuestCount(result.get<int>("guest_count"));
            reservation.setStatus(result.get<nanodbc::string>("status", ""));
            reservation.setSpecialRequests(result.get<nanodbc::string>("special_requests", ""));
            reservation.setPhoneNumber(result.get<nanodbc::string>("phone_number", ""));
            reservation.setEmail(result.get<nanodbc::string>("email", ""));
            reservation.setTotalAmount(result.get<double>("total_amount", 0.0));
            reservation.setPaymentStatus(result.get<nanodbc::string>("payment_status", ""));
            reservation.setPaymentMethod(result.get<nanodbc::string>("payment_method", ""));
            return reservation;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getReservationByConfirmationToken: " << e.what() << std::endl;
    }
    return std::nullopt;
}

bool ReservationData::updateReservationConfirmationToken(int id, const std::string& token) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE reservations SET confirmation_token = ? WHERE id = ?");
        
        stmt.bind(0, token.c_str());
        stmt.bind(1, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateReservationConfirmationToken: " << e.what() << std::endl;
        return false;
    }
}

bool ReservationData::confirmReservation(const std::string& token) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE reservations SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP, confirmation_token = NULL WHERE confirmation_token = ? AND status = 'pending'");
        
        stmt.bind(0, token.c_str());
        
        nanodbc::result result = nanodbc::execute(stmt);
        return result.affected_rows() > 0;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in confirmReservation: " << e.what() << std::endl;
        return false;
    }
}
