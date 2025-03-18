#include "../../include/services/promo_code_service.h"
#include <ctime>
#include <iomanip>
#include <sstream>
#include <iostream>

PromoCodeService::PromoCodeService(Database& db) : db(db) {}

std::vector<PromoCode> PromoCodeService::getAllPromoCodes() {
    std::vector<PromoCode> promoCodes;
    try {
        std::cout << "Getting all promo codes" << std::endl;
        auto result = db.query("SELECT * FROM promo_codes");
        
        if (!result) {
            std::cout << "Database query returned null result" << std::endl;
            return promoCodes;
        }
        
        while (result.next()) {
            PromoCode promoCode;
            if (!result.is_null(0)) promoCode.id = result.get<int>(0);
            if (!result.is_null(1)) promoCode.code = result.get<std::string>(1);
            if (!result.is_null(2)) promoCode.discountPercentage = result.get<int>(2);
            if (!result.is_null(3)) promoCode.startDate = result.get<std::string>(3);
            if (!result.is_null(4)) promoCode.endDate = result.get<std::string>(4);
            if (!result.is_null(5)) promoCode.isActive = result.get<int>(5) > 0;
            
            if (!result.is_null(6)) {
                promoCode.maxUses = result.get<int>(6);
            } else {
                promoCode.maxUses = 0;
            }
            
            if (!result.is_null(7)) {
                promoCode.currentUses = result.get<int>(7);
            } else {
                promoCode.currentUses = 0;
            }
            
            promoCodes.push_back(promoCode);
        }
        std::cout << "Found " << promoCodes.size() << " promo codes" << std::endl;
    } catch (const std::exception& e) {
        std::cout << "Exception in getAllPromoCodes: " << e.what() << std::endl;
    } catch (...) {
        std::cout << "Unknown exception in getAllPromoCodes" << std::endl;
    }
    return promoCodes;
}

std::optional<PromoCode> PromoCodeService::getPromoCodeById(int id) {
    try {
        if (id <= 0) {
            std::cout << "Invalid promo code ID: " << id << std::endl;
            return std::nullopt;
        }
        
        std::string sql = "SELECT * FROM promo_codes WHERE promo_id = " + std::to_string(id);
        std::cout << "Executing SQL: " << sql << std::endl;
        
        auto result = db.query(sql);
        
        if (!result) {
            std::cout << "Database query returned null result" << std::endl;
            return std::nullopt;
        }
        
        if (result.next()) {
            PromoCode promoCode;
            if (!result.is_null(0)) promoCode.id = result.get<int>(0);
            if (!result.is_null(1)) promoCode.code = result.get<std::string>(1);
            if (!result.is_null(2)) promoCode.discountPercentage = result.get<int>(2);
            if (!result.is_null(3)) promoCode.startDate = result.get<std::string>(3);
            if (!result.is_null(4)) promoCode.endDate = result.get<std::string>(4);
            if (!result.is_null(5)) promoCode.isActive = result.get<int>(5) > 0;
            
            if (!result.is_null(6)) {
                promoCode.maxUses = result.get<int>(6);
            } else {
                promoCode.maxUses = 0;
            }
            
            if (!result.is_null(7)) {
                promoCode.currentUses = result.get<int>(7);
            } else {
                promoCode.currentUses = 0;
            }
            
            return promoCode;
        }
        
        std::cout << "No promo code found with ID: " << id << std::endl;
        return std::nullopt;
    } catch (const std::exception& e) {
        std::cout << "Exception in getPromoCodeById: " << e.what() << std::endl;
        return std::nullopt;
    } catch (...) {
        std::cout << "Unknown exception in getPromoCodeById" << std::endl;
        return std::nullopt;
    }
}

std::optional<PromoCode> PromoCodeService::getPromoCodeByCode(const std::string& code) {
    try {
        // Basic input validation and sanitization
        if (code.empty()) {
            std::cout << "Empty promo code provided" << std::endl;
            return std::nullopt;
        }
        
        // Escape single quotes in the code to prevent SQL injection
        std::string escapedCode = code;
        size_t pos = 0;
        while ((pos = escapedCode.find("'", pos)) != std::string::npos) {
            escapedCode.replace(pos, 1, "''");
            pos += 2;
        }
        
        std::string sql = "SELECT * FROM promo_codes WHERE code = '" + escapedCode + "'";
        std::cout << "Executing SQL: " << sql << std::endl;
        
        auto result = db.query(sql);
        
        if (!result) {
            std::cout << "Database query returned null result" << std::endl;
            return std::nullopt;
        }
        
        if (result.next()) {
            PromoCode promoCode;
            // Use safer get methods with explicit null checks
            if (!result.is_null(0)) promoCode.id = result.get<int>(0);
            if (!result.is_null(1)) promoCode.code = result.get<std::string>(1);
            if (!result.is_null(2)) promoCode.discountPercentage = result.get<int>(2);
            if (!result.is_null(3)) promoCode.startDate = result.get<std::string>(3);
            if (!result.is_null(4)) promoCode.endDate = result.get<std::string>(4);
            if (!result.is_null(5)) promoCode.isActive = result.get<int>(5) > 0;
            
            // Handle nullable max_uses and current_uses
            if (!result.is_null(6)) {
                promoCode.maxUses = result.get<int>(6);
            } else {
                promoCode.maxUses = 0; // Default to 0 if NULL
            }
            
            if (!result.is_null(7)) {
                promoCode.currentUses = result.get<int>(7);
            } else {
                promoCode.currentUses = 0; // Default to 0 if NULL
            }
            
            return promoCode;
        }
        
        std::cout << "No promo code found with code: " << code << std::endl;
        return std::nullopt;
    } catch (const std::exception& e) {
        std::cout << "Exception in getPromoCodeByCode: " << e.what() << std::endl;
        return std::nullopt;
    } catch (...) {
        std::cout << "Unknown exception in getPromoCodeByCode" << std::endl;
        return std::nullopt;
    }
}

int PromoCodeService::createPromoCode(const PromoCode& promoCode) {
    std::string sql = "INSERT INTO promo_codes (code, discount_percentage, start_date, end_date, is_active, max_uses, current_uses) "
                     "VALUES ('" + promoCode.code + "', " +
                     std::to_string(promoCode.discountPercentage) + ", '" +
                     promoCode.startDate + "', '" +
                     promoCode.endDate + "', " +
                     (promoCode.isActive ? "1" : "0") + ", " +
                     std::to_string(promoCode.maxUses) + ", " +
                     std::to_string(promoCode.currentUses) + ")";
    
    db.execute(sql);
    auto result = db.query("SELECT LAST_INSERT_ID()");
    if (result.next()) {
        return result.get<int>(0);
    }
    return -1;
}

bool PromoCodeService::updatePromoCode(const PromoCode& promoCode) {
    std::string sql = "UPDATE promo_codes SET code = '" + promoCode.code +
                     "', discount_percentage = " + std::to_string(promoCode.discountPercentage) +
                     ", start_date = '" + promoCode.startDate +
                     "', end_date = '" + promoCode.endDate +
                     "', is_active = " + (promoCode.isActive ? "1" : "0") +
                     ", max_uses = " + std::to_string(promoCode.maxUses) +
                     ", current_uses = " + std::to_string(promoCode.currentUses) +
                     " WHERE promo_id = " + std::to_string(promoCode.id);
    
    try {
        db.execute(sql);
        return true;
    } catch (...) {
        return false;
    }
}

bool PromoCodeService::deletePromoCode(int id) {
    try {
        db.execute("DELETE FROM promo_codes WHERE promo_id = " + std::to_string(id));
        return true;
    } catch (...) {
        return false;
    }
}

bool PromoCodeService::validatePromoCode(const std::string& code) {
    try {
        // Get current date
        auto now = std::chrono::system_clock::now();
        auto time = std::chrono::system_clock::to_time_t(now);
        std::tm tm = *std::localtime(&time);
        std::stringstream ss;
        ss << std::put_time(&tm, "%Y-%m-%d");
        std::string currentDate = ss.str();
        
        std::cout << "Current date: " << currentDate << std::endl;
        
        // First check if the code exists
        auto promoCode = getPromoCodeByCode(code);
        if (!promoCode) {
            std::cout << "Promo code '" << code << "' not found" << std::endl;
            return false;
        }
        
        // Now check validity conditions
        std::cout << "Found promo code: " << promoCode->code << ", active: " << (promoCode->isActive ? "yes" : "no") 
                  << ", start: " << promoCode->startDate << ", end: " << promoCode->endDate << std::endl;
        
        // Check if active
        if (!promoCode->isActive) {
            std::cout << "Promo code is not active" << std::endl;
            return false;
        }
        
        // Check dates
        if (promoCode->startDate > currentDate) {
            std::cout << "Promo code has not started yet" << std::endl;
            return false;
        }
        
        if (promoCode->endDate < currentDate) {
            std::cout << "Promo code has expired" << std::endl;
            return false;
        }
        
        // Check usage limits
        if (promoCode->maxUses > 0 && promoCode->currentUses >= promoCode->maxUses) {
            std::cout << "Promo code has reached usage limit" << std::endl;
            return false;
        }
        
        std::cout << "Promo code is valid" << std::endl;
        return true;
    } catch (const std::exception& e) {
        std::cout << "Exception in validatePromoCode: " << e.what() << std::endl;
        return false;
    } catch (...) {
        std::cout << "Unknown exception in validatePromoCode" << std::endl;
        return false;
    }
}

bool PromoCodeService::applyPromoCode(const std::string& code) {
    // First validate the code
    if (!validatePromoCode(code)) {
        return false;
    }
    
    // If valid, increment usage counter
    std::string sql = "UPDATE promo_codes SET current_uses = current_uses + 1 WHERE code = '" + code + "'";
    
    try {
        db.execute(sql);
        return true;
    } catch (...) {
        return false;
    }
} 