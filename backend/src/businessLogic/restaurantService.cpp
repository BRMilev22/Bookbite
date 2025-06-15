#include "businessLogic/restaurantService.h"

RestaurantService::RestaurantService() {}

std::vector<Restaurant> RestaurantService::getAllRestaurants() {
    return restaurantData.getAllRestaurants();
}

std::optional<Restaurant> RestaurantService::getRestaurantById(int id) {
    return restaurantData.getRestaurantById(id);
}

bool RestaurantService::addRestaurant(const Restaurant& restaurant) {
    return restaurantData.addRestaurant(restaurant);
}

bool RestaurantService::updateRestaurant(const Restaurant& restaurant) {
    return restaurantData.updateRestaurant(restaurant);
}

bool RestaurantService::deleteRestaurant(int id) {
    return restaurantData.deleteRestaurant(id);
}

std::vector<Table> RestaurantService::getTablesByRestaurantId(int restaurantId) {
    return tableData.getTablesByRestaurantId(restaurantId);
}

std::vector<Table> RestaurantService::getAvailableTablesByRestaurantId(int restaurantId) {
    return tableData.getAvailableTablesByRestaurantId(restaurantId);
}

std::vector<Table> RestaurantService::getTablesWithReservationsByRestaurantId(int restaurantId) {
    return tableData.getTablesWithReservationsByRestaurantId(restaurantId);
}

std::optional<Table> RestaurantService::getTableById(int id) {
    return tableData.getTableById(id);
}

bool RestaurantService::addTable(const Table& table) {
    return tableData.addTable(table);
}

bool RestaurantService::updateTable(const Table& table) {
    return tableData.updateTable(table);
}

bool RestaurantService::deleteTable(int id) {
    return tableData.deleteTable(id);
}
