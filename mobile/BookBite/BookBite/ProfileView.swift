import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var showingLogoutAlert = false
    @State private var isRefreshing = false
    @State private var isBackgroundRefreshing = false
    
    var body: some View {
        NavigationView {
            List {
                // User Info Section
                Section {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 50))
                            .foregroundColor(Theme.Colors.warning)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            if let user = authManager.currentUser {
                                Text("\(user.firstName) \(user.lastName)")
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                    .foregroundColor(Theme.Colors.primaryText)
                                
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundColor(Theme.Colors.secondaryText)
                                
                                HStack {
                                    Image(systemName: user.isActive ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                                        .foregroundColor(user.isActive ? Theme.Colors.success : Theme.Colors.warning)
                                    
                                    Text(user.isActive ? "Active" : "Inactive")
                                        .font(.caption)
                                        .foregroundColor(user.isActive ? Theme.Colors.success : Theme.Colors.warning)
                                }
                            } else if authManager.isAuthenticated {
                                HStack {
                                    ProgressView()
                                        .scaleEffect(0.8)
                                    Text(isBackgroundRefreshing ? "Updating..." : "Loading...")
                                        .foregroundColor(Theme.Colors.secondaryText)
                                }
                            } else {
                                Text("Not signed in")
                                    .foregroundColor(Theme.Colors.secondaryText)
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }
                
                // App Info Section
                Section("About") {
                    HStack {
                        Image(systemName: "fork.knife.circle")
                            .foregroundColor(Theme.Colors.warning)
                        Text("BookBite")
                            .foregroundColor(Theme.Colors.primaryText)
                        Spacer()
                        Text("v1.0.0")
                            .foregroundColor(Theme.Colors.secondaryText)
                    }
                    
                    NavigationLink(destination: AppInfoView()) {
                        HStack {
                            Image(systemName: "info.circle")
                                .foregroundColor(Theme.Colors.primary)
                            Text("App Info")
                                .foregroundColor(Theme.Colors.primaryText)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(Theme.Colors.secondaryText)
                        }
                    }
                }
                
                // Settings Section
                Section("Settings") {
                    NavigationLink(destination: NotificationSettingsView()) {
                        HStack {
                            Image(systemName: "bell")
                                .foregroundColor(.blue)
                            Text("Notifications")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    NavigationLink(destination: PrivacySettingsView()) {
                        HStack {
                            Image(systemName: "lock")
                                .foregroundColor(.blue)
                            Text("Privacy")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    NavigationLink(destination: HelpSupportView()) {
                        HStack {
                            Image(systemName: "questionmark.circle")
                                .foregroundColor(.blue)
                            Text("Help & Support")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                // Account Section
                Section("Account") {
                    Button(action: {
                        showingLogoutAlert = true
                    }) {
                        HStack {
                            Image(systemName: "rectangle.portrait.and.arrow.right")
                                .foregroundColor(.red)
                            Text("Sign Out")
                                .foregroundColor(.red)
                        }
                    }
                }
            }
            .navigationTitle("Profile")
            .refreshable {
                await refreshProfile()
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if isRefreshing {
                        ProgressView()
                            .scaleEffect(0.8)
                    } else {
                        Button("Refresh") {
                            Task {
                                await refreshProfile()
                            }
                        }
                        .font(.subheadline)
                    }
                }
            }
            .alert("Sign Out", isPresented: $showingLogoutAlert) {
                Button("Sign Out", role: .destructive) {
                    Task {
                        await authManager.logout()
                    }
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("Are you sure you want to sign out?")
            }
            .onAppear {
                // Fetch profile if user is authenticated but profile is missing
                if authManager.isAuthenticated && authManager.currentUser == nil {
                    Task {
                        isBackgroundRefreshing = true
                        await authManager.fetchCurrentUser()
                        isBackgroundRefreshing = false
                    }
                }
            }
        }
    }
    
    @MainActor
    private func refreshProfile() async {
        isRefreshing = true
        await authManager.fetchCurrentUser()
        isRefreshing = false
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthenticationManager())
}
