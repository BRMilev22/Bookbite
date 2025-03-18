#pragma once

#include "../models/promo_code.h"
#include "../database/db_manager.h"
#include <vector>
#include <optional>

// Service for managing promo codes
class PromoCodeService {
public:
    PromoCodeService(Database& db);

    // Get all promo codes
    std::vector<PromoCode> getAllPromoCodes();

    // Get promo code by ID
    std::optional<PromoCode> getPromoCodeById(int id);

    // Get promo code by code string
    std::optional<PromoCode> getPromoCodeByCode(const std::string& code);

    // Create new promo code
    int createPromoCode(const PromoCode& promoCode);

    // Update promo code
    bool updatePromoCode(const PromoCode& promoCode);

    // Delete promo code
    bool deletePromoCode(int id);

    // Validate promo code (checks if exists, is active, and not expired)
    bool validatePromoCode(const std::string& code);

    // Apply promo code (increments usage counter)
    bool applyPromoCode(const std::string& code);

private:
    Database& db;
}; 