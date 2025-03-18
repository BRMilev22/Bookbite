#pragma once

#include "../models/occasion.h"
#include "../database/db_manager.h"
#include <vector>
#include <optional>

// Service for managing occasions
class OccasionService {
public:
    OccasionService(Database& db);

    // Get all occasions
    std::vector<Occasion> getAllOccasions();

    // Get occasion by ID
    std::optional<Occasion> getOccasionById(int id);

    // Create new occasion
    int createOccasion(const Occasion& occasion);

    // Update occasion
    bool updateOccasion(const Occasion& occasion);

    // Delete occasion
    bool deleteOccasion(int id);

private:
    Database& db;
}; 