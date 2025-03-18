#pragma once

#include "../models/dietary_restriction.h"
#include "../database/db_manager.h"
#include <vector>
#include <optional>

// Service for managing dietary restrictions
class DietaryRestrictionService {
public:
    DietaryRestrictionService(Database& db);

    // Get all dietary restrictions
    std::vector<DietaryRestriction> getAllDietaryRestrictions();

    // Get dietary restriction by ID
    std::optional<DietaryRestriction> getDietaryRestrictionById(int id);

    // Create new dietary restriction
    int createDietaryRestriction(const DietaryRestriction& restriction);

    // Update dietary restriction
    bool updateDietaryRestriction(const DietaryRestriction& restriction);

    // Delete dietary restriction
    bool deleteDietaryRestriction(int id);

private:
    Database& db;
}; 