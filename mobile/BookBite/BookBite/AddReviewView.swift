import SwiftUI

struct AddReviewView: View {
    let restaurant: Restaurant
    
    @State private var rating = 5
    @State private var comment = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingSuccess = false
    
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var apiService: APIService
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Restaurant")) {
                    HStack {
                        CircularRestaurantImageView(
                            imageUrl: restaurant.imageUrl,
                            size: 50
                        )
                        
                        VStack(alignment: .leading) {
                            Text(restaurant.name)
                                .font(.headline)
                            Text(restaurant.cuisineType)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Section(header: Text("Your Review")) {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Rating")
                            .font(.headline)
                        
                        HStack(spacing: 8) {
                            ForEach(1...5, id: \.self) { index in
                                Button(action: {
                                    rating = index
                                }) {
                                    Image(systemName: index <= rating ? "star.fill" : "star")
                                        .foregroundColor(index <= rating ? .yellow : .gray)
                                        .font(.title2)
                                }
                            }
                            
                            Spacer()
                            
                            Text("\(rating) \(rating == 1 ? "star" : "stars")")
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Comment (Optional)")
                            .font(.headline)
                        
                        TextField("Share your experience...", text: $comment, axis: .vertical)
                            .lineLimit(5...10)
                    }
                }
                
                if let errorMessage = errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Add Review")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Submit") {
                        Task {
                            await submitReview()
                        }
                    }
                    .disabled(isLoading)
                }
            }
            .alert("Review Submitted!", isPresented: $showingSuccess) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Thank you for your review!")
            }
        }
    }
    
    private func submitReview() async {
        isLoading = true
        errorMessage = nil
        
        let request = CreateReviewRequest(
            restaurantId: restaurant.id,
            rating: rating,
            comment: comment.isEmpty ? nil : comment
        )
        
        do {
            _ = try await apiService.createReview(request: request)
            showingSuccess = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

#Preview {
    AddReviewView(restaurant: Restaurant(
        id: 1,
        name: "Loading...",
        address: "Loading...",
        phoneNumber: "Loading...",
        description: "Loading...",
        tableCount: 0,
        cuisineType: "Loading...",
        rating: 0.0,
        isFeatured: false,
        priceRange: "Loading...",
        openingTime: "00:00:00",
        closingTime: "23:59:59",
        imageUrl: nil,
        reservationFee: 0.0  // Will be loaded from API
    ))
    .environmentObject(APIService.shared)
}
