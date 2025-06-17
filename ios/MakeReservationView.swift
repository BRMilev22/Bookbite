import SwiftUI

struct MakeReservationView: View {
    let restaurant: Restaurant
    let tables: [Table]
    
    @State private var selectedTable: Table?
    @State private var selectedDate = Date()
    @State private var selectedTime = Date()
    @State private var partySize = 2
    @State private var specialRequests = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingSuccess = false
    
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var apiService: APIService
    
    private var availableTables: [Table] {
        tables.filter { $0.isAvailable }
    }
    
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
                            Text(restaurant.address)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Section(header: Text("Table Selection")) {
                    if availableTables.isEmpty {
                        Text("No tables available")
                            .foregroundColor(.secondary)
                    } else {
                        ForEach(availableTables) { table in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text("Table \(table.tableNumber)")
                                        .font(.headline)
                                    Text("Capacity: \(table.capacity) people")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                if selectedTable?.id == table.id {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(.orange)
                                }
                            }
                            .contentShape(Rectangle())
                            .onTapGesture {
                                selectedTable = table
                            }
                        }
                    }
                }
                
                Section(header: Text("Reservation Details")) {
                    DatePicker("Date", selection: $selectedDate, in: Date()..., displayedComponents: .date)
                    
                    DatePicker("Time", selection: $selectedTime, displayedComponents: .hourAndMinute)
                    
                    Stepper("Party Size: \(partySize)", value: $partySize, in: 1...20)
                    
                    TextField("Special Requests (Optional)", text: $specialRequests, axis: .vertical)
                        .lineLimit(3...6)
                }
                
                if let errorMessage = errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Make Reservation")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Reserve") {
                        Task {
                            await makeReservation()
                        }
                    }
                    .disabled(selectedTable == nil || isLoading)
                }
            }
            .alert("Reservation Successful!", isPresented: $showingSuccess) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Your reservation has been submitted. You will receive a confirmation email shortly.")
            }
        }
    }
    
    private func makeReservation() async {
        guard let table = selectedTable else { return }
        
        isLoading = true
        errorMessage = nil
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let reservationDate = dateFormatter.string(from: selectedDate)
        
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm"
        let reservationTime = timeFormatter.string(from: selectedTime)
        
        let request = CreateReservationRequest(
            restaurantId: restaurant.id,
            tableId: table.id,
            reservationDate: reservationDate,
            reservationTime: reservationTime,
            partySize: partySize,
            specialRequests: specialRequests.isEmpty ? nil : specialRequests
        )
        
        do {
            _ = try await apiService.createReservation(request: request)
            showingSuccess = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

#Preview {
    MakeReservationView(
        restaurant: Restaurant(
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
        ),
        tables: [
            Table(id: 1, restaurantId: 1, tableNumber: "1", capacity: 4, isAvailable: true),
            Table(id: 2, restaurantId: 1, tableNumber: "2", capacity: 2, isAvailable: true)
        ]
    )
    .environmentObject(APIService.shared)
}
