#ifndef RESTAURANT_SERVICE_H
#define RESTAURANT_SERVICE_H

#include "dataAccess/restaurantData.h"
#include "dataAccess/tableData.h"
#include <vector>
#include <optional>

class RestaurantService {
public:
    RestaurantService();
    std::vector<Restaurant> getAllRestaurants();
    std::optional<Restaurant> getRestaurantById(int id);
    bool addRestaurant(const Restaurant& restaurant);
    bool updateRestaurant(const Restaurant& restaurant);
    bool deleteRestaurant(int id);
    
    std::vector<Table> getTablesByRestaurantId(int restaurantId);
    std::vector<Table> getAvailableTablesByRestaurantId(int restaurantId);
    std::vector<Table> getTablesWithReservationsByRestaurantId(int restaurantId);
    std::optional<Table> getTableById(int id);
    bool addTable(const Table& table);
    bool updateTable(const Table& table);
    bool deleteTable(int id);

private:
    RestaurantData restaurantData;
    TableData tableData;
};

#endif // RESTAURANT_SERVICE_H
