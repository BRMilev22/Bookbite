#ifndef RESERVATION_H
#define RESERVATION_H

#include <string>

class Reservation {
public:
    Reservation();
    Reservation(int id, int userId, int tableId, int restaurantId, 
                const std::string& date, const std::string& startTime, const std::string& endTime, 
                int guestCount, const std::string& status);
    
    int getId() const;
    int getUserId() const;
    int getTableId() const;
    int getRestaurantId() const;
    std::string getDate() const;
    std::string getStartTime() const;
    std::string getEndTime() const;
    int getGuestCount() const;
    std::string getStatus() const;
    std::string getSpecialRequests() const;
    std::string getPhoneNumber() const;
    std::string getEmail() const;
    double getTotalAmount() const;
    std::string getPaymentStatus() const;
    std::string getPaymentMethod() const;
    std::string getConfirmationToken() const;
    
    void setId(int id);
    void setUserId(int userId);
    void setTableId(int tableId);
    void setRestaurantId(int restaurantId);
    void setDate(const std::string& date);
    void setStartTime(const std::string& startTime);
    void setEndTime(const std::string& endTime);
    void setGuestCount(int guestCount);
    void setStatus(const std::string& status);
    void setSpecialRequests(const std::string& specialRequests);
    void setPhoneNumber(const std::string& phoneNumber);
    void setEmail(const std::string& email);
    void setTotalAmount(double totalAmount);
    void setPaymentStatus(const std::string& paymentStatus);
    void setPaymentMethod(const std::string& paymentMethod);
    void setConfirmationToken(const std::string& confirmationToken);

private:
    int id;
    int userId;
    int tableId;
    int restaurantId;
    std::string date;
    std::string startTime;
    std::string endTime;
    int guestCount;
    std::string status; // "confirmed", "pending", "cancelled"
    std::string specialRequests;
    std::string phoneNumber;
    std::string email;
    double totalAmount;
    std::string paymentStatus; // "pending", "paid", "refunded"
    std::string paymentMethod; // "card", "cash"
    std::string confirmationToken;
};


#endif // RESERVATION_H
