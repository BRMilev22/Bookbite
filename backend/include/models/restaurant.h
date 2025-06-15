#ifndef RESTAURANT_H
#define RESTAURANT_H

#include <string>

class Restaurant {
public:
    Restaurant();
    Restaurant(int id, const std::string& name, const std::string& address, 
              const std::string& phoneNumber, const std::string& description, int tableCount,
              const std::string& cuisineType = "", float rating = 0.0, bool isFeatured = false,
              const std::string& priceRange = "", const std::string& openingTime = "", const std::string& closingTime = "",
              const std::string& imageUrl = "");
    
    int getId() const;
    std::string getName() const;
    std::string getAddress() const;
    std::string getPhoneNumber() const;
    std::string getDescription() const;
    int getTableCount() const;
    std::string getCuisineType() const;
    float getRating() const;
    bool getIsFeatured() const;
    std::string getPriceRange() const;
    std::string getOpeningTime() const;
    std::string getClosingTime() const;
    std::string getImageUrl() const;
    double getReservationFee() const;
    bool getIsActive() const;
    
    void setId(int id);
    void setName(const std::string& name);
    void setAddress(const std::string& address);
    void setPhoneNumber(const std::string& phoneNumber);
    void setDescription(const std::string& description);
    void setTableCount(int tableCount);
    void setCuisineType(const std::string& cuisineType);
    void setRating(float rating);
    void setIsFeatured(bool isFeatured);
    void setPriceRange(const std::string& priceRange);
    void setOpeningTime(const std::string& openingTime);
    void setClosingTime(const std::string& closingTime);
    void setImageUrl(const std::string& imageUrl);
    void setReservationFee(double reservationFee);
    void setIsActive(bool isActive);

private:
    int id;
    std::string name;
    std::string address;
    std::string phoneNumber;
    std::string description;
    int tableCount;
    std::string cuisineType;
    float rating;
    bool isFeatured;
    std::string priceRange;
    std::string openingTime;
    std::string closingTime;
    std::string imageUrl;
    double reservationFee;
    bool isActive;
};

#endif // RESTAURANT_H
