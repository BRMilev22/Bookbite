import Foundation
import Combine

class APIService: ObservableObject {
    static let shared = APIService()
    
    private let baseURL = "http://localhost:8080/api"
    private let session = URLSession.shared
    
    private init() {}
    
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
        let loginRequest = LoginRequest(email: email, password: password)
        let body = try JSONEncoder().encode(loginRequest)
        
        return try await request(
            endpoint: "/auth/login",
            method: .POST,
            body: body,
            responseType: AuthResponse.self
        )
    }
    
    func register(firstName: String, lastName: String, email: String, password: String, phoneNumber: String?) async throws -> AuthResponse {
        let registerRequest = RegisterRequest(
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            phoneNumber: phoneNumber
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
    
    // MARK: - Restaurants
    func getRestaurants() async throws -> [Restaurant] {
        let response = try await request(
            endpoint: "/restaurants",
            responseType: APIResponse<[Restaurant]>.self
        )
        return response.data ?? []
    }
    
    func getRestaurant(id: Int) async throws -> Restaurant {
        let response = try await request(
            endpoint: "/restaurants/\(id)",
            responseType: APIResponse<Restaurant>.self
        )
        guard let restaurant = response.data else {
            throw APIError.noData
        }
        return restaurant
    }
    
    func getRestaurantTables(restaurantId: Int) async throws -> [Table] {
        let response = try await request(
            endpoint: "/restaurants/\(restaurantId)/tables",
            responseType: APIResponse<[Table]>.self
        )
        return response.data ?? []
    }
    
    func getRestaurantReviews(restaurantId: Int) async throws -> [Review] {
        let response = try await request(
            endpoint: "/restaurants/\(restaurantId)/reviews",
            responseType: APIResponse<[Review]>.self
        )
        return response.data ?? []
    }
    
    // MARK: - Reservations
    func createReservation(request: CreateReservationRequest) async throws -> Reservation {
        let body = try JSONEncoder().encode(request)
        
        let response = try await self.request(
            endpoint: "/reservations",
            method: .POST,
            body: body,
            responseType: APIResponse<Reservation>.self
        )
        
        guard let reservation = response.data else {
            throw APIError.noData
        }
        return reservation
    }
    
    func getUserReservations() async throws -> [Reservation] {
        let response = try await request(
            endpoint: "/user/reservations",
            responseType: APIResponse<[Reservation]>.self
        )
        return response.data ?? []
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
