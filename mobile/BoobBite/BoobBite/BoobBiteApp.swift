//
//  BoobBiteApp.swift
//  BoobBite
//
//  Created by Boris Milev on 17.06.25.
//

import SwiftUI

@main
struct BoobBiteApp: App {
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var apiService = APIService.shared
    
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
