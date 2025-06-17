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
            // Optionally validate token with server
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
        currentUser = nil
        isAuthenticated = false
        isLoading = false
    }
    
    func clearError() {
        errorMessage = nil
    }
}
