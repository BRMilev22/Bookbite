import SwiftUI

struct PaymentView: View {
    let tableCapacity: Int
    let onPaymentComplete: () -> Void
    let onCancel: () -> Void
    
    @State private var cardNumber: String = ""
    @State private var expiryDate: String = ""
    @State private var cvv: String = ""
    @State private var cardholderName: String = ""
    @State private var isProcessing: Bool = false
    @State private var showingSuccess: Bool = false
    
    // Calculate dynamic amount based on table capacity
    private var calculatedAmount: Double {
        calculateReservationFee(tableCapacity: tableCapacity)
    }
    
    // Fee description based on table size
    private var feeDescription: String {
        switch tableCapacity {
        case 1...2:
            return "Small table (1-2 people)"
        case 3...4:
            return "Medium table (3-4 people)"
        case 5...6:
            return "Large table (5-6 people)"
        default:
            return "Extra large table (7+ people)"
        }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    paymentSummarySection
                    
                    cardInformationSection
                    
                    securityNoticeSection
                    
                    paymentButtonSection
                    
                    Spacer()
                }
            }
            .navigationTitle("Payment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        onCancel()
                    }
                    .disabled(isProcessing)
                }
            }
            .alert("Payment Successful!", isPresented: $showingSuccess) {
                Button("Continue") {
                    onPaymentComplete()
                }
            } message: {
                Text("Your payment of $\(calculatedAmount, specifier: "%.2f") has been processed successfully.")
            }
        }
    }
    
    // MARK: - Fee Calculation
    
    /// Calculate reservation fee based on table capacity
    /// Matches the web version logic for consistency
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

    // MARK: - Computed Properties
    
    private var isPaymentFormValid: Bool {
        !cardholderName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        cardNumber.replacingOccurrences(of: " ", with: "").count >= 13 &&
        expiryDate.count == 5 &&
        cvv.count >= 3
    }
    
    // MARK: - Private Methods
    
    private func processPayment() {
        isProcessing = true
        
        // Simulate payment processing delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            isProcessing = false
            showingSuccess = true
        }
    }
    
    private func formatCardNumber(_ number: String) -> String {
        let digits = number.replacingOccurrences(of: " ", with: "").filter { $0.isNumber }
        let trimmed = String(digits.prefix(16))
        
        var formatted = ""
        for (index, character) in trimmed.enumerated() {
            if index > 0 && index % 4 == 0 {
                formatted += " "
            }
            formatted += String(character)
        }
        return formatted
    }
    
    private func formatExpiryDate(_ date: String) -> String {
        let digits = date.replacingOccurrences(of: "/", with: "").filter { $0.isNumber }
        let trimmed = String(digits.prefix(4))
        
        if trimmed.count >= 2 {
            let month = String(trimmed.prefix(2))
            let year = String(trimmed.dropFirst(2))
            return "\(month)/\(year)"
        }
        return trimmed
    }
    
    // MARK: - View Components
    
    private var paymentSummarySection: some View {
        VStack(spacing: 16) {
            Text("Payment Summary")
                .font(.title2)
                .fontWeight(.bold)
            
            VStack(spacing: 12) {
                HStack {
                    Text("Table Capacity:")
                        .font(.subheadline)
                    Spacer()
                    Text("\(tableCapacity) seats")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
                
                HStack {
                    Text("Table Type:")
                        .font(.subheadline)
                    Spacer()
                    Text(feeDescription)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.secondary)
                }
                
                Divider()
                
                HStack {
                    Text("Reservation Fee:")
                        .font(.headline)
                    Spacer()
                    Text("$\(calculatedAmount, specifier: "%.2f")")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.orange)
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .padding(.horizontal)
    }
    
    private var cardInformationSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Card Information")
                .font(.title2)
                .fontWeight(.bold)
                .padding(.horizontal)
            
            VStack(spacing: 16) {
                cardholderNameField
                cardNumberField
                expiryAndCvvFields
            }
            .padding(.horizontal)
        }
    }
    
    private var cardholderNameField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Cardholder Name")
                .font(.subheadline)
                .fontWeight(.medium)
            TextField("Enter name on card", text: $cardholderName)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .textContentType(.name)
                .autocapitalization(.words)
        }
    }
    
    private var cardNumberField: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Card Number")
                .font(.subheadline)
                .fontWeight(.medium)
            TextField("1234 5678 9012 3456", text: $cardNumber)
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.numberPad)
                .onChange(of: cardNumber) { _, newValue in
                    cardNumber = formatCardNumber(newValue)
                }
        }
    }
    
    private var expiryAndCvvFields: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Expiry Date")
                    .font(.subheadline)
                    .fontWeight(.medium)
                TextField("MM/YY", text: $expiryDate)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.numberPad)
                    .onChange(of: expiryDate) { _, newValue in
                        expiryDate = formatExpiryDate(newValue)
                    }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text("CVV")
                    .font(.subheadline)
                    .fontWeight(.medium)
                TextField("123", text: $cvv)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.numberPad)
                    .onChange(of: cvv) { _, newValue in
                        if newValue.count > 4 {
                            cvv = String(newValue.prefix(4))
                        }
                    }
            }
        }
    }
    
    private var securityNoticeSection: some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: "lock.shield.fill")
                    .foregroundColor(.green)
                Text("Secure Payment")
                    .font(.subheadline)
                    .fontWeight(.medium)
                Spacer()
            }
            
            Text("Demo payment processing. No real transactions will occur.")
                .font(.caption)
                .foregroundColor(.orange)
                .multilineTextAlignment(.leading)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .padding(.horizontal)
    }
    
    private var paymentButtonSection: some View {
        Button(action: processPayment) {
            HStack {
                if isProcessing {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                    Text("Processing...")
                } else {
                    Image(systemName: "creditcard.fill")
                    Text("Pay $\(calculatedAmount, specifier: "%.2f")")
                }
            }
            .font(.headline)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(isPaymentFormValid && !isProcessing ? Color.orange : Color.gray)
            .cornerRadius(12)
        }
        .disabled(!isPaymentFormValid || isProcessing)
        .padding(.horizontal)
    }
}

// MARK: - Preview

#Preview {
    PaymentView(
        tableCapacity: 4,
        onPaymentComplete: { print("Payment completed") },
        onCancel: { print("Payment cancelled") }
    )
}
