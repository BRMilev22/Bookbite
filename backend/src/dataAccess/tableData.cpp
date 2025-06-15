#include "dataAccess/tableData.h"
#include <nanodbc/nanodbc.h>
#include <iostream>

TableData::TableData() {}

std::vector<Table> TableData::getAllTables() {
    std::vector<Table> tables;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, restaurant_id, seat_count, is_available FROM tables");
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Table table;
            table.setId(result.get<int>("id"));
            table.setRestaurantId(result.get<int>("restaurant_id"));
            table.setSeatCount(result.get<int>("seat_count"));
            table.setIsAvailable(result.get<int>("is_available") != 0);  // Convert int to bool
            tables.push_back(table);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAllTables: " << e.what() << std::endl;
    }
    return tables;
}

std::vector<Table> TableData::getTablesByRestaurantId(int restaurantId) {
    std::vector<Table> tables;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, restaurant_id, seat_count, is_available FROM tables WHERE restaurant_id = ?");
        stmt.bind(0, &restaurantId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Table table;
            table.setId(result.get<int>("id"));
            table.setRestaurantId(result.get<int>("restaurant_id"));
            table.setSeatCount(result.get<int>("seat_count"));
            table.setIsAvailable(result.get<int>("is_available") != 0);  // Convert int to bool
            tables.push_back(table);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getTablesByRestaurantId: " << e.what() << std::endl;
    }
    return tables;
}

std::vector<Table> TableData::getAvailableTablesByRestaurantId(int restaurantId) {
    std::vector<Table> tables;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        // Return all tables for the restaurant since availability is now time-based
        nanodbc::prepare(stmt, "SELECT id, restaurant_id, seat_count, is_available FROM tables WHERE restaurant_id = ?");
        stmt.bind(0, &restaurantId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Table table;
            table.setId(result.get<int>("id"));
            table.setRestaurantId(result.get<int>("restaurant_id"));
            table.setSeatCount(result.get<int>("seat_count"));
            // Set all tables as available since we now use time-based availability checking
            table.setIsAvailable(true);
            tables.push_back(table);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAvailableTablesByRestaurantId: " << e.what() << std::endl;
    }
    return tables;
}

std::optional<Table> TableData::getTableById(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, restaurant_id, seat_count, is_available FROM tables WHERE id = ?");
        stmt.bind(0, &id);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            Table table;
            table.setId(result.get<int>("id"));
            table.setRestaurantId(result.get<int>("restaurant_id"));
            table.setSeatCount(result.get<int>("seat_count"));
            table.setIsAvailable(result.get<int>("is_available") != 0);  // Convert int to bool
            return table;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getTableById: " << e.what() << std::endl;
    }
    return std::nullopt;
}

bool TableData::addTable(const Table& table) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "INSERT INTO tables (restaurant_id, seat_count, is_available) VALUES (?, ?, ?)");
        
        int restaurantId = table.getRestaurantId();
        int seatCount = table.getSeatCount();
        int isAvailable = table.getIsAvailable() ? 1 : 0;  // Convert bool to int
        
        stmt.bind(0, &restaurantId);
        stmt.bind(1, &seatCount);
        stmt.bind(2, &isAvailable);
        
        nanodbc::execute(stmt);
        
        // Update the table_count in the restaurants table
        nanodbc::statement countStmt(conn);
        nanodbc::prepare(countStmt, "SELECT COUNT(*) FROM tables WHERE restaurant_id = ?");
        countStmt.bind(0, &restaurantId);
        nanodbc::result countResult = nanodbc::execute(countStmt);
        
        if (countResult.next()) {
            int tableCount = countResult.get<int>(0);
            nanodbc::statement updateStmt(conn);
            nanodbc::prepare(updateStmt, "UPDATE restaurants SET table_count = ? WHERE id = ?");
            updateStmt.bind(0, &tableCount);
            updateStmt.bind(1, &restaurantId);
            nanodbc::execute(updateStmt);
        }
        
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in addTable: " << e.what() << std::endl;
        return false;
    }
}

bool TableData::updateTable(const Table& table) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE tables SET restaurant_id = ?, seat_count = ?, is_available = ? WHERE id = ?");
        
        int restaurantId = table.getRestaurantId();
        int seatCount = table.getSeatCount();
        int isAvailable = table.getIsAvailable() ? 1 : 0;  // Convert bool to int
        int id = table.getId();
        
        stmt.bind(0, &restaurantId);
        stmt.bind(1, &seatCount);
        stmt.bind(2, &isAvailable);
        stmt.bind(3, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateTable: " << e.what() << std::endl;
        return false;
    }
}

bool TableData::deleteTable(int id) {
    try {
        // First, get the restaurant ID for this table
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement getRestaurantIdStmt(conn);
        nanodbc::prepare(getRestaurantIdStmt, "SELECT restaurant_id FROM tables WHERE id = ?");
        getRestaurantIdStmt.bind(0, &id);
        nanodbc::result getRestaurantIdResult = nanodbc::execute(getRestaurantIdStmt);
        
        int restaurantId = 0;
        if (getRestaurantIdResult.next()) {
            restaurantId = getRestaurantIdResult.get<int>("restaurant_id");
        }
        
        // Now delete the table
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "DELETE FROM tables WHERE id = ?");
        stmt.bind(0, &id);
        nanodbc::execute(stmt);
        
        // If we have a valid restaurant ID, update the table_count in the restaurants table
        if (restaurantId > 0) {
            nanodbc::statement countStmt(conn);
            nanodbc::prepare(countStmt, "SELECT COUNT(*) FROM tables WHERE restaurant_id = ?");
            countStmt.bind(0, &restaurantId);
            nanodbc::result countResult = nanodbc::execute(countStmt);
            
            if (countResult.next()) {
                int tableCount = countResult.get<int>(0);
                nanodbc::statement updateStmt(conn);
                nanodbc::prepare(updateStmt, "UPDATE restaurants SET table_count = ? WHERE id = ?");
                updateStmt.bind(0, &tableCount);
                updateStmt.bind(1, &restaurantId);
                nanodbc::execute(updateStmt);
            }
        }
        
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in deleteTable: " << e.what() << std::endl;
        return false;
    }
}

bool TableData::updateTableAvailability(int id, bool isAvailable) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE tables SET is_available = ? WHERE id = ?");
        
        int isAvailableInt = isAvailable ? 1 : 0;  // Convert bool to int
        
        stmt.bind(0, &isAvailableInt);
        stmt.bind(1, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updateTableAvailability: " << e.what() << std::endl;
        return false;
    }
}

std::vector<Table> TableData::getTablesWithReservationsByRestaurantId(int restaurantId) {
    std::vector<Table> tables;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        
        // First get all tables for the restaurant
        nanodbc::statement tableStmt(conn);
        nanodbc::prepare(tableStmt, "SELECT id, restaurant_id, seat_count, is_available FROM tables WHERE restaurant_id = ?");
        tableStmt.bind(0, &restaurantId);
        nanodbc::result tableResult = nanodbc::execute(tableStmt);
        
        while (tableResult.next()) {
            Table table;
            int tableId = tableResult.get<int>("id");
            table.setId(tableId);
            table.setRestaurantId(tableResult.get<int>("restaurant_id"));
            table.setSeatCount(tableResult.get<int>("seat_count"));
            // Set all tables as available for booking
            table.setIsAvailable(true);
            
            // Now get current and upcoming reservations for this table
            nanodbc::statement reservationStmt(conn);
            nanodbc::prepare(reservationStmt, 
                "SELECT id, date, start_time, end_time, status, guest_count FROM reservations "
                "WHERE table_id = ? AND status != 'cancelled' AND date >= CURDATE() "
                "ORDER BY date, start_time");
            reservationStmt.bind(0, &tableId);
            nanodbc::result reservationResult = nanodbc::execute(reservationStmt);
            
            std::vector<ReservationInfo> reservations;
            while (reservationResult.next()) {
                ReservationInfo reservation;
                reservation.id = reservationResult.get<int>("id");
                reservation.date = reservationResult.get<nanodbc::string>("date", "");
                reservation.startTime = reservationResult.get<nanodbc::string>("start_time", "");
                reservation.endTime = reservationResult.get<nanodbc::string>("end_time", "");
                reservation.status = reservationResult.get<nanodbc::string>("status", "");
                reservation.guestCount = reservationResult.get<int>("guest_count");
                reservations.push_back(reservation);
            }
            
            table.setReservations(reservations);
            tables.push_back(table);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getTablesWithReservationsByRestaurantId: " << e.what() << std::endl;
    }
    return tables;
}
