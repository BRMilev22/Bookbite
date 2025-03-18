#pragma once

#include <string>
#include <vector>

struct RestaurantFeature {
    int id = 0;
    std::string name;
};

// Restaurant data structure
struct Restaurant {
    int id = 0;
    std::string name;
    std::string imageUrl;
    std::string location;
    std::string distance;
    std::string category;
    std::string priceRange;
    double rating = 4.0;
    std::string ratingLabel = "Good";
    int reviews = 0;
    bool isSpecial = false;
    bool isRecommended = false;
    bool isTrending = false;
    std::vector<RestaurantFeature> features;
}; 