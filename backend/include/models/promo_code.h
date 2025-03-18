#pragma once

#include <string>

// Simple promo code data structure
struct PromoCode {
    int id = 0;
    std::string code;
    int discountPercentage = 0;
    std::string startDate;
    std::string endDate;
    bool isActive = true;
    int maxUses = 0;
    int currentUses = 0;
}; 