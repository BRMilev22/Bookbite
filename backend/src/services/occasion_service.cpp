#include "../../include/services/occasion_service.h"

OccasionService::OccasionService(Database& db) : db(db) {}

std::vector<Occasion> OccasionService::getAllOccasions() {
    std::vector<Occasion> occasions;
    auto result = db.query("SELECT * FROM occasions");
    
    while (result.next()) {
        Occasion occasion;
        occasion.id = result.get<int>(0);
        occasion.name = result.get<std::string>(1);
        occasion.description = result.get<std::string>(2);
        occasions.push_back(occasion);
    }
    return occasions;
}

std::optional<Occasion> OccasionService::getOccasionById(int id) {
    auto result = db.query("SELECT * FROM occasions WHERE occasion_id = " + std::to_string(id));
    
    if (result.next()) {
        Occasion occasion;
        occasion.id = result.get<int>(0);
        occasion.name = result.get<std::string>(1);
        occasion.description = result.get<std::string>(2);
        return occasion;
    }
    return std::nullopt;
}

int OccasionService::createOccasion(const Occasion& occasion) {
    std::string sql = "INSERT INTO occasions (name, description) VALUES ('" +
                     occasion.name + "', '" +
                     occasion.description + "')";
    
    db.execute(sql);
    auto result = db.query("SELECT LAST_INSERT_ID()");
    if (result.next()) {
        return result.get<int>(0);
    }
    return -1;
}

bool OccasionService::updateOccasion(const Occasion& occasion) {
    std::string sql = "UPDATE occasions SET name = '" + occasion.name +
                     "', description = '" + occasion.description +
                     "' WHERE occasion_id = " + std::to_string(occasion.id);
    
    try {
        db.execute(sql);
        return true;
    } catch (...) {
        return false;
    }
}

bool OccasionService::deleteOccasion(int id) {
    try {
        db.execute("DELETE FROM occasions WHERE occasion_id = " + std::to_string(id));
        return true;
    } catch (...) {
        return false;
    }
} 