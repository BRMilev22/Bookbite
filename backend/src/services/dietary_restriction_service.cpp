#include "../../include/services/dietary_restriction_service.h"

DietaryRestrictionService::DietaryRestrictionService(Database& db) : db(db) {}

std::vector<DietaryRestriction> DietaryRestrictionService::getAllDietaryRestrictions() {
    std::vector<DietaryRestriction> restrictions;
    auto result = db.query("SELECT * FROM dietary_restrictions");
    
    while (result.next()) {
        DietaryRestriction restriction;
        restriction.id = result.get<int>(0);
        restriction.name = result.get<std::string>(1);
        restriction.description = result.get<std::string>(2);
        restrictions.push_back(restriction);
    }
    return restrictions;
}

std::optional<DietaryRestriction> DietaryRestrictionService::getDietaryRestrictionById(int id) {
    auto result = db.query("SELECT * FROM dietary_restrictions WHERE restriction_id = " + std::to_string(id));
    
    if (result.next()) {
        DietaryRestriction restriction;
        restriction.id = result.get<int>(0);
        restriction.name = result.get<std::string>(1);
        restriction.description = result.get<std::string>(2);
        return restriction;
    }
    return std::nullopt;
}

int DietaryRestrictionService::createDietaryRestriction(const DietaryRestriction& restriction) {
    std::string sql = "INSERT INTO dietary_restrictions (name, description) VALUES ('" +
                     restriction.name + "', '" +
                     restriction.description + "')";
    
    db.execute(sql);
    auto result = db.query("SELECT LAST_INSERT_ID()");
    if (result.next()) {
        return result.get<int>(0);
    }
    return -1;
}

bool DietaryRestrictionService::updateDietaryRestriction(const DietaryRestriction& restriction) {
    std::string sql = "UPDATE dietary_restrictions SET name = '" + restriction.name +
                     "', description = '" + restriction.description +
                     "' WHERE restriction_id = " + std::to_string(restriction.id);
    
    try {
        db.execute(sql);
        return true;
    } catch (...) {
        return false;
    }
}

bool DietaryRestrictionService::deleteDietaryRestriction(int id) {
    try {
        db.execute("DELETE FROM dietary_restrictions WHERE restriction_id = " + std::to_string(id));
        return true;
    } catch (...) {
        return false;
    }
} 