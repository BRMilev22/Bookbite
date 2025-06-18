import Foundation
import Combine

class APIService: ObservableObject {
    static let shared = APIService()
    
    private let baseURL = "http://192.168.0.116:8080/api"
    private let session = URLSession.shared
    
    init() {}
    
    // MARK: - Generic Request Method
    private func request<T: Codable>(
        endpoint: String,
        method: HTTPMethod = .GET,
        body: Data? = nil,
        responseType: T.Type
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = UserDefaults.standard.string(forKey: "auth_token") {
            request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let body = body {
            request.httpBody = body
        }
        
        do {
            let (data, response) = try await session.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }
            
            guard 200...299 ~= httpResponse.statusCode else {
                throw APIError.serverError(httpResponse.statusCode)
            }
            
            let decoder = JSONDecoder()
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.networkError(error)
        }
    }
    
    // MARK: - Authentication
    func login(email: String, password: String) async throws -> AuthResponse {
        let loginRequest = LoginRequest(username: email, password: password)
        let body = try JSONEncoder().encode(loginRequest)
        
        return try await request(
            endpoint: "/auth/login",
            method: .POST,
            body: body,
            responseType: AuthResponse.self
        )
    }
    
    func register(firstName: String, lastName: String, email: String, password: String, phoneNumber: String?) async throws -> AuthResponse {
        // Create username from email (before @ symbol)
        let username = email.components(separatedBy: "@").first ?? email
        
        let registerRequest = RegisterRequest(
            username: username,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        )
        let body = try JSONEncoder().encode(registerRequest)
        
        return try await request(
            endpoint: "/auth/register",
            method: .POST,
            body: body,
            responseType: AuthResponse.self
        )
    }
    
    func logout() async throws -> EmptyResponse {
        return try await request(
            endpoint: "/auth/logout",
            method: .POST,
            responseType: EmptyResponse.self
        )
    }
    
    func getCurrentUser() async throws -> User {
        return try await request(
            endpoint: "/user/profile",
            method: .GET,
            responseType: User.self
        )
    }
    
    // MARK: - Restaurants
    func getRestaurants() async throws -> [Restaurant] {
        return try await request(
            endpoint: "/restaurants",
            responseType: [Restaurant].self
        )
    }
    
    func getRestaurant(id: Int) async throws -> Restaurant {
        return try await request(
            endpoint: "/restaurants/\(id)",
            responseType: Restaurant.self
        )
    }
    
    func getRestaurantTables(restaurantId: Int) async throws -> [Table] {
        return try await request(
            endpoint: "/restaurants/\(restaurantId)/tables",
            responseType: [Table].self
        )
    }
    
    func getRestaurantReviews(restaurantId: Int) async throws -> [Review] {
        return try await request(
            endpoint: "/restaurants/\(restaurantId)/reviews",
            responseType: [Review].self
        )
    }
    
    func getTablesWithReservations(restaurantId: Int) async throws -> [TableWithReservations] {
        return try await request(
            endpoint: "/restaurants/\(restaurantId)/tableswithreservations",
            responseType: [TableWithReservations].self
        )
    }

    // MARK: - Reservations
    func createReservation(request: CreateReservationRequest) async throws -> Reservation {
        let body = try JSONEncoder().encode(request)
        
        // The reservation creation endpoint returns a different format
        // So we'll handle it separately
        guard let url = URL(string: "\(baseURL)/reservations") else {
            throw APIError.invalidURL
        }
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add auth token if available
        if let token = UserDefaults.standard.string(forKey: "auth_token") {
            urlRequest.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        urlRequest.httpBody = body
        
        do {
            let (data, response) = try await session.data(for: urlRequest)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }
            
            guard 200...299 ~= httpResponse.statusCode else {
                throw APIError.serverError(httpResponse.statusCode)
            }
            
            // Parse the response to check if it was successful
            let decoder = JSONDecoder()
            let createResponse = try decoder.decode(CreateReservationResponse.self, from: data)
            
            if createResponse.success {
                // Return a mock reservation object since the backend doesn't return the created reservation
                // In a real app, you might want to make another API call to fetch the created reservation
                return Reservation(
                    id: 0, // Will be assigned by backend
                    userId: request.userId ?? 0,
                    tableId: request.tableId,
                    restaurantId: request.restaurantId,
                    date: request.date,
                    startTime: request.startTime,
                    endTime: request.endTime,
                    guestCount: request.guestCount,
                    status: createResponse.status ?? "pending",
                    specialRequests: request.specialRequests,
                    phoneNumber: request.phoneNumber,
                    email: request.email,
                    totalAmount: request.totalAmount,
                    paymentStatus: request.paymentStatus,
                    paymentMethod: request.paymentMethod,
                    restaurantName: nil // We don't have the restaurant name in the response
                )
            } else {
                throw APIError.serverError(400)
            }
        } catch {
            throw APIError.networkError(error)
        }
    }
    
    func getUserReservations() async throws -> [Reservation] {
        return try await request(
            endpoint: "/user/reservations",
            responseType: [Reservation].self
        )
    }
    
    func cancelReservation(id: Int) async throws -> EmptyResponse {
        return try await request(
            endpoint: "/reservations/\(id)/cancel",
            method: .POST,
            responseType: EmptyResponse.self
        )
    }
    
    // MARK: - Reviews
    func createReview(request: CreateReviewRequest) async throws -> Review {
        let body = try JSONEncoder().encode(request)
        
        let response = try await self.request(
            endpoint: "/reviews",
            method: .POST,
            body: body,
            responseType: APIResponse<Review>.self
        )
        
        guard let review = response.data else {
            throw APIError.noData
        }
        return review
    }
}

// MARK: - HTTP Methods
enum HTTPMethod: String {
    case GET = "GET"
    case POST = "POST"
    case PUT = "PUT"
    case DELETE = "DELETE"
}

// MARK: - API Errors
enum APIError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case noData
    case serverError(Int)
    case networkError(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response"
        case .noData:
            return "No data received"
        case .serverError(let code):
            return "Server error with code: \(code)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}
