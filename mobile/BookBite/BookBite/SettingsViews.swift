import SwiftUI
import UserNotifications

// MARK: - App Info View
struct AppInfoView: View {
    var body: some View {
        NavigationView {
            List {
                Section("Application") {
                    InfoRow(title: "Version", value: "1.0.0")
                    InfoRow(title: "Build", value: "1")
                    InfoRow(title: "Developer", value: "BookBite Team")
                }
                
                Section("System") {
                    InfoRow(title: "iOS Version", value: UIDevice.current.systemVersion)
                    InfoRow(title: "Device", value: UIDevice.current.model)
                }
                
                Section("About BookBite") {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("BookBite is your ultimate restaurant reservation companion. Discover amazing restaurants, book tables instantly, and enjoy seamless dining experiences.")
                            .font(.body)
                            .foregroundColor(Theme.Colors.primaryText)
                        
                        Text("Features:")
                            .font(.headline)
                            .foregroundColor(Theme.Colors.primaryText)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            FeatureRow(text: "Browse and discover restaurants")
                            FeatureRow(text: "Real-time table availability")
                            FeatureRow(text: "Secure payment processing")
                            FeatureRow(text: "Review and rating system")
                            FeatureRow(text: "Reservation management")
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                Section("Legal") {
                    NavigationLink("Terms of Service") {
                        WebView(url: "https://example.com/terms")
                    }
                    NavigationLink("Privacy Policy") {
                        WebView(url: "https://example.com/privacy")
                    }
                }
            }
            .navigationTitle("App Info")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct InfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .foregroundColor(Theme.Colors.primaryText)
            Spacer()
            Text(value)
                .foregroundColor(Theme.Colors.secondaryText)
        }
    }
}

struct FeatureRow: View {
    let text: String
    
    var body: some View {
        HStack {
            Image(systemName: "checkmark.circle.fill")
                .foregroundColor(Theme.Colors.success)
                .font(.caption)
            Text(text)
                .font(.subheadline)
                .foregroundColor(Theme.Colors.primaryText)
        }
    }
}

// MARK: - Notifications Settings View
struct NotificationSettingsView: View {
    @State private var pushNotificationsEnabled = true
    @State private var reservationReminders = true
    @State private var promotionalOffers = false
    @State private var emailNotifications = true
    @State private var isLoading = false
    @State private var showingPermissionAlert = false
    
    var body: some View {
        NavigationView {
            List {
                Section("Push Notifications") {
                    Toggle("Enable Push Notifications", isOn: $pushNotificationsEnabled)
                        .onChange(of: pushNotificationsEnabled) { newValue in
                            if newValue {
                                requestNotificationPermission()
                            }
                        }
                    
                    if pushNotificationsEnabled {
                        Toggle("Reservation Reminders", isOn: $reservationReminders)
                        Toggle("Promotional Offers", isOn: $promotionalOffers)
                    }
                }
                
                Section("Email Notifications") {
                    Toggle("Email Notifications", isOn: $emailNotifications)
                }
                
                Section {
                    Text("We'll send you notifications about your reservations, special offers, and important updates. You can change these settings anytime.")
                        .font(.caption)
                        .foregroundColor(Theme.Colors.secondaryText)
                }
            }
            .navigationTitle("Notifications")
            .navigationBarTitleDisplayMode(.inline)
            .alert("Notification Permission", isPresented: $showingPermissionAlert) {
                Button("Settings") {
                    if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(settingsUrl)
                    }
                }
                Button("Cancel", role: .cancel) {
                    pushNotificationsEnabled = false
                }
            } message: {
                Text("Please enable notifications in Settings to receive reservation updates and reminders.")
            }
            .onAppear {
                checkNotificationStatus()
            }
        }
    }
    
    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                if !granted {
                    showingPermissionAlert = true
                }
            }
        }
    }
    
    private func checkNotificationStatus() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                pushNotificationsEnabled = settings.authorizationStatus == .authorized
            }
        }
    }
}

// MARK: - Privacy Settings View
struct PrivacySettingsView: View {
    @State private var analyticsEnabled = false
    @State private var crashReportingEnabled = true
    @State private var locationServicesEnabled = false
    @State private var dataSharingEnabled = false
    
    var body: some View {
        NavigationView {
            List {
                Section("Data Collection") {
                    Toggle("Analytics", isOn: $analyticsEnabled)
                    Toggle("Crash Reporting", isOn: $crashReportingEnabled)
                    Toggle("Location Services", isOn: $locationServicesEnabled)
                }
                
                Section("Data Sharing") {
                    Toggle("Share Data with Partners", isOn: $dataSharingEnabled)
                }
                
                Section("Data Management") {
                    NavigationLink("Download My Data") {
                        DataExportView()
                    }
                    
                    NavigationLink("Delete Account") {
                        DeleteAccountView()
                    }
                }
                
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Your Privacy Matters")
                            .font(.headline)
                            .foregroundColor(Theme.Colors.primaryText)
                        
                        Text("We are committed to protecting your privacy. These settings control how your data is collected and used. You can learn more in our Privacy Policy.")
                            .font(.caption)
                            .foregroundColor(Theme.Colors.secondaryText)
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Privacy")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Help & Support View
struct HelpSupportView: View {
    @State private var showingContactForm = false
    
    var body: some View {
        NavigationView {
            List {
                Section("Get Help") {
                    NavigationLink("Frequently Asked Questions") {
                        FAQView()
                    }
                    
                    NavigationLink("Contact Support") {
                        ContactSupportView()
                    }
                    
                    NavigationLink("Report a Problem") {
                        ReportProblemView()
                    }
                }
                
                Section("Contact Information") {
                    HStack {
                        Image(systemName: "envelope")
                            .foregroundColor(Theme.Colors.primary)
                        Text("support@bookbite.com")
                            .foregroundColor(Theme.Colors.primaryText)
                    }
                    
                    HStack {
                        Image(systemName: "phone")
                            .foregroundColor(Theme.Colors.primary)
                        Text("+1 (555) 123-4567")
                            .foregroundColor(Theme.Colors.primaryText)
                    }
                }
            }
            .navigationTitle("Help & Support")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

// MARK: - Placeholder Views (can be implemented later)
struct WebView: View {
    let url: String
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "globe")
                .font(.system(size: 60))
                .foregroundColor(Theme.Colors.secondaryText)
            
            Text("Web Content")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("This would open: \(url)")
                .font(.subheadline)
                .foregroundColor(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .padding()
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct DataExportView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "square.and.arrow.down")
                .font(.system(size: 60))
                .foregroundColor(Theme.Colors.primary)
            
            Text("Export Your Data")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Request a copy of all your data including reservations, reviews, and account information.")
                .font(.subheadline)
                .foregroundColor(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button("Request Data Export") {
                // Implementation would go here
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .navigationTitle("Export Data")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct DeleteAccountView: View {
    @State private var showingConfirmation = false
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "trash.circle")
                .font(.system(size: 60))
                .foregroundColor(Theme.Colors.danger)
            
            Text("Delete Account")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("This action cannot be undone. All your data including reservations, reviews, and account information will be permanently deleted.")
                .font(.subheadline)
                .foregroundColor(Theme.Colors.secondaryText)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
            
            Button("Delete My Account") {
                showingConfirmation = true
            }
            .buttonStyle(.borderedProminent)
            .tint(Theme.Colors.danger)
        }
        .padding()
        .navigationTitle("Delete Account")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Delete Account", isPresented: $showingConfirmation) {
            Button("Delete", role: .destructive) {
                // Implementation would go here
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("Are you sure you want to permanently delete your account? This action cannot be undone.")
        }
    }
}

struct FAQView: View {
    let faqs = [
        FAQ(question: "How do I make a reservation?", answer: "Browse restaurants, select your preferred date and time, choose a table, and complete the booking process."),
        FAQ(question: "Can I cancel my reservation?", answer: "Yes, you can cancel reservations up to 2 hours before your booking time from the My Reservations tab."),
        FAQ(question: "What payment methods do you accept?", answer: "We accept all major credit cards and also offer the option to pay at the restaurant."),
        FAQ(question: "How do I leave a review?", answer: "After your dining experience, go to the restaurant page and tap 'Add Review' to share your feedback."),
        FAQ(question: "Is my payment information secure?", answer: "Yes, all payment information is encrypted and processed securely through our payment partners.")
    ]
    
    var body: some View {
        List(faqs) { faq in
            DisclosureGroup {
                Text(faq.answer)
                    .font(.subheadline)
                    .foregroundColor(Theme.Colors.secondaryText)
                    .padding(.top, 8)
            } label: {
                Text(faq.question)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(Theme.Colors.primaryText)
            }
        }
        .navigationTitle("FAQ")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct FAQ: Identifiable {
    let id = UUID()
    let question: String
    let answer: String
}

struct ContactSupportView: View {
    @State private var subject = ""
    @State private var message = ""
    @State private var email = ""
    @State private var isSubmitting = false
    
    var body: some View {
        NavigationView {
            Form {
                Section("Contact Information") {
                    TextField("Your Email", text: $email)
                        .keyboardType(.emailAddress)
                        .textContentType(.emailAddress)
                }
                
                Section("Support Request") {
                    TextField("Subject", text: $subject)
                    
                    TextField("Describe your issue...", text: $message, axis: .vertical)
                        .lineLimit(5...10)
                }
                
                Section {
                    Button("Send Message") {
                        submitSupportRequest()
                    }
                    .disabled(subject.isEmpty || message.isEmpty || email.isEmpty || isSubmitting)
                }
            }
            .navigationTitle("Contact Support")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
    
    private func submitSupportRequest() {
        isSubmitting = true
        // Implementation would go here
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            isSubmitting = false
        }
    }
}

struct ReportProblemView: View {
    @State private var problemType = "Bug Report"
    @State private var description = ""
    @State private var includeDeviceInfo = true
    
    let problemTypes = ["Bug Report", "Feature Request", "Payment Issue", "Account Problem", "Other"]
    
    var body: some View {
        NavigationView {
            Form {
                Section("Problem Type") {
                    Picker("Type", selection: $problemType) {
                        ForEach(problemTypes, id: \.self) { type in
                            Text(type).tag(type)
                        }
                    }
                    .pickerStyle(.wheel)
                }
                
                Section("Description") {
                    TextField("Describe the problem...", text: $description, axis: .vertical)
                        .lineLimit(5...10)
                }
                
                Section("Additional Information") {
                    Toggle("Include device information", isOn: $includeDeviceInfo)
                }
                
                Section {
                    Button("Submit Report") {
                        // Implementation would go here
                    }
                    .disabled(description.isEmpty)
                }
            }
            .navigationTitle("Report Problem")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
