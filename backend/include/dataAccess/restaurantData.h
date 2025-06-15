#ifndef RESTAURANT_DATA_H
#define RESTAURANT_DATA_H

#include "models/restaurant.h"
#include "utils/dbConnection.h"
#include <vector>
#include <optional>

class RestaurantData {
public:
    RestaurantData();
    std::vector<Restaurant> getAllRestaurants();
    std::optional<Restaurant> getRestaurantById(int id);
    bool addRestaurant(const Restaurant& restaurant);
    bool updateRestaurant(const Restaurant& restaurant);
    bool deleteRestaurant(int id);

private:
    DbConnection dbConnection;
};

#endif // RESTAURANT_DATA_H
