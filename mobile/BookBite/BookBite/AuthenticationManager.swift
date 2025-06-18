import Foundation
import Combine

class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let apiService = APIService.shared
    
    init() {
        checkAuthenticationStatus()
    }
    
    func checkAuthenticationStatus() {
        if let token = UserDefaults.standard.string(forKey: "auth_token"),
           !token.isEmpty {
            isAuthenticated = true
            
            // Load cached user data immediately
            loadCachedUser()
            
            // Fetch fresh user profile in background
            Task {
                await fetchCurrentUser()
            }
        }
    }
    
    private func loadCachedUser() {
        if let userData = UserDefaults.standard.data(forKey: "cached_user") {
            do {
                let user = try JSONDecoder().decode(User.self, from: userData)
                currentUser = user
            } catch {
                print("Failed to decode cached user data: \(error)")
                // Clear corrupted cache
                clearCachedUser()
            }
        }
    }
    
    private func cacheUser(_ user: User) {
        do {
            let userData = try JSONEncoder().encode(user)
            UserDefaults.standard.set(userData, forKey: "cached_user")
        } catch {
            print("Failed to encode user data for caching: \(error)")
        }
    }
    
    private func clearCachedUser() {
        UserDefaults.standard.removeObject(forKey: "cached_user")
    }
    
    @MainActor
    func fetchCurrentUser() async {
        guard isAuthenticated else { return }
        
        do {
            let user = try await apiService.getCurrentUser()
            currentUser = user
            cacheUser(user) // Cache the user data
        } catch {
            print("Failed to fetch current user: \(error)")
            // If token is invalid, logout user
            if error.localizedDescription.contains("401") || error.localizedDescription.contains("Unauthorized") {
                await logout()
            }
        }
    }
    
    @MainActor
    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await apiService.login(email: email, password: password)
            
            if response.success, let token = response.token {
                UserDefaults.standard.set(token, forKey: "auth_token")
                currentUser = response.user
                if let user = response.user {
                    cacheUser(user) // Cache user data on login
                }
                isAuthenticated = true
            } else {
                errorMessage = response.message
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    @MainActor
    func register(firstName: String, lastName: String, email: String, password: String, phoneNumber: String?) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let response = try await apiService.register(
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                phoneNumber: phoneNumber
            )
            
            if response.success {
                errorMessage = "Registration successful! Please check your email to verify your account."
            } else {
                errorMessage = response.message
            }
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    @MainActor
    func logout() async {
        isLoading = true
        
        do {
            _ = try await apiService.logout()
        } catch {
            // Log error but continue with logout
            print("Logout error: \(error)")
        }
        
        UserDefaults.standard.removeObject(forKey: "auth_token")
        clearCachedUser() // Clear cached user data
        currentUser = nil
        isAuthenticated = false
        isLoading = false
    }
    
    func clearError() {
        errorMessage = nil
    }
}
