import SwiftUI

// Helper extension for DateFormatter
extension DateFormatter {
    func apply(_ block: (DateFormatter) -> Void) -> DateFormatter {
        block(self)
        return self
    }
}

// Create alias to avoid SwiftUI Table conflict
typealias RestaurantTable = Table

struct RestaurantDetailView: View {
    let restaurant: Restaurant
    
    @State private var tables: [RestaurantTable] = []
    @State private var reviews: [Review] = []
    @State private var isLoading = false
    @State private var selectedTab = 0
    
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
                            .font(.system(size: 28, weight: .bold))
                            .fontWeight(.bold)
                        
                        Text(restaurant.cuisineType)
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                        
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
                                .foregroundColor(Color(red: 0.0, green: 0.7, blue: 0.4))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color(red: 0.0, green: 0.7, blue: 0.4).opacity(0.1))
                                .cornerRadius(8)
                        }
                        
                        Text(restaurant.description)
                            .font(.body)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    
                    // Contact Info Card
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Restaurant Information")
                            .font(.system(size: 18, weight: .semibold))
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Label(restaurant.address, systemImage: "location")
                            Label(restaurant.phoneNumber, systemImage: "phone")
                            Label("\(restaurant.openingTime) - \(restaurant.closingTime)", systemImage: "clock")
                        }
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    }
                    .padding(16)
                    .background(Color.white)
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                    
                    // Reserve Button - General
                    Button(action: {
                        selectedTab = 0 // Switch to tables tab to show available tables
                    }) {
                        Text("View Available Tables")
                            .frame(maxWidth: .infinity)
                            .padding(16)
                            .background(Color(red: 0.31, green: 0.27, blue: 0.9))
                            .foregroundColor(.white)
                            .font(.system(size: 16, weight: .semibold))
                            .cornerRadius(12)
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
                            TablesView(tables: tables, restaurant: restaurant)
                        } else {
                            ReviewsView(reviews: reviews, restaurant: restaurant)
                        }
                    }
                }
                .padding(16)
                .background(Color(red: 0.97, green: 0.97, blue: 0.98))
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await loadData()
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
    let tables: [RestaurantTable]
    let restaurant: Restaurant
    @State private var selectedTable: RestaurantTable?
    
    @EnvironmentObject var apiService: APIService
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Available Tables")
                .font(.system(size: 18, weight: .semibold))
            
            if tables.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "table.furniture")
                        .font(.system(size: 40))
                        .foregroundColor(.secondary)
                    
                    Text("No tables available")
                        .foregroundColor(.secondary)
                        .font(.system(size: 16))
                }
                .frame(maxWidth: .infinity)
                .padding(24)
                .background(Color.white)
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
            } else {
                VStack(spacing: 12) {
                    ForEach(tables) { table in
                        TableRowCard(table: table) {
                            selectedTable = table
                        }
                    }
                }
            }
        }
        .sheet(item: $selectedTable) { table in
            TableReservationView(table: table, restaurant: restaurant)
                .environmentObject(apiService)
        }
    }
}

struct TableRowCard: View {
    let table: RestaurantTable
    let onReserve: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            // Table Icon
            Image(systemName: "table.furniture")
                .font(.system(size: 24))
                .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                .frame(width: 40)
            
            // Table Info
            VStack(alignment: .leading, spacing: 4) {
                Text("Table \(table.tableNumber)")
                    .font(.system(size: 16, weight: .semibold))
                
                Text("\(table.capacity) seats")
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Status and Reserve Button
            VStack(alignment: .trailing, spacing: 8) {
                Text(table.isAvailable ? "Available for Booking" : "Occupied")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(table.isAvailable ? Color(red: 0.0, green: 0.7, blue: 0.4) : Color(red: 0.96, green: 0.26, blue: 0.21))
                    .cornerRadius(12)
                
                if table.isAvailable {
                    Button("Reserve") {
                        onReserve()
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(Color.white)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color(red: 0.31, green: 0.27, blue: 0.9), lineWidth: 1.5)
                    )
                    .cornerRadius(8)
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

struct ReviewsView: View {
    let reviews: [Review]
    let restaurant: Restaurant
    @State private var showingAddReview = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Reviews")
                    .font(.system(size: 18, weight: .semibold))
                
                Spacer()
                
                Button("Add Review") {
                    showingAddReview = true
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
            }
            
            if reviews.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "star.bubble")
                        .font(.system(size: 40))
                        .foregroundColor(.secondary)
                    
                    Text("No reviews yet")
                        .foregroundColor(.secondary)
                        .font(.system(size: 16))
                    
                    Text("Be the first to review this restaurant!")
                        .foregroundColor(.secondary)
                        .font(.system(size: 14))
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(24)
                .background(Color.white)
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
            } else {
                VStack(spacing: 12) {
                    ForEach(reviews) { review in
                        ReviewCard(review: review)
                    }
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
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(review.user?.firstName ?? "Anonymous") \(review.user?.lastName ?? "User")")
                        .font(.system(size: 16, weight: .semibold))
                    
                    if !review.createdAt.isEmpty {
                        Text(formatDate(review.createdAt))
                            .font(.system(size: 12))
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                HStack(spacing: 2) {
                    ForEach(0..<5) { index in
                        Image(systemName: index < review.rating ? "star.fill" : "star")
                            .foregroundColor(.yellow)
                            .font(.system(size: 12))
                    }
                }
            }
            
            if let comment = review.comment, !comment.isEmpty {
                Text(comment)
                    .font(.system(size: 14))
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
    
    private func formatDate(_ dateString: String) -> String {
        // Simple date formatting - you might want to improve this
        return dateString
    }
}

struct TableReservationView: View {
    let table: RestaurantTable
    let restaurant: Restaurant
    
    @State private var selectedDate = Date()
    @State private var startTime = ""
    @State private var endTime = ""
    @State private var guestCount = 2
    @State private var phoneNumber = ""
    @State private var email = ""
    @State private var specialRequests = ""
    @State private var paymentMethod = "card"
    @State private var isLoading = false
    @State private var showingSuccess = false
    @State private var showingError = false
    @State private var errorMessage = ""
    @State private var todaysReservations: [Reservation] = []
    @State private var isLoadingReservations = false
    @State private var userProfile: User?
    
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var apiService: APIService
    
    // Generate time slots dynamically based on restaurant hours
    private var timeSlots: [String] {
        generateTimeSlots(from: restaurant.openingTime, to: restaurant.closingTime)
    }
    
    // Generate time slots in 30-minute intervals between opening and closing times
    private func generateTimeSlots(from openingTime: String, to closingTime: String) -> [String] {
        print("🕐 Generating time slots from \(openingTime) to \(closingTime)")
        
        // Try multiple date formats to handle different time formats
        let formatters = [
            DateFormatter().apply { $0.dateFormat = "HH:mm:ss" },  // Format with seconds
            DateFormatter().apply { $0.dateFormat = "HH:mm" }      // Format without seconds
        ]
        
        var openTime: Date?
        var closeTime: Date?
        
        // Try to parse opening time with different formatters
        for formatter in formatters {
            if let parsed = formatter.date(from: openingTime) {
                openTime = parsed
                break
            }
        }
        
        // Try to parse closing time with different formatters
        for formatter in formatters {
            if let parsed = formatter.date(from: closingTime) {
                closeTime = parsed
                break
            }
        }
        
        guard let openTime = openTime, let closeTime = closeTime else {
            print("❌ Failed to parse opening time '\(openingTime)' or closing time '\(closingTime)'")
            print("⚠️ Restaurant hours are unavailable - no time slots generated")
            return []
        }
        
        let outputFormatter = DateFormatter()
        outputFormatter.dateFormat = "HH:mm"
        
        print("✅ Successfully parsed times: \(outputFormatter.string(from: openTime)) - \(outputFormatter.string(from: closeTime))")
        
        var slots: [String] = []
        var currentTime = openTime
        
        // Generate slots every 30 minutes until 1 hour before closing
        // (to allow for minimum 1-hour dining time)
        let lastSlotTime = Calendar.current.date(byAdding: .hour, value: -1, to: closeTime) ?? closeTime
        
        while currentTime <= lastSlotTime {
            slots.append(outputFormatter.string(from: currentTime))
            currentTime = Calendar.current.date(byAdding: .minute, value: 30, to: currentTime) ?? currentTime
        }
        
        print("✅ Generated \(slots.count) time slots: \(slots)")
        return slots
    }
    
    // Check if a time slot is reserved
    private func isTimeSlotReserved(_ timeSlot: String) -> Bool {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let selectedDateString = formatter.string(from: selectedDate)
        
        return todaysReservations.contains { reservation in
            // Check if reservation is for the selected date and table
            if reservation.date == selectedDateString && reservation.tableId == table.id {
                // Check if the time slot conflicts with existing reservation
                return isTimeInRange(timeSlot, start: reservation.startTime, end: reservation.endTime)
            }
            return false
        }
    }
    
    // Helper function to check if a time is within a range
    private func isTimeInRange(_ time: String, start: String, end: String) -> Bool {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        
        guard let timeDate = formatter.date(from: time),
              let startDate = formatter.date(from: start),
              let endDate = formatter.date(from: end) else {
            return false
        }
        
        return timeDate >= startDate && timeDate < endDate
    }
    
    // Get available time slots (non-reserved)
    private var availableTimeSlots: [String] {
        return timeSlots.filter { !isTimeSlotReserved($0) }
    }
    
    // Get available end times (after start time and within restaurant hours)
    private var availableEndTimes: [String] {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        
        guard let startDate = formatter.date(from: startTime) else {
            return []
        }
        
        // Parse closing time with multiple format support
        var closeTime: Date?
        let formatters = [
            DateFormatter().apply { $0.dateFormat = "HH:mm:ss" },
            DateFormatter().apply { $0.dateFormat = "HH:mm" }
        ]
        
        for timeFormatter in formatters {
            if let parsed = timeFormatter.date(from: restaurant.closingTime) {
                closeTime = parsed
                break
            }
        }
        
        guard let closeTime = closeTime else {
            return []
        }
        
        let availableSlots = timeSlots.filter { time in
            if let timeDate = formatter.date(from: time) {
                // End time must be after start time and not later than closing time
                return timeDate > startDate && timeDate <= closeTime
            }
            return false
        }
        
        print("🔧 Available end times for start time \(startTime): \(availableSlots)")
        return availableSlots
    }
    
    // Check if start time selection is disabled (no start time selected yet)
    private var isStartTimeSelectionDisabled: Bool {
        return false // Start time can always be selected
    }
    
    // Check if end time selection is disabled
    private var isEndTimeSelectionDisabled: Bool {
        return startTime.isEmpty || availableEndTimes.isEmpty
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 0) {
                    // Header
                    VStack(spacing: 16) {
                        Text("Make Reservation")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 24)
                    .background(Color(red: 0.31, green: 0.27, blue: 0.9))
                    
                    VStack(spacing: 20) {
                        // Date Selection
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "calendar")
                                    .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                Text("When would you like to dine?")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            
                            // Restaurant hours info
                            HStack {
                                Image(systemName: "clock")
                                    .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                    .font(.caption)
                                Text("Open \(restaurant.openingTime) - \(restaurant.closingTime)")
                                    .font(.system(size: 12))
                                    .foregroundColor(.secondary)
                                Spacer()
                            }
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color(red: 0.31, green: 0.27, blue: 0.9).opacity(0.05))
                            .cornerRadius(6)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Date")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.secondary)
                                
                                DatePicker("", selection: $selectedDate, displayedComponents: .date)
                                    .datePickerStyle(CompactDatePickerStyle())
                                    .onChange(of: selectedDate) { _ in
                                        Task {
                                            await loadReservationsForDate()
                                        }
                                    }
                            }
                            
                            HStack(spacing: 16) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Start Time")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.secondary)
                                    
                                    Menu {
                                        ForEach(timeSlots, id: \.self) { time in
                                            Button(action: {
                                                if !isTimeSlotReserved(time) {
                                                    startTime = time
                                                    // Update end time if current end time is not valid
                                                    updateEndTimeIfNeeded()
                                                }
                                            }) {
                                                HStack {
                                                    Text(time)
                                                    if isTimeSlotReserved(time) {
                                                        Text("(Reserved)")
                                                            .foregroundColor(.secondary)
                                                            .font(.caption)
                                                    }
                                                }
                                            }
                                            .disabled(isTimeSlotReserved(time))
                                        }
                                    } label: {
                                        HStack {
                                            Text(startTime.isEmpty ? "Select start time" : startTime)
                                                .foregroundColor(startTime.isEmpty ? .secondary : .primary)
                                            Spacer()
                                            Image(systemName: "chevron.down")
                                                .font(.caption)
                                        }
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(8)
                                    }
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("End Time")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(isEndTimeSelectionDisabled ? .gray : .secondary)
                                    
                                    if isEndTimeSelectionDisabled {
                                        HStack {
                                            Text(startTime.isEmpty ? "Select start time first" : "No available end times")
                                                .foregroundColor(.secondary)
                                            Spacer()
                                        }
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
                                        .background(Color.gray.opacity(0.05))
                                        .cornerRadius(8)
                                    } else {
                                        Menu {
                                            ForEach(availableEndTimes, id: \.self) { time in
                                                Button(action: {
                                                    endTime = time
                                                }) {
                                                    Text(time)
                                                }
                                            }
                                        } label: {
                                            HStack {
                                                Text(endTime.isEmpty ? "Select end time" : endTime)
                                                    .foregroundColor(endTime.isEmpty ? .secondary : .primary)
                                                Spacer()
                                                Image(systemName: "chevron.down")
                                                    .font(.caption)
                                            }
                                            .padding(.horizontal, 12)
                                            .padding(.vertical, 8)
                                            .background(Color.gray.opacity(0.1))
                                            .cornerRadius(8)
                                        }
                                    }
                                }
                            }
                        }
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(12)
                        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                        
                        // Today's Reservations
                        if isToday(selectedDate) && !todaysReservations.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Image(systemName: "calendar.badge.clock")
                                        .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                    Text("Today's Reservations")
                                        .font(.system(size: 16, weight: .semibold))
                                }
                                
                                if isLoadingReservations {
                                    HStack {
                                        ProgressView()
                                            .scaleEffect(0.8)
                                        Text("Loading reservations...")
                                            .font(.system(size: 14))
                                            .foregroundColor(.secondary)
                                    }
                                    .padding(12)
                                } else {
                                    let tableReservations = todaysReservations.filter { $0.tableId == table.id }
                                    
                                    if tableReservations.isEmpty {
                                        Text("No reservations for this table today")
                                            .font(.system(size: 14))
                                            .foregroundColor(.secondary)
                                            .padding(12)
                                    } else {
                                        ForEach(tableReservations) { reservation in
                                            HStack {
                                                VStack(alignment: .leading, spacing: 4) {
                                                    Text("Table \(table.tableNumber)")
                                                        .font(.system(size: 14, weight: .medium))
                                                    Text("\(reservation.startTime) - \(reservation.endTime)")
                                                        .font(.system(size: 12))
                                                        .foregroundColor(.secondary)
                                                }
                                                
                                                Spacer()
                                                
                                                Text("Booked")
                                                    .font(.system(size: 12, weight: .medium))
                                                    .foregroundColor(.white)
                                                    .padding(.horizontal, 8)
                                                    .padding(.vertical, 4)
                                                    .background(Color(red: 0.96, green: 0.26, blue: 0.21))
                                                    .cornerRadius(8)
                                            }
                                            .padding(12)
                                            .background(Color.gray.opacity(0.05))
                                            .cornerRadius(8)
                                        }
                                    }
                                }
                            }
                            .padding(16)
                            .background(Color.white)
                            .cornerRadius(12)
                            .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                        }
                        
                        // Table Selection
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "table.furniture")
                                    .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                Text("Your Table")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Table \(table.tableNumber)")
                                        .font(.system(size: 16, weight: .medium))
                                    Text("Seats up to \(table.capacity) guests")
                                        .font(.system(size: 14))
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                Text("\(table.capacity) seats")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color(red: 0.31, green: 0.27, blue: 0.9))
                                    .cornerRadius(8)
                            }
                            .padding(12)
                            .background(Color.gray.opacity(0.05))
                            .cornerRadius(8)
                        }
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(12)
                        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                        
                        // Guest Information
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "person.2")
                                    .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                Text("Guest Information")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            
                            HStack(spacing: 16) {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Number of Guests")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.secondary)
                                    
                                    Picker("Guests", selection: $guestCount) {
                                        ForEach(1...table.capacity, id: \.self) { count in
                                            Text("\(count) Guest\(count == 1 ? "" : "s")").tag(count)
                                        }
                                    }
                                    .pickerStyle(MenuPickerStyle())
                                    .frame(maxWidth: .infinity)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(Color.gray.opacity(0.1))
                                    .cornerRadius(8)
                                }
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Phone Number")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.secondary)
                                    
                                    TextField("Your phone number", text: $phoneNumber)
                                        .keyboardType(.phonePad)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
                                        .background(Color.gray.opacity(0.1))
                                        .cornerRadius(8)
                                }
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Email Address")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.secondary)
                                
                                TextField("Your email address", text: $email)
                                    .keyboardType(.emailAddress)
                                    .textInputAutocapitalization(.never)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(Color.gray.opacity(0.1))
                                    .cornerRadius(8)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Special Requests (Optional)")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.secondary)
                                
                                TextField("Any special dietary requirements, celebrations, or other requests...", text: $specialRequests, axis: .vertical)
                                    .lineLimit(3...5)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(Color.gray.opacity(0.1))
                                    .cornerRadius(8)
                            }
                        }
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(12)
                        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                        
                        // Payment Information
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "creditcard")
                                    .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                Text("Payment Information")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Text("Reservation Fee")
                                        .font(.system(size: 14, weight: .medium))
                                    Spacer()
                                    Text("$\(String(format: "%.2f", restaurant.reservationFee))")
                                        .font(.system(size: 18, weight: .bold))
                                        .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                }
                                .padding(12)
                                .background(Color.gray.opacity(0.05))
                                .cornerRadius(8)
                                
                                Text("Required to secure your booking - Table capacity: \(table.capacity)")
                                    .font(.system(size: 12))
                                    .foregroundColor(.secondary)
                                
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Payment Method")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.secondary)
                                    
                                    HStack(spacing: 12) {
                                        Button(action: { paymentMethod = "card" }) {
                                            HStack {
                                                Image(systemName: paymentMethod == "card" ? "checkmark.circle.fill" : "circle")
                                                    .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                                
                                                VStack(alignment: .leading, spacing: 2) {
                                                    Text("Credit/Debit Card")
                                                        .font(.system(size: 14, weight: .medium))
                                                    Text("Pay now securely online")
                                                        .font(.system(size: 12))
                                                        .foregroundColor(.secondary)
                                                }
                                                
                                                Spacer()
                                            }
                                            .padding(12)
                                            .background(paymentMethod == "card" ? Color(red: 0.31, green: 0.27, blue: 0.9).opacity(0.1) : Color.clear)
                                            .cornerRadius(8)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                        
                                        Button(action: { paymentMethod = "restaurant" }) {
                                            HStack {
                                                Image(systemName: paymentMethod == "restaurant" ? "checkmark.circle.fill" : "circle")
                                                    .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                                
                                                VStack(alignment: .leading, spacing: 2) {
                                                    Text("Pay at Restaurant")
                                                        .font(.system(size: 14, weight: .medium))
                                                    Text("Pay when you arrive")
                                                        .font(.system(size: 12))
                                                        .foregroundColor(.secondary)
                                                }
                                                
                                                Spacer()
                                            }
                                            .padding(12)
                                            .background(paymentMethod == "restaurant" ? Color(red: 0.31, green: 0.27, blue: 0.9).opacity(0.1) : Color.clear)
                                            .cornerRadius(8)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                    }
                                }
                            }
                        }
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(12)
                        .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
                        
                        // Reserve Button
                        Button(action: {
                            Task {
                                await makeReservation()
                            }
                        }) {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .scaleEffect(0.8)
                                } else {
                                    Text("Confirm Reservation")
                                        .font(.system(size: 16, weight: .semibold))
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color(red: 0.31, green: 0.27, blue: 0.9))
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        .disabled(isLoading || startTime.isEmpty || endTime.isEmpty || timeSlots.isEmpty)
                        .opacity((isLoading || startTime.isEmpty || endTime.isEmpty || timeSlots.isEmpty) ? 0.6 : 1.0)
                    }
                    .padding(16)
                }
            }
            .background(Color(red: 0.97, green: 0.97, blue: 0.98))
            .navigationBarHidden(true)
        }
        .alert("Reservation Confirmed!", isPresented: $showingSuccess) {
            Button("OK") {
                dismiss()
            }
        } message: {
            Text("Your reservation has been confirmed. You will receive a confirmation email shortly.")
        }
        .alert("Error", isPresented: $showingError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
        .onAppear {
            // Ensure view is immediately visible
            isLoadingReservations = false
            setDefaultTimes()
            Task {
                await loadUserProfile()
            }
        }
        .task {
            // Ensure the view renders first, then load data
            isLoadingReservations = false
            await loadReservationsForDate()
            setDefaultTimes()
        }
        .onChange(of: selectedDate) { _, _ in
            Task {
                await loadReservationsForDate()
                // Reset times when date changes since availability might change
                startTime = ""
                endTime = ""
                setDefaultTimes()
            }
        }
    }
    
    private func isToday(_ date: Date) -> Bool {
        Calendar.current.isDateInToday(date)
    }
    
    private func updateEndTimeIfNeeded() {
        // If current end time is not valid (not after start time), set it to the first available slot
        if !availableEndTimes.contains(endTime) {
            if let firstAvailableEndTime = availableEndTimes.first {
                endTime = firstAvailableEndTime
            } else {
                endTime = ""
            }
        }
    }
    
    private func setDefaultTimes() {
        // Set default start time to first available slot if not already set
        if startTime.isEmpty {
            let availableSlots = timeSlots.filter { !isTimeSlotReserved($0) }
            print("🔧 Available time slots: \(availableSlots)")
            
            if let firstAvailableStartTime = availableSlots.first {
                print("✅ Setting default start time to: \(firstAvailableStartTime)")
                startTime = firstAvailableStartTime
                updateEndTimeIfNeeded()
            } else {
                print("❌ No available start times found!")
            }
        }
    }
    
    private func loadReservationsForDate() async {
        isLoadingReservations = true
        
        do {
            // Format the selected date for API call
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            let dateString = formatter.string(from: selectedDate)
            
            // Add timeout to prevent hanging when backend is down
            let tablesWithReservations = try await withTimeout(seconds: 5) {
                try await apiService.getTablesWithReservations(restaurantId: restaurant.id)
            }
            
            // Find the current table and get its reservations for the selected date
            if let tableWithReservations = tablesWithReservations.first(where: { $0.id == table.id }) {
                // Filter reservations for the selected date and exclude cancelled ones
                let dateReservations = tableWithReservations.reservations.filter { reservation in
                    reservation.date == dateString && reservation.status.lowercased() != "cancelled"
                }
                
                // Convert TableReservation to Reservation for compatibility
                todaysReservations = dateReservations.map { tableReservation in
                    Reservation(
                        id: tableReservation.id,
                        userId: 0, // Not provided in this API
                        tableId: table.id,
                        restaurantId: restaurant.id,
                        date: tableReservation.date,
                        startTime: tableReservation.startTime,
                        endTime: tableReservation.endTime,
                        guestCount: tableReservation.guestCount,
                        status: tableReservation.status,
                        specialRequests: nil,
                        phoneNumber: nil,
                        email: nil,
                        totalAmount: 0.0,
                        paymentStatus: "unknown",
                        paymentMethod: nil,
                        restaurantName: nil
                    )
                }
            } else {
                todaysReservations = []
            }
        } catch {
            print("Failed to load reservations: \(error)")
            // Provide fallback behavior when backend is unavailable
            todaysReservations = []
        }
        
        isLoadingReservations = false
        
        // Update default times based on new reservation data
        DispatchQueue.main.async {
            setDefaultTimes()
        }
    }
    
    // Helper function to add timeout to async operations
    private func withTimeout<T>(seconds: TimeInterval, operation: @escaping () async throws -> T) async throws -> T {
        return try await withThrowingTaskGroup(of: T.self) { group in
            group.addTask {
                try await operation()
            }
            
            group.addTask {
                try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
                throw URLError(.timedOut)
            }
            
            guard let result = try await group.next() else {
                throw URLError(.timedOut)
            }
            
            group.cancelAll()
            return result
        }
    }
    
    private func makeReservation() async {
        isLoading = true
        
        do {
            // Format the selected date for the API
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd"
            let dateString = formatter.string(from: selectedDate)
            
            // Create the reservation request
            let request = CreateReservationRequest(
                userId: nil, // Will be set by the backend from auth token
                restaurantId: table.restaurantId,
                tableId: table.id,
                date: dateString,
                startTime: startTime,
                endTime: endTime,
                guestCount: guestCount,
                specialRequests: specialRequests.isEmpty ? nil : specialRequests,
                phoneNumber: phoneNumber.isEmpty ? (userProfile?.phoneNumber ?? "") : phoneNumber,
                email: email.isEmpty ? (userProfile?.email ?? "") : email,
                totalAmount: restaurant.reservationFee,
                paymentStatus: "pending",
                paymentMethod: paymentMethod
            )
            
            // Make the API call
            let _ = try await apiService.createReservation(request: request)
            
            // Success - show confirmation
            isLoading = false
            showingSuccess = true
            
        } catch {
            // Handle error
            isLoading = false
            errorMessage = "Failed to create reservation: \(error.localizedDescription)"
            showingError = true
            print("Failed to create reservation: \(error)")
        }
    }
    
    // Load user profile to populate contact information
    private func loadUserProfile() async {
        do {
            userProfile = try await apiService.getCurrentUser()
            // Auto-populate contact info if available
            if let profile = userProfile {
                email = profile.email
                phoneNumber = profile.phoneNumber ?? ""
            }
        } catch {
            print("Failed to load user profile: \(error)")
            // Don't show error to user - they can still enter info manually
        }
    }
}

#Preview {
    RestaurantDetailView(restaurant: Restaurant(
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
