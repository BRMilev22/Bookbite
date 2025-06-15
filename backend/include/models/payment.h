#ifndef PAYMENT_H
#define PAYMENT_H

#include <string>

class Payment {
public:
    Payment();
    Payment(int id, int reservationId, int userId, double amount, 
            const std::string& paymentMethod, const std::string& paymentStatus);
    
    int getId() const;
    int getReservationId() const;
    int getUserId() const;
    double getAmount() const;
    std::string getPaymentMethod() const;
    std::string getPaymentStatus() const;
    std::string getTransactionId() const;
    std::string getCardLastFour() const;
    std::string getCardType() const;
    std::string getCardholderName() const;
    std::string getBillingAddress() const;
    std::string getCreatedAt() const;
    std::string getUpdatedAt() const;
    
    void setId(int id);
    void setReservationId(int reservationId);
    void setUserId(int userId);
    void setAmount(double amount);
    void setPaymentMethod(const std::string& paymentMethod);
    void setPaymentStatus(const std::string& paymentStatus);
    void setTransactionId(const std::string& transactionId);
    void setCardLastFour(const std::string& cardLastFour);
    void setCardType(const std::string& cardType);
    void setCardholderName(const std::string& cardholderName);
    void setBillingAddress(const std::string& billingAddress);
    void setCreatedAt(const std::string& createdAt);
    void setUpdatedAt(const std::string& updatedAt);

private:
    int id;
    int reservationId;
    int userId;
    double amount;
    std::string paymentMethod; // "card", "cash"
    std::string paymentStatus; // "pending", "completed", "failed", "refunded"
    std::string transactionId;
    std::string cardLastFour;
    std::string cardType;
    std::string cardholderName;
    std::string billingAddress;
    std::string createdAt;
    std::string updatedAt;
};

#endif // PAYMENT_H