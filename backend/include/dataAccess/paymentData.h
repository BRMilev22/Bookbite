#ifndef PAYMENT_DATA_H
#define PAYMENT_DATA_H

#include "models/payment.h"
#include "utils/dbConnection.h"
#include <vector>
#include <optional>

class PaymentData {
public:
    PaymentData();
    std::vector<Payment> getAllPayments();
    std::vector<Payment> getPaymentsByUserId(int userId);
    std::vector<Payment> getPaymentsByReservationId(int reservationId);
    std::optional<Payment> getPaymentById(int id);
    bool addPayment(const Payment& payment);
    bool updatePayment(const Payment& payment);
    bool updatePaymentStatus(int id, const std::string& status);
    bool deletePayment(int id);

private:
    DbConnection dbConnection;
};

#endif // PAYMENT_DATA_H
