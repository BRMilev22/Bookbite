import Foundation

// MARK: - User Models
struct User: Codable, Identifiable {
    let id: Int
    let username: String
    let email: String
    let firstName: String
    let lastName: String
    let phoneNumber: String?
    let roleId: Int
    let roleName: String
    let permissions: [String]
    let isActive: Bool
}

struct LoginRequest: Codable {
    let username: String
    let password: String
}

struct RegisterRequest: Codable {
    let username: String
    let email: String
    let password: String
    let firstName: String
    let lastName: String
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
    let address: String
    let phoneNumber: String
    let description: String
    let tableCount: Int
    let cuisineType: String
    let rating: Double
    let isFeatured: Bool
    let priceRange: String
    let openingTime: String
    let closingTime: String
    let imageUrl: String?
    let reservationFee: Double
    
    enum CodingKeys: String, CodingKey {
        case id, name, address, phoneNumber, description, tableCount, cuisineType, rating, isFeatured, priceRange, openingTime, closingTime, imageUrl
        case reservationFee = "reservation_fee"
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
        case id
        case restaurantId = "restaurantId"
        case capacity = "seatCount" 
        case isAvailable = "isAvailable"
    }
    
    // Initialize tableNumber since backend doesn't provide it
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        restaurantId = try container.decode(Int.self, forKey: .restaurantId)
        capacity = try container.decode(Int.self, forKey: .capacity)
        isAvailable = try container.decode(Bool.self, forKey: .isAvailable)
        tableNumber = "\(id)" // Use table ID as table number since backend doesn't provide it
    }
    
    // Memberwise initializer for manual creation (like in previews)
    init(id: Int, restaurantId: Int, tableNumber: String, capacity: Int, isAvailable: Bool) {
        self.id = id
        self.restaurantId = restaurantId
        self.tableNumber = tableNumber
        self.capacity = capacity
        self.isAvailable = isAvailable
    }
}

// MARK: - Table with Reservations Model
struct TableWithReservations: Codable, Identifiable {
    let id: Int
    let restaurantId: Int
    let seatCount: Int
    let isAvailable: Bool
    let reservations: [TableReservation]
}

struct TableReservation: Codable, Identifiable {
    let id: Int
    let date: String
    let startTime: String
    let endTime: String
    let status: String
    let guestCount: Int
}

// MARK: - Reservation Models
struct Reservation: Codable, Identifiable {
    let id: Int
    let userId: Int
    let tableId: Int
    let restaurantId: Int
    let date: String
    let startTime: String
    let endTime: String
    let guestCount: Int
    let status: String
    let specialRequests: String?
    let phoneNumber: String?
    let email: String?
    let totalAmount: Double
    let paymentStatus: String
    let paymentMethod: String?
    let restaurantName: String?
}

struct CreateReservationRequest: Codable {
    let userId: Int?
    let restaurantId: Int
    let tableId: Int
    let date: String
    let startTime: String
    let endTime: String
    let guestCount: Int
    let specialRequests: String?
    let phoneNumber: String
    let email: String
    let totalAmount: Double
    let paymentStatus: String
    let paymentMethod: String
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
        case id, rating, comment
        case userId = "userId"
        case restaurantId = "restaurantId"
    }
    
    // Initialize missing fields since backend doesn't provide them
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(Int.self, forKey: .id)
        userId = try container.decode(Int.self, forKey: .userId)
        restaurantId = try container.decode(Int.self, forKey: .restaurantId)
        rating = try container.decode(Int.self, forKey: .rating)
        comment = try container.decodeIfPresent(String.self, forKey: .comment)
        createdAt = "" // Backend doesn't provide timestamp - will be empty
        user = nil // Backend doesn't include user info in this endpoint
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

struct CreateReservationResponse: Codable {
    let success: Bool
    let message: String
    let status: String?
}
