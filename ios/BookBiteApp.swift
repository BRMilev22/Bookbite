import SwiftUI

@main
struct BookBiteApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var apiService = APIService()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(apiService)
                .onAppear {
                    authManager.checkAuthenticationStatus()
                }
        }
    }
}
