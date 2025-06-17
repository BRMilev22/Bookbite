import Foundation

// MARK: - User Models
struct User: Codable, Identifiable {
    let id: Int
    let firstName: String
    let lastName: String
    let email: String
    let phoneNumber: String?
    let createdAt: String
    let isVerified: Bool
    
    enum CodingKeys: String, CodingKey {
        case id, email, createdAt, isVerified
        case firstName = "first_name"
        case lastName = "last_name"
        case phoneNumber = "phone_number"
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct RegisterRequest: Codable {
    let firstName: String
    let lastName: String
    let email: String
    let password: String
    let phoneNumber: String?
    
    enum CodingKeys: String, CodingKey {
        case email, password
        case firstName = "first_name"
        case lastName = "last_name"
        case phoneNumber = "phone_number"
    }
}

struct AuthResponse: Codable {
    let success: Bool
    let message: String
    let token: String?
    let user: User?
}

// MARK: - Restaurant Models
struct Restaurant: Codable, Identifiable {
    let id: Int
    let name: String
    let description: String
    let cuisineType: String
    let address: String
    let phoneNumber: String
    let email: String?
    let openingTime: String
    let closingTime: String
    let priceRange: String
    let rating: Double
    let imageUrl: String?
    let isActive: Bool
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, address, email, rating
        case cuisineType = "cuisine_type"
        case phoneNumber = "phone_number"
        case openingTime = "opening_time"
        case closingTime = "closing_time"
        case priceRange = "price_range"
        case imageUrl = "image_url"
        case isActive = "is_active"
    }
}

// MARK: - Table Models
struct Table: Codable, Identifiable {
    let id: Int
    let restaurantId: Int
    let tableNumber: String
    let capacity: Int
    let isAvailable: Bool
    
    enum CodingKeys: String, CodingKey {
        case id, capacity
        case restaurantId = "restaurant_id"
        case tableNumber = "table_number"
        case isAvailable = "is_available"
    }
}

// MARK: - Reservation Models
struct Reservation: Codable, Identifiable {
    let id: Int
    let userId: Int
    let restaurantId: Int
    let tableId: Int
    let reservationDate: String
    let reservationTime: String
    let partySize: Int
    let specialRequests: String?
    let status: String
    let createdAt: String
    let restaurant: Restaurant?
    let table: Table?
    
    enum CodingKeys: String, CodingKey {
        case id, status, restaurant, table
        case userId = "user_id"
        case restaurantId = "restaurant_id"
        case tableId = "table_id"
        case reservationDate = "reservation_date"
        case reservationTime = "reservation_time"
        case partySize = "party_size"
        case specialRequests = "special_requests"
        case createdAt = "created_at"
    }
}

struct CreateReservationRequest: Codable {
    let restaurantId: Int
    let tableId: Int
    let reservationDate: String
    let reservationTime: String
    let partySize: Int
    let specialRequests: String?
    
    enum CodingKeys: String, CodingKey {
        case partySize = "party_size"
        case restaurantId = "restaurant_id"
        case tableId = "table_id"
        case reservationDate = "reservation_date"
        case reservationTime = "reservation_time"
        case specialRequests = "special_requests"
    }
}

// MARK: - Review Models
struct Review: Codable, Identifiable {
    let id: Int
    let userId: Int
    let restaurantId: Int
    let rating: Int
    let comment: String?
    let createdAt: String
    let user: User?
    
    enum CodingKeys: String, CodingKey {
        case id, rating, comment, user
        case userId = "user_id"
        case restaurantId = "restaurant_id"
        case createdAt = "created_at"
    }
}

struct CreateReviewRequest: Codable {
    let restaurantId: Int
    let rating: Int
    let comment: String?
    
    enum CodingKeys: String, CodingKey {
        case rating, comment
        case restaurantId = "restaurant_id"
    }
}

// MARK: - API Response Models
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let message: String
    let data: T?
}

struct EmptyResponse: Codable {
    let success: Bool
    let message: String
}
