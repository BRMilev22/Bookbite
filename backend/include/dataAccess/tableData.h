#ifndef TABLE_DATA_H
#define TABLE_DATA_H

#include "models/table.h"
#include "utils/dbConnection.h"
#include <vector>
#include <optional>

class TableData {
public:
    TableData();
    std::vector<Table> getAllTables();
    std::vector<Table> getTablesByRestaurantId(int restaurantId);
    std::vector<Table> getAvailableTablesByRestaurantId(int restaurantId);
    std::vector<Table> getTablesWithReservationsByRestaurantId(int restaurantId);
    std::optional<Table> getTableById(int id);
    bool addTable(const Table& table);
    bool updateTable(const Table& table);
    bool deleteTable(int id);
    bool updateTableAvailability(int id, bool isAvailable);

private:
    DbConnection dbConnection;
};

#endif // TABLE_DATA_H
