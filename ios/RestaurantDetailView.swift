import SwiftUI

struct RestaurantDetailView: View {
    let restaurant: Restaurant
    
    @State private var tables: [Table] = []
    @State private var reviews: [Review] = []
    @State private var isLoading = false
    @State private var selectedTab = 0
    @State private var showingReservationView = false
    
    @EnvironmentObject var apiService: APIService
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Header Image
                AsyncImage(url: URL(string: restaurant.imageUrl ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .overlay(
                            Image(systemName: "fork.knife")
                                .font(.system(size: 40))
                                .foregroundColor(.gray)
                        )
                }
                .frame(height: 250)
                .clipped()
                
                VStack(alignment: .leading, spacing: 16) {
                    // Restaurant Info
                    VStack(alignment: .leading, spacing: 8) {
                        Text(restaurant.name)
                            .font(.title)
                            .fontWeight(.bold)
                        
                        Text(restaurant.cuisineType)
                            .font(.title3)
                            .foregroundColor(.orange)
                        
                        HStack {
                            ForEach(0..<5) { index in
                                Image(systemName: index < Int(restaurant.rating) ? "star.fill" : "star")
                                    .foregroundColor(.yellow)
                            }
                            
                            Text(String(format: "%.1f", restaurant.rating))
                                .foregroundColor(.secondary)
                            
                            Spacer()
                            
                            Text(restaurant.priceRange)
                                .fontWeight(.medium)
                                .foregroundColor(.green)
                        }
                        
                        Text(restaurant.description)
                            .font(.body)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    
                    // Contact Info
                    VStack(alignment: .leading, spacing: 8) {
                        Label(restaurant.address, systemImage: "location")
                        Label(restaurant.phoneNumber, systemImage: "phone")
                        Label("\(restaurant.openingTime) - \(restaurant.closingTime)", systemImage: "clock")
                    }
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    
                    // Reserve Button
                    Button(action: {
                        showingReservationView = true
                    }) {
                        Text("Make Reservation")
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.orange)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                    }
                    
                    // Tabs
                    Picker("Info", selection: $selectedTab) {
                        Text("Tables").tag(0)
                        Text("Reviews").tag(1)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    
                    // Tab Content
                    Group {
                        if selectedTab == 0 {
                            TablesView(tables: tables)
                        } else {
                            ReviewsView(reviews: reviews, restaurant: restaurant)
                        }
                    }
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadData()
        }
        .sheet(isPresented: $showingReservationView) {
            MakeReservationView(restaurant: restaurant, tables: tables)
        }
    }
    
    private func loadData() async {
        isLoading = true
        
        async let tablesResult = try? await apiService.getRestaurantTables(restaurantId: restaurant.id)
        async let reviewsResult = try? await apiService.getRestaurantReviews(restaurantId: restaurant.id)
        
        tables = await tablesResult ?? []
        reviews = await reviewsResult ?? []
        
        isLoading = false
    }
}

struct TablesView: View {
    let tables: [Table]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Available Tables")
                .font(.headline)
            
            if tables.isEmpty {
                Text("No tables available")
                    .foregroundColor(.secondary)
                    .padding()
            } else {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 12) {
                    ForEach(tables) { table in
                        TableCard(table: table)
                    }
                }
            }
        }
    }
}

struct TableCard: View {
    let table: Table
    
    var body: some View {
        VStack(spacing: 8) {
            Text("Table \(table.tableNumber)")
                .font(.headline)
            
            Text("Seats \(table.capacity)")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Text(table.isAvailable ? "Available" : "Occupied")
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(table.isAvailable ? .green : .red)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(Color.gray.opacity(0.1))
        .cornerRadius(8)
    }
}

struct ReviewsView: View {
    let reviews: [Review]
    let restaurant: Restaurant
    @State private var showingAddReview = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Reviews")
                    .font(.headline)
                
                Spacer()
                
                Button("Add Review") {
                    showingAddReview = true
                }
                .foregroundColor(.orange)
            }
            
            if reviews.isEmpty {
                Text("No reviews yet")
                    .foregroundColor(.secondary)
                    .padding()
            } else {
                ForEach(reviews) { review in
                    ReviewCard(review: review)
                }
            }
        }
        .sheet(isPresented: $showingAddReview) {
            AddReviewView(restaurant: restaurant)
        }
    }
}

struct ReviewCard: View {
    let review: Review
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("\(review.user?.firstName ?? "") \(review.user?.lastName ?? "")")
                    .font(.headline)
                
                Spacer()
                
                HStack(spacing: 2) {
                    ForEach(0..<5) { index in
                        Image(systemName: index < review.rating ? "star.fill" : "star")
                            .foregroundColor(.yellow)
                            .font(.caption)
                    }
                }
            }
            
            if let comment = review.comment, !comment.isEmpty {
                Text(comment)
                    .font(.body)
            }
            
            Text(formatDate(review.createdAt))
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(8)
    }
    
    private func formatDate(_ dateString: String) -> String {
        // Simple date formatting - you might want to improve this
        return dateString
    }
}

#Preview {
    RestaurantDetailView(restaurant: Restaurant(
        id: 1,
        name: "Sample Restaurant",
        description: "A great place to eat",
        cuisineType: "Italian",
        address: "123 Main St",
        phoneNumber: "555-0123",
        email: "info@restaurant.com",
        openingTime: "11:00",
        closingTime: "22:00",
        priceRange: "$$",
        rating: 4.5,
        imageUrl: nil,
        isActive: true
    ))
    .environmentObject(APIService.shared)
}
