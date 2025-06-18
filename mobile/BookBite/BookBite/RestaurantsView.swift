import SwiftUI

struct RestaurantsView: View {
    @State private var restaurants: [Restaurant] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var searchText = ""
    
    @EnvironmentObject var apiService: APIService
    
    var filteredRestaurants: [Restaurant] {
        if searchText.isEmpty {
            return restaurants
        } else {
            return restaurants.filter { restaurant in
                restaurant.name.localizedCaseInsensitiveContains(searchText) ||
                restaurant.cuisineType.localizedCaseInsensitiveContains(searchText) ||
                restaurant.address.localizedCaseInsensitiveContains(searchText)
            }
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                Theme.Colors.background
                    .ignoresSafeArea()
                
                if isLoading {
                    ProgressView("Loading restaurants...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = errorMessage {
                    ErrorStateView(message: errorMessage) {
                        Task {
                            await loadRestaurants()
                        }
                    }
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(filteredRestaurants) { restaurant in
                                NavigationLink(destination: RestaurantDetailView(restaurant: restaurant)) {
                                    RestaurantCard(restaurant: restaurant)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(16)
                    }
                    .searchable(text: $searchText, prompt: "Search restaurants, cuisine, or location")
                    .refreshable {
                        await loadRestaurants()
                    }
                }
            }
            .navigationTitle("Restaurants")
            .navigationBarTitleDisplayMode(.large)
            .task {
                await loadRestaurants()
            }
        }
    }
    
    private func loadRestaurants() async {
        isLoading = true
        errorMessage = nil
        
        do {
            restaurants = try await apiService.getRestaurants()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

struct ErrorStateView: View {
    let message: String
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 50))
                .foregroundColor(Theme.Colors.warning)
            
            Text("Error")
                .font(.system(size: 24, weight: .bold))
                .fontWeight(.semibold)
                .foregroundColor(Theme.Colors.primaryText)
            
            Text(message)
                .multilineTextAlignment(.center)
                .foregroundColor(Theme.Colors.secondaryText)
                .font(.system(size: 16))
            
            Button("Retry") {
                retryAction()
            }
            .buttonStyle(PrimaryButtonStyle())
        }
        .padding(20)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct RestaurantCard: View {
    let restaurant: Restaurant
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Restaurant Image
            AsyncImage(url: URL(string: restaurant.imageUrl ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.2))
                    .overlay(
                        Image(systemName: "fork.knife")
                            .font(.system(size: 30))
                            .foregroundColor(.gray)
                    )
            }
            .frame(height: 160)
            .clipped()
            
            // Restaurant Info
            VStack(alignment: .leading, spacing: 8) {
                Text(restaurant.name)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(Theme.Colors.primaryText)
                    .lineLimit(1)
                
                Text(restaurant.cuisineType)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Theme.Colors.primary)
                    .fontWeight(.medium)
                
                Text(restaurant.address)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(Theme.Colors.secondaryText)
                    .lineLimit(2)
                
                HStack {
                    // Rating
                    HStack(spacing: 2) {
                        ForEach(0..<5) { index in
                            Image(systemName: index < Int(restaurant.rating) ? "star.fill" : "star")
                                .foregroundColor(.yellow)
                                .font(.caption)
                        }
                        
                        Text(String(format: "%.1f", restaurant.rating))
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(Theme.Colors.secondaryText)
                    }
                    
                    Spacer()
                    
                    // Price Range
                    Text(restaurant.priceRange)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(Theme.Colors.success)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Theme.Colors.success.opacity(0.1))
                        .cornerRadius(8)
                }
            }
            .padding(16)
        }
        .background(Theme.Colors.cardBackground)
        .cornerRadius(12)
        .shadow(color: Theme.Shadows.card, radius: 4, x: 0, y: 2)
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.white)
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(Theme.Colors.primary)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

#Preview {
    RestaurantsView()
        .environmentObject(APIService.shared)
}
