#ifndef TABLE_H
#define TABLE_H

#include <vector>
#include <string>

struct ReservationInfo {
    int id;
    std::string date;
    std::string startTime;
    std::string endTime;
    std::string status;
    int guestCount;
};

class Table {
public:
    Table();
    Table(int id, int restaurantId, int seatCount, bool isAvailable);
    
    int getId() const;
    int getRestaurantId() const;
    int getSeatCount() const;
    bool getIsAvailable() const;
    std::vector<ReservationInfo> getReservations() const;
    
    void setId(int id);
    void setRestaurantId(int restaurantId);
    void setSeatCount(int seatCount);
    void setIsAvailable(bool isAvailable);
    void setReservations(const std::vector<ReservationInfo>& reservations);
    void addReservation(const ReservationInfo& reservation);

private:
    int id;
    int restaurantId;
    int seatCount;
    bool isAvailable;
    std::vector<ReservationInfo> reservations;
};

#endif // TABLE_H
