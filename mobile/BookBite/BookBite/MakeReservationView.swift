import SwiftUI

struct MakeReservationView: View {
    let restaurant: Restaurant
    let tables: [Table]
    
    @State private var selectedTable: Table?
    @State private var selectedDate = Date()
    @State private var selectedTime = Date()
    @State private var partySize = 2
    @State private var specialRequests = ""
    @State private var phoneNumber = ""
    @State private var email = ""
    @State private var paymentMethod = "cash"
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingSuccess = false
    @State private var showingPayment = false
    @State private var paymentProcessed = false
    
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var apiService: APIService
    @EnvironmentObject var authManager: AuthenticationManager
    
    private var availableTables: [Table] {
        tables.filter { $0.isAvailable }
    }
    
    private var isFormValid: Bool {
        selectedTable != nil && 
        !phoneNumber.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        !email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        email.contains("@") &&
        partySize >= 1 &&
        selectedDate >= Calendar.current.startOfDay(for: Date())
    }
    
    var body: some View {
        NavigationView {
            Form {
                restaurantSection
                tableSelectionSection
                reservationDetailsSection
                contactInformationSection
                paymentMethodSection
                errorSection
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
                        if paymentMethod == "card" {
                            showingPayment = true
                        } else {
                            Task {
                                await makeReservation()
                            }
                        }
                    }
                    .disabled(!isFormValid || isLoading)
                }
            }
            .alert("Reservation Successful!", isPresented: $showingSuccess) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Your reservation has been submitted. You will receive a confirmation email shortly.")
            }
            .sheet(isPresented: $showingPayment) {
                PaymentView(
                    tableCapacity: selectedTable?.capacity ?? 2,
                    onPaymentComplete: {
                        showingPayment = false
                        paymentProcessed = true
                        Task {
                            await makeReservation()
                        }
                    },
                    onCancel: {
                        showingPayment = false
                    }
                )
            }
            .onAppear {
                prefillUserData()
            }
        }
    }
    
    private func prefillUserData() {
        if let user = authManager.currentUser {
            email = user.email
            phoneNumber = user.phoneNumber ?? ""
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
            userId: nil, // Will be set by the backend from auth token
            restaurantId: restaurant.id,
            tableId: table.id,
            date: reservationDate,
            startTime: reservationTime,
            endTime: calculateEndTime(from: reservationTime),
            guestCount: partySize,
            specialRequests: specialRequests.isEmpty ? nil : specialRequests,
            phoneNumber: phoneNumber.trimmingCharacters(in: .whitespacesAndNewlines),
            email: email.trimmingCharacters(in: .whitespacesAndNewlines),
            totalAmount: paymentMethod == "card" ? restaurant.reservationFee : 0.0,
            paymentStatus: paymentMethod == "card" && paymentProcessed ? "completed" : "pending",
            paymentMethod: paymentMethod
        )
        
        do {
            _ = try await apiService.createReservation(request: request)
            showingSuccess = true
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    // Calculate end time by adding 1.5 hours to start time
    private func calculateEndTime(from startTime: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        
        guard let start = formatter.date(from: startTime) else {
            return startTime
        }
        
        // Add 1.5 hours (90 minutes) for typical dining duration
        let endTime = Calendar.current.date(byAdding: .minute, value: 90, to: start) ?? start
        return formatter.string(from: endTime)
    }
    
    // MARK: - View Components
    
    private var restaurantSection: some View {
        Section(header: Text("Restaurant")) {
            HStack {
                CircularRestaurantImageView(
                    imageUrl: restaurant.imageUrl,
                    size: 50
                )
                
                VStack(alignment: .leading) {
                    Text(restaurant.name)
                        .font(.headline)
                    Text(restaurant.address)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
    }
    
    private var tableSelectionSection: some View {
        Section(header: Text("Table Selection")) {
            if availableTables.isEmpty {
                Text("No tables available")
                    .foregroundColor(.secondary)
            } else {
                ForEach(availableTables) { table in
                    tableRowView(table: table)
                }
            }
        }
    }
    
    private func tableRowView(table: Table) -> some View {
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
    
    private var reservationDetailsSection: some View {
        Section(header: Text("Reservation Details")) {
            DatePicker("Date", selection: $selectedDate, in: Date()..., displayedComponents: .date)
            
            DatePicker("Time", selection: $selectedTime, displayedComponents: .hourAndMinute)
            
            Stepper("Party Size: \(partySize)", value: $partySize, in: 1...20)
            
            TextField("Special Requests (Optional)", text: $specialRequests, axis: .vertical)
                .lineLimit(3...6)
        }
    }
    
    private var contactInformationSection: some View {
        Section(header: Text("Contact Information")) {
            TextField("Phone Number *", text: $phoneNumber)
                .keyboardType(.phonePad)
                .textContentType(.telephoneNumber)
            
            TextField("Email Address *", text: $email)
                .keyboardType(.emailAddress)
                .textContentType(.emailAddress)
                .autocapitalization(.none)
        }
    }
    
    private var paymentMethodSection: some View {
        Section(header: Text("Payment Method")) {
            Picker("Payment Method", selection: $paymentMethod) {
                Text("Pay at Restaurant").tag("cash")
                Text("Pay with Card").tag("card")
            }
            .pickerStyle(.segmented)
            
            if paymentMethod == "card" {
                dynamicFeeDisplay
            }
        }
    }
    
    private var dynamicFeeDisplay: some View {
        VStack(alignment: .leading, spacing: 4) {
            if let table = selectedTable {
                let fee = calculateReservationFee(tableCapacity: table.capacity)
                Text("Reservation fee: $\(fee, specifier: "%.2f")")
                    .foregroundColor(.orange)
                    .font(.subheadline)
                Text("Table capacity: \(table.capacity) seats")
                    .foregroundColor(.secondary)
                    .font(.caption)
            } else {
                Text("Select a table to see fee")
                    .foregroundColor(.secondary)
                    .font(.subheadline)
            }
        }
    }
    
    @ViewBuilder
    private var errorSection: some View {
        if let errorMessage = errorMessage {
            Section {
                Text(errorMessage)
                    .foregroundColor(.red)
            }
        }
    }
    
    // MARK: - Helper Functions
    
    /// Calculate reservation fee based on table capacity
    /// Matches PaymentView logic for consistency
    private func calculateReservationFee(tableCapacity: Int) -> Double {
        switch tableCapacity {
        case 1...2:
            return 4.0  // Small tables (1-2 people): $4
        case 3...4:
            return 6.0  // Medium tables (3-4 people): $6
        case 5...6:
            return 9.0  // Large tables (5-6 people): $9
        default:
            return 12.0 // Extra large tables (7+ people): $12
        }
    }

    // MARK: - Private Functions
}

#Preview {
    MakeReservationView(
        restaurant: Restaurant(
            id: 1,
            name: "Sample Restaurant",
            address: "123 Main St",
            phoneNumber: "(555) 123-4567",
            description: "A great restaurant",
            tableCount: 10,
            cuisineType: "Italian",
            rating: 4.5,
            isFeatured: false,
            priceRange: "$$",
            openingTime: "11:00:00",
            closingTime: "22:00:00",
            imageUrl: nil,
            reservationFee: 25.0
        ),
        tables: [
            Table(id: 1, restaurantId: 1, tableNumber: "1", capacity: 4, isAvailable: true),
            Table(id: 2, restaurantId: 1, tableNumber: "2", capacity: 2, isAvailable: true)
        ]
    )
    .environmentObject(APIService.shared)
    .environmentObject(AuthenticationManager())
}
