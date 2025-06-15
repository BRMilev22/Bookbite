#include "dataAccess/paymentData.h"
#include <nanodbc/nanodbc.h>
#include <iostream>

PaymentData::PaymentData() {}

std::vector<Payment> PaymentData::getAllPayments() {
    std::vector<Payment> payments;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, reservation_id, user_id, amount, payment_method, payment_status, transaction_id, card_last_four, card_type, cardholder_name, billing_address, created_at, updated_at FROM payments");
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Payment payment;
            payment.setId(result.get<int>("id"));
            payment.setReservationId(result.get<int>("reservation_id"));
            payment.setUserId(result.get<int>("user_id"));
            payment.setAmount(result.get<double>("amount", 0.0));
            payment.setPaymentMethod(result.get<nanodbc::string>("payment_method", ""));
            payment.setPaymentStatus(result.get<nanodbc::string>("payment_status", ""));
            payment.setTransactionId(result.get<nanodbc::string>("transaction_id", ""));
            payment.setCardLastFour(result.get<nanodbc::string>("card_last_four", ""));
            payment.setCardType(result.get<nanodbc::string>("card_type", ""));
            payment.setCardholderName(result.get<nanodbc::string>("cardholder_name", ""));
            payment.setBillingAddress(result.get<nanodbc::string>("billing_address", ""));
            payment.setCreatedAt(result.get<nanodbc::string>("created_at", ""));
            payment.setUpdatedAt(result.get<nanodbc::string>("updated_at", ""));
            payments.push_back(payment);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getAllPayments: " << e.what() << std::endl;
    }
    return payments;
}

std::vector<Payment> PaymentData::getPaymentsByUserId(int userId) {
    std::vector<Payment> payments;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, reservation_id, user_id, amount, payment_method, payment_status, transaction_id, card_last_four, card_type, cardholder_name, billing_address, created_at, updated_at FROM payments WHERE user_id = ?");
        stmt.bind(0, &userId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Payment payment;
            payment.setId(result.get<int>("id"));
            payment.setReservationId(result.get<int>("reservation_id"));
            payment.setUserId(result.get<int>("user_id"));
            payment.setAmount(result.get<double>("amount", 0.0));
            payment.setPaymentMethod(result.get<nanodbc::string>("payment_method", ""));
            payment.setPaymentStatus(result.get<nanodbc::string>("payment_status", ""));
            payment.setTransactionId(result.get<nanodbc::string>("transaction_id", ""));
            payment.setCardLastFour(result.get<nanodbc::string>("card_last_four", ""));
            payment.setCardType(result.get<nanodbc::string>("card_type", ""));
            payment.setCardholderName(result.get<nanodbc::string>("cardholder_name", ""));
            payment.setBillingAddress(result.get<nanodbc::string>("billing_address", ""));
            payment.setCreatedAt(result.get<nanodbc::string>("created_at", ""));
            payment.setUpdatedAt(result.get<nanodbc::string>("updated_at", ""));
            payments.push_back(payment);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getPaymentsByUserId: " << e.what() << std::endl;
    }
    return payments;
}

std::vector<Payment> PaymentData::getPaymentsByReservationId(int reservationId) {
    std::vector<Payment> payments;
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, reservation_id, user_id, amount, payment_method, payment_status, transaction_id, card_last_four, card_type, cardholder_name, billing_address, created_at, updated_at FROM payments WHERE reservation_id = ?");
        stmt.bind(0, &reservationId);
        nanodbc::result result = nanodbc::execute(stmt);
        
        while (result.next()) {
            Payment payment;
            payment.setId(result.get<int>("id"));
            payment.setReservationId(result.get<int>("reservation_id"));
            payment.setUserId(result.get<int>("user_id"));
            payment.setAmount(result.get<double>("amount", 0.0));
            payment.setPaymentMethod(result.get<nanodbc::string>("payment_method", ""));
            payment.setPaymentStatus(result.get<nanodbc::string>("payment_status", ""));
            payment.setTransactionId(result.get<nanodbc::string>("transaction_id", ""));
            payment.setCardLastFour(result.get<nanodbc::string>("card_last_four", ""));
            payment.setCardType(result.get<nanodbc::string>("card_type", ""));
            payment.setCardholderName(result.get<nanodbc::string>("cardholder_name", ""));
            payment.setBillingAddress(result.get<nanodbc::string>("billing_address", ""));
            payment.setCreatedAt(result.get<nanodbc::string>("created_at", ""));
            payment.setUpdatedAt(result.get<nanodbc::string>("updated_at", ""));
            payments.push_back(payment);
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getPaymentsByReservationId: " << e.what() << std::endl;
    }
    return payments;
}

std::optional<Payment> PaymentData::getPaymentById(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "SELECT id, reservation_id, user_id, amount, payment_method, payment_status, transaction_id, card_last_four, card_type, cardholder_name, billing_address, created_at, updated_at FROM payments WHERE id = ?");
        stmt.bind(0, &id);
        nanodbc::result result = nanodbc::execute(stmt);
        
        if (result.next()) {
            Payment payment;
            payment.setId(result.get<int>("id"));
            payment.setReservationId(result.get<int>("reservation_id"));
            payment.setUserId(result.get<int>("user_id"));
            payment.setAmount(result.get<double>("amount", 0.0));
            payment.setPaymentMethod(result.get<nanodbc::string>("payment_method", ""));
            payment.setPaymentStatus(result.get<nanodbc::string>("payment_status", ""));
            payment.setTransactionId(result.get<nanodbc::string>("transaction_id", ""));
            payment.setCardLastFour(result.get<nanodbc::string>("card_last_four", ""));
            payment.setCardType(result.get<nanodbc::string>("card_type", ""));
            payment.setCardholderName(result.get<nanodbc::string>("cardholder_name", ""));
            payment.setBillingAddress(result.get<nanodbc::string>("billing_address", ""));
            payment.setCreatedAt(result.get<nanodbc::string>("created_at", ""));
            payment.setUpdatedAt(result.get<nanodbc::string>("updated_at", ""));
            return payment;
        }
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in getPaymentById: " << e.what() << std::endl;
    }
    return std::nullopt;
}

bool PaymentData::addPayment(const Payment& payment) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "INSERT INTO payments (reservation_id, user_id, amount, payment_method, payment_status, transaction_id, card_last_four, card_type, cardholder_name, billing_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        int reservationId = payment.getReservationId();
        int userId = payment.getUserId();
        double amount = payment.getAmount();
        std::string paymentMethod = payment.getPaymentMethod();
        std::string paymentStatus = payment.getPaymentStatus();
        std::string transactionId = payment.getTransactionId();
        std::string cardLastFour = payment.getCardLastFour();
        std::string cardType = payment.getCardType();
        std::string cardholderName = payment.getCardholderName();
        std::string billingAddress = payment.getBillingAddress();
        
        stmt.bind(0, &reservationId);
        stmt.bind(1, &userId);
        stmt.bind(2, &amount);
        stmt.bind(3, paymentMethod.c_str());
        stmt.bind(4, paymentStatus.c_str());
        stmt.bind(5, transactionId.c_str());
        stmt.bind(6, cardLastFour.c_str());
        stmt.bind(7, cardType.c_str());
        stmt.bind(8, cardholderName.c_str());
        stmt.bind(9, billingAddress.c_str());
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in addPayment: " << e.what() << std::endl;
        return false;
    }
}

bool PaymentData::updatePayment(const Payment& payment) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE payments SET reservation_id = ?, user_id = ?, amount = ?, payment_method = ?, payment_status = ?, transaction_id = ?, card_last_four = ?, card_type = ?, cardholder_name = ?, billing_address = ? WHERE id = ?");
        
        int reservationId = payment.getReservationId();
        int userId = payment.getUserId();
        double amount = payment.getAmount();
        std::string paymentMethod = payment.getPaymentMethod();
        std::string paymentStatus = payment.getPaymentStatus();
        std::string transactionId = payment.getTransactionId();
        std::string cardLastFour = payment.getCardLastFour();
        std::string cardType = payment.getCardType();
        std::string cardholderName = payment.getCardholderName();
        std::string billingAddress = payment.getBillingAddress();
        int id = payment.getId();
        
        stmt.bind(0, &reservationId);
        stmt.bind(1, &userId);
        stmt.bind(2, &amount);
        stmt.bind(3, paymentMethod.c_str());
        stmt.bind(4, paymentStatus.c_str());
        stmt.bind(5, transactionId.c_str());
        stmt.bind(6, cardLastFour.c_str());
        stmt.bind(7, cardType.c_str());
        stmt.bind(8, cardholderName.c_str());
        stmt.bind(9, billingAddress.c_str());
        stmt.bind(10, &id);
        
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updatePayment: " << e.what() << std::endl;
        return false;
    }
}

bool PaymentData::updatePaymentStatus(int id, const std::string& status) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "UPDATE payments SET payment_status = ? WHERE id = ?");
        stmt.bind(0, status.c_str());
        stmt.bind(1, &id);
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in updatePaymentStatus: " << e.what() << std::endl;
        return false;
    }
}

bool PaymentData::deletePayment(int id) {
    try {
        nanodbc::connection conn = dbConnection.getConnection();
        nanodbc::statement stmt(conn);
        nanodbc::prepare(stmt, "DELETE FROM payments WHERE id = ?");
        stmt.bind(0, &id);
        nanodbc::execute(stmt);
        return true;
    } catch (const nanodbc::database_error& e) {
        std::cerr << "Database error in deletePayment: " << e.what() << std::endl;
        return false;
    }
}
