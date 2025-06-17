import SwiftUI

struct ReservationsView: View {
    @State private var reservations: [Reservation] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingCancelAlert = false
    @State private var reservationToCancel: Reservation?
    
    @EnvironmentObject var apiService: APIService
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading reservations...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let errorMessage = errorMessage {
                    VStack(spacing: 16) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .font(.system(size: 50))
                            .foregroundColor(.orange)
                        
                        Text("Error")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text(errorMessage)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                        
                        Button("Retry") {
                            Task {
                                await loadReservations()
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.large)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if reservations.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "calendar")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)
                        
                        Text("No Reservations")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("You don't have any reservations yet. Start exploring restaurants to make your first booking!")
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(reservations) { reservation in
                            ReservationRow(
                                reservation: reservation,
                                onCancel: {
                                    reservationToCancel = reservation
                                    showingCancelAlert = true
                                }
                            )
                        }
                    }
                    .listStyle(PlainListStyle())
                    .refreshable {
                        await loadReservations()
                    }
                }
            }
            .navigationTitle("My Reservations")
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
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
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

struct ReservationRow: View {
    let reservation: Reservation
    let onCancel: () -> Void
    
    private var statusColor: Color {
        switch reservation.status.lowercased() {
        case "confirmed":
            return .green
        case "pending":
            return .orange
        case "cancelled":
            return .red
        default:
            return .gray
        }
    }
    
    private var canCancel: Bool {
        reservation.status.lowercased() == "confirmed" || reservation.status.lowercased() == "pending"
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Restaurant Info
            HStack {
                AsyncImage(url: URL(string: reservation.restaurant?.imageUrl ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .overlay(
                            Image(systemName: "fork.knife")
                                .foregroundColor(.gray)
                        )
                }
                .frame(width: 60, height: 60)
                .cornerRadius(8)
                .clipped()
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(reservation.restaurant?.name ?? "Unknown Restaurant")
                        .font(.headline)
                        .lineLimit(1)
                    
                    Text(reservation.restaurant?.address ?? "")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                Spacer()
                
                VStack(alignment: .trailing) {
                    Text(reservation.status.capitalized)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundColor(statusColor)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(statusColor.opacity(0.1))
                        .cornerRadius(12)
                }
            }
            
            // Reservation Details
            VStack(spacing: 8) {
                HStack {
                    Label(formatDate(reservation.reservationDate), systemImage: "calendar")
                    Spacer()
                    Label(reservation.reservationTime, systemImage: "clock")
                }
                
                HStack {
                    Label("Table \(reservation.table?.tableNumber ?? "N/A")", systemImage: "square.grid.3x1.folder.badge.plus")
                    Spacer()
                    Label("\(reservation.partySize) \(reservation.partySize == 1 ? "person" : "people")", systemImage: "person.2")
                }
            }
            .font(.subheadline)
            .foregroundColor(.secondary)
            
            // Special Requests
            if let specialRequests = reservation.specialRequests, !specialRequests.isEmpty {
                Text("Special Requests: \(specialRequests)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.top, 4)
            }
            
            // Cancel Button
            if canCancel {
                HStack {
                    Spacer()
                    Button("Cancel Reservation") {
                        onCancel()
                    }
                    .font(.caption)
                    .foregroundColor(.red)
                }
            }
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
    }
    
    private func formatDate(_ dateString: String) -> String {
        let inputFormatter = DateFormatter()
        inputFormatter.dateFormat = "yyyy-MM-dd"
        
        let outputFormatter = DateFormatter()
        outputFormatter.dateFormat = "MMM d, yyyy"
        
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
