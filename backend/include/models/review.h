#ifndef REVIEW_H
#define REVIEW_H

#include <string>

class Review {
public:
    Review();
    Review(int id, int userId, int restaurantId, int rating, const std::string& comment);
    
    int getId() const;
    int getUserId() const;
    int getRestaurantId() const;
    int getRating() const;
    std::string getComment() const;
    
    void setId(int id);
    void setUserId(int userId);
    void setRestaurantId(int restaurantId);
    void setRating(int rating);
    void setComment(const std::string& comment);

private:
    int id;
    int userId;
    int restaurantId;
    int rating;
    std::string comment;
};

#endif // REVIEW_H
