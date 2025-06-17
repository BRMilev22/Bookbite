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
                        AsyncImage(url: URL(string: restaurant.imageUrl ?? "")) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                        }
                        .frame(width: 50, height: 50)
                        .cornerRadius(8)
                        .clipped()
                        
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
