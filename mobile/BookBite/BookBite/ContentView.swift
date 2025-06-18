//
//  ContentView.swift
//  BookBite
//
//  Created by Boris Milev on 17.06.25.
//

import SwiftUI 

struct ContentView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    
    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                AuthenticationView()
            }
        }
        .animation(.easeInOut, value: authManager.isAuthenticated)
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            RestaurantsView()
                .tabItem {
                    Image(systemName: "fork.knife")
                    Text("Restaurants")
                }
            
            ReservationsView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text("My Reservations")
                }
            
            ProfileView()
                .tabItem {
                    Image(systemName: "person.circle")
                    Text("Profile")
                }
        }
        .accentColor(Theme.Colors.primary)
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthenticationManager())
        .environmentObject(APIService.shared)
}
 
