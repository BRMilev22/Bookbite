import SwiftUI

struct ReservationsView: View {
    @State private var reservations: [Reservation] = []
    @State private var restaurants: [Int: Restaurant] = [:] // Cache for restaurant data
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingCancelAlert = false
    @State private var reservationToCancel: Reservation?
    @State private var selectedStatus: String = "Upcoming"
    
    @EnvironmentObject var apiService: APIService
    
    private var statusCounts: (upcoming: Int, past: Int, pending: Int, cancelled: Int) {
        let upcoming = reservations.filter { $0.status.lowercased() == "confirmed" && !isPastReservation($0) }.count
        let past = reservations.filter { isPastReservation($0) }.count
        let pending = reservations.filter { $0.status.lowercased() == "pending" }.count
        let cancelled = reservations.filter { $0.status.lowercased() == "cancelled" }.count
        return (upcoming, past, pending, cancelled)
    }
    
    private var filteredReservations: [Reservation] {
        switch selectedStatus {
        case "Upcoming":
            return reservations.filter { $0.status.lowercased() == "confirmed" && !isPastReservation($0) }
        case "Past":
            return reservations.filter { isPastReservation($0) }
        case "Pending":
            return reservations.filter { $0.status.lowercased() == "pending" }
        case "Cancelled":
            return reservations.filter { $0.status.lowercased() == "cancelled" }
        default:
            return reservations
        }
    }
    
    private func isPastReservation(_ reservation: Reservation) -> Bool {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let reservationDate = formatter.date(from: reservation.date) else { return false }
        
        // Get today's date without time
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let reservationDateOnly = calendar.startOfDay(for: reservationDate)
        
        return reservationDateOnly < today
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                VStack(spacing: 20) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("My Reservations")
                                .font(.system(size: 28, weight: .bold, design: .default))
                                .foregroundColor(.primary)
                            Text("Manage and track all your dining experiences in one place")
                                .font(.system(size: 16))
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                    }
                    
                    // Status Cards
                    HStack(spacing: 12) {
                        StatusCard(title: "Upcoming", count: statusCounts.upcoming, color: Color(red: 0.31, green: 0.27, blue: 0.9), systemImage: "calendar")
                        StatusCard(title: "Past Visits", count: statusCounts.past, color: Color(red: 0.0, green: 0.7, blue: 0.4), systemImage: "checkmark.circle.fill")
                        StatusCard(title: "Pending", count: statusCounts.pending, color: Color(red: 1.0, green: 0.6, blue: 0.0), systemImage: "clock.fill")
                        StatusCard(title: "Cancelled", count: statusCounts.cancelled, color: Color(red: 0.96, green: 0.26, blue: 0.21), systemImage: "xmark.circle.fill")
                    }
                }
                .padding(20)
                .background(Color(UIColor.systemBackground))
                
                // Status Filter Tabs
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(["Upcoming", "Past", "Pending", "Cancelled"], id: \.self) { status in
                            Button(action: { 
                                withAnimation(.easeInOut(duration: 0.2)) {
                                    selectedStatus = status 
                                }
                            }) {
                                Text(status)
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(selectedStatus == status ? .white : Color(red: 0.31, green: 0.27, blue: 0.9))
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 10)
                                    .background(
                                        selectedStatus == status ? 
                                        Color(red: 0.31, green: 0.27, blue: 0.9) : 
                                        Color.clear
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 25)
                                            .stroke(Color(red: 0.31, green: 0.27, blue: 0.9), lineWidth: selectedStatus == status ? 0 : 1)
                                    )
                                    .cornerRadius(25)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                        Spacer()
                    }
                    .padding(.horizontal, 20)
                }
                .padding(.bottom, 16)
                .background(Color(UIColor.systemBackground))
                
                // Search Bar
                HStack(spacing: 12) {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                        .font(.system(size: 16))
                    TextField("Search by restaurant name or date...", text: .constant(""))
                        .textFieldStyle(PlainTextFieldStyle())
                        .font(.system(size: 16))
                }
                .padding(16)
                .background(Color(UIColor.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
                
                // Content
                if isLoading {
                    ProgressView("Loading reservations...")
                        .font(.system(size: 16))
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = errorMessage {
                    VStack(spacing: 20) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .font(.system(size: 60))
                            .foregroundColor(Color(red: 1.0, green: 0.6, blue: 0.0))
                        
                        Text("Error")
                            .font(.system(size: 24, weight: .semibold))
                        
                        Text(errorMessage)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                            .font(.system(size: 16))
                        
                        Button("Retry") {
                            Task {
                                await loadReservations()
                            }
                        }
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color(red: 0.31, green: 0.27, blue: 0.9))
                        .cornerRadius(8)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if filteredReservations.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "calendar")
                            .font(.system(size: 60))
                            .foregroundColor(.secondary)
                        
                        Text("No \(selectedStatus) Reservations")
                            .font(.system(size: 24, weight: .semibold))
                        
                        Text("You don't have any \(selectedStatus.lowercased()) reservations.")
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                            .font(.system(size: 16))
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 20) {
                            ForEach(filteredReservations) { reservation in
                                ReservationCard(
                                    reservation: reservation,
                                    restaurant: restaurants[reservation.restaurantId],
                                    onCancel: {
                                        reservationToCancel = reservation
                                        showingCancelAlert = true
                                    }
                                )
                            }
                        }
                        .padding(20)
                    }
                    .refreshable {
                        await loadReservations()
                    }
                }
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationBarHidden(true)
            .task {
                await loadReservations()
            }
            .alert("Cancel Reservation", isPresented: $showingCancelAlert) {
                Button("Cancel Reservation", role: .destructive) {
                    if let reservation = reservationToCancel {
                        Task {
                            await cancelReservation(reservation)
                        }
                    }
                }
                Button("Keep Reservation", role: .cancel) { }
            } message: {
                Text("Are you sure you want to cancel this reservation? This action cannot be undone.")
            }
        }
    }
    
    private func loadReservations() async {
        isLoading = true
        errorMessage = nil
        
        do {
            reservations = try await apiService.getUserReservations()
            
            // Load restaurant details for each reservation
            await loadRestaurantDetails()
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    private func loadRestaurantDetails() async {
        // Get unique restaurant IDs
        let restaurantIds = Set(reservations.map { $0.restaurantId })
        
        // Load restaurant details for IDs we don't have cached
        for restaurantId in restaurantIds {
            if restaurants[restaurantId] == nil {
                do {
                    let restaurant = try await apiService.getRestaurant(id: restaurantId)
                    restaurants[restaurantId] = restaurant
                } catch {
                    print("Failed to load restaurant \(restaurantId): \(error)")
                }
            }
        }
    }
    
    private func cancelReservation(_ reservation: Reservation) async {
        do {
            _ = try await apiService.cancelReservation(id: reservation.id)
            await loadReservations() // Reload to reflect changes
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct StatusCard: View {
    let title: String
    let count: Int
    let color: Color
    let systemImage: String
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: systemImage)
                    .foregroundColor(color)
                    .font(.system(size: 18, weight: .medium))
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text("\(count)")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(16)
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 2)
    }
}

struct ReservationCard: View {
    let reservation: Reservation
    let restaurant: Restaurant?
    let onCancel: () -> Void
    
    private var statusColor: Color {
        switch reservation.status.lowercased() {
        case "confirmed":
            return Color(red: 0.0, green: 0.7, blue: 0.4) // Green
        case "pending":
            return Color(red: 1.0, green: 0.6, blue: 0.0) // Orange
        case "cancelled":
            return Color(red: 0.96, green: 0.26, blue: 0.21) // Red
        default:
            return Color.secondary
        }
    }
    
    private var paymentStatusColor: Color {
        switch reservation.paymentStatus.lowercased() {
        case "paid":
            return Color(red: 0.0, green: 0.7, blue: 0.4)
        case "pending":
            return Color(red: 1.0, green: 0.6, blue: 0.0)
        case "refunded":
            return Color(red: 0.96, green: 0.26, blue: 0.21)
        default:
            return Color.secondary
        }
    }
    
    private var canCancel: Bool {
        reservation.status.lowercased() == "confirmed" || reservation.status.lowercased() == "pending"
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Restaurant Image and Date Badge
            ZStack {
                AsyncImage(url: URL(string: restaurant?.imageUrl ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(LinearGradient(
                            gradient: Gradient(colors: [Color.gray.opacity(0.3), Color.gray.opacity(0.1)]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))
                        .overlay(
                            Image(systemName: "fork.knife")
                                .foregroundColor(.white)
                                .font(.system(size: 24, weight: .medium))
                        )
                }
                .frame(height: 140)
                .clipped()
                
                // Date badge overlay
                VStack {
                    HStack {
                        Text(formatDateForBadge(reservation.date))
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.black.opacity(0.7))
                            .cornerRadius(16)
                        Spacer()
                    }
                    Spacer()
                }
                .padding(16)
            }
            
            // Restaurant Info and Status
            VStack(spacing: 16) {
                // Header with restaurant name and status
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(restaurant?.name ?? "Unknown Restaurant")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.primary)
                            .lineLimit(2)
                        
                        if let address = restaurant?.address {
                            HStack(spacing: 4) {
                                Image(systemName: "location.fill")
                                    .foregroundColor(.secondary)
                                    .font(.system(size: 12))
                                Text(address)
                                    .font(.system(size: 14))
                                    .foregroundColor(.secondary)
                                    .lineLimit(1)
                            }
                        }
                    }
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(reservation.status.capitalized)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(statusColor)
                            .cornerRadius(16)
                        
                        if !reservation.paymentStatus.isEmpty {
                            Text(reservation.paymentStatus.capitalized)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(paymentStatusColor)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(paymentStatusColor.opacity(0.1))
                                .cornerRadius(12)
                        }
                    }
                }
                
                // Reservation details
                VStack(spacing: 12) {
                    HStack(spacing: 20) {
                        // Time
                        HStack(spacing: 6) {
                            Image(systemName: "clock.fill")
                                .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                .font(.system(size: 14))
                            Text(reservation.startTime)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.primary)
                        }
                        
                        // Guests
                        HStack(spacing: 6) {
                            Image(systemName: "person.2.fill")
                                .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                .font(.system(size: 14))
                            Text("\(reservation.guestCount) guests")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.primary)
                        }
                        
                        Spacer()
                        
                        // Table
                        HStack(spacing: 6) {
                            Image(systemName: "tablecells.fill")
                                .foregroundColor(Color(red: 0.31, green: 0.27, blue: 0.9))
                                .font(.system(size: 14))
                            Text("Table #\(reservation.tableId)")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.primary)
                        }
                    }
                    
                    // Special Requests
                    if let specialRequests = reservation.specialRequests, !specialRequests.isEmpty {
                        HStack {
                            Text("Special Requests:")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.primary)
                            Text(specialRequests)
                                .font(.system(size: 14))
                                .foregroundColor(.secondary)
                                .lineLimit(2)
                            Spacer()
                        }
                        .padding(.top, 4)
                    }
                }
                
                // Action Button
                if canCancel {
                    HStack {
                        Spacer()
                        Button("Cancel Reservation") {
                            onCancel()
                        }
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(Color(red: 0.96, green: 0.26, blue: 0.21))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color(red: 0.96, green: 0.26, blue: 0.21).opacity(0.1))
                        .cornerRadius(8)
                    }
                    .padding(.top, 8)
                }
            }
            .padding(20)
        }
        .background(Color.white)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.08), radius: 12, x: 0, y: 4)
    }
    
    private func formatDateForBadge(_ dateString: String) -> String {
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "yyyy-MM-dd"
        
        let outputFormatter = DateFormatter()
        outputFormatter.dateFormat = "MMM d"
        
        if let date = inputFormatter.date(from: dateString) {
            return outputFormatter.string(from: date)
        } else {
            return dateString
        }
    }
}

#Preview {
    ReservationsView()
        .environmentObject(APIService.shared)
}
