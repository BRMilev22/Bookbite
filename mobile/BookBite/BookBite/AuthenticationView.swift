import SwiftUI
import UIKit

struct AuthenticationView: View {
    @State private var isLoginMode = true
    @State private var username = ""
    @State private var email = ""
    @State private var password = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var phoneNumber = ""
    
    @EnvironmentObject var authManager: AuthenticationManager
    
    var body: some View {
        GeometryReader { geometry in
            ScrollView {
                VStack(spacing: 0) {
                    // Header Section
                    VStack(spacing: 16) {
                        // Logo
                        Circle()
                            .fill(Theme.Colors.primary) // Blue from theme
                            .frame(width: 80, height: 80)
                            .overlay(
                                Image(systemName: "fork.knife")
                                    .font(.system(size: 32, weight: .medium))
                                    .foregroundColor(.white)
                            )
                        
                        Text("BookBite")
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(Theme.Colors.primaryText)
                        
                        Text("Reserve your perfect dining experience")
                            .font(.system(size: 16))
                            .foregroundColor(Theme.Colors.secondaryText)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, max(60, geometry.safeAreaInsets.top + 40))
                    .padding(.bottom, 50)
                    
                    // Form Card
                    VStack(spacing: 0) {
                        // Form Header
                        if isLoginMode {
                            VStack(spacing: 0) {
                                Text("Login")
                                    .font(.system(size: 20, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 18)
                                    .background(Theme.Colors.primary)
                                    .cornerRadius(12, corners: [.topLeft, .topRight])
                                
                                VStack(spacing: 24) {
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Username")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(Theme.Colors.primaryText)
                                        
                                        TextField("Enter your username", text: $username)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .padding(16)
                                            .background(Theme.Colors.inputBackground)
                                            .cornerRadius(8)
                                            .autocapitalization(.none)
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Password")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(Theme.Colors.primaryText)
                                        
                                        SecureField("Enter your password", text: $password)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .padding(16)
                                            .background(Theme.Colors.inputBackground)
                                            .cornerRadius(8)
                                    }
                                    
                                    Button(action: {
                                        Task {
                                            await authManager.login(email: username, password: password)
                                        }
                                    }) {
                                        HStack {
                                            if authManager.isLoading {
                                                ProgressView()
                                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                    .scaleEffect(0.8)
                                            }
                                            Text("Login")
                                                .font(.system(size: 16, weight: .medium))
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 16)
                                        .background(Theme.Colors.primary)
                                        .foregroundColor(.white)
                                        .cornerRadius(8)
                                    }
                                    .disabled(authManager.isLoading || username.isEmpty || password.isEmpty)
                                    .opacity((authManager.isLoading || username.isEmpty || password.isEmpty) ? 0.6 : 1.0)
                                    
                                    HStack {
                                        Text("Need an account?")
                                            .font(.system(size: 14))
                                            .foregroundColor(Theme.Colors.secondaryText)
                                        
                                        Button(action: {
                                            withAnimation(.easeInOut(duration: 0.3)) {
                                                isLoginMode = false
                                                clearFields()
                                                authManager.clearError()
                                            }
                                        }) {
                                            Text("Sign up!")
                                                .font(.system(size: 14, weight: .medium))
                                                .foregroundColor(Theme.Colors.primary)
                                        }
                                    }
                                }
                                .padding(24)
                            }
                        } else {
                            VStack(spacing: 0) {
                                Text("Register")
                                    .font(.system(size: 20, weight: .semibold))
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 18)
                                    .background(Theme.Colors.primary)
                                    .cornerRadius(12, corners: [.topLeft, .topRight])
                                
                                VStack(spacing: 20) {
                                    HStack(spacing: 12) {
                                        VStack(alignment: .leading, spacing: 8) {
                                            Text("First Name")
                                                .font(.system(size: 14, weight: .medium))
                                                .foregroundColor(Theme.Colors.primaryText)
                                            
                                            TextField("Enter first name", text: $firstName)
                                                .textFieldStyle(PlainTextFieldStyle())
                                                .padding(16)
                                                .background(Theme.Colors.inputBackground)
                                                .cornerRadius(8)
                                        }
                                        
                                        VStack(alignment: .leading, spacing: 8) {
                                            Text("Last Name")
                                                .font(.system(size: 14, weight: .medium))
                                                .foregroundColor(Theme.Colors.primaryText)
                                            
                                            TextField("Enter last name", text: $lastName)
                                                .textFieldStyle(PlainTextFieldStyle())
                                                .padding(16)
                                                .background(Theme.Colors.inputBackground)
                                                .cornerRadius(8)
                                        }
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Email")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(Theme.Colors.primaryText)
                                        
                                        TextField("Enter your email", text: $email)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .padding(16)
                                            .background(Theme.Colors.inputBackground)
                                            .cornerRadius(8)
                                            .keyboardType(.emailAddress)
                                            .autocapitalization(.none)
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Username")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(Theme.Colors.primaryText)
                                        
                                        TextField("Choose a username", text: $username)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .padding(16)
                                            .background(Theme.Colors.inputBackground)
                                            .cornerRadius(8)
                                            .autocapitalization(.none)
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Password")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(Theme.Colors.primaryText)
                                        
                                        SecureField("Create a password", text: $password)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .padding(16)
                                            .background(Theme.Colors.inputBackground)
                                            .cornerRadius(8)
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Phone Number (Optional)")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(Theme.Colors.primaryText)
                                        
                                        TextField("Enter phone number", text: $phoneNumber)
                                            .textFieldStyle(PlainTextFieldStyle())
                                            .padding(16)
                                            .background(Theme.Colors.inputBackground)
                                            .cornerRadius(8)
                                            .keyboardType(.phonePad)
                                    }
                                    
                                    Button(action: {
                                        Task {
                                            await authManager.register(
                                                firstName: firstName,
                                                lastName: lastName,
                                                email: email,
                                                password: password,
                                                phoneNumber: phoneNumber.isEmpty ? nil : phoneNumber
                                            )
                                        }
                                    }) {
                                        HStack {
                                            if authManager.isLoading {
                                                ProgressView()
                                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                                    .scaleEffect(0.8)
                                            }
                                            Text("Create Account")
                                                .font(.system(size: 16, weight: .medium))
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 16)
                                        .background(Theme.Colors.primary)
                                        .foregroundColor(.white)
                                        .cornerRadius(8)
                                    }
                                    .disabled(authManager.isLoading || firstName.isEmpty || lastName.isEmpty || email.isEmpty || username.isEmpty || password.isEmpty)
                                    .opacity((authManager.isLoading || firstName.isEmpty || lastName.isEmpty || email.isEmpty || username.isEmpty || password.isEmpty) ? 0.6 : 1.0)
                                    
                                    HStack {
                                        Text("Already have an account?")
                                            .font(.system(size: 14))
                                            .foregroundColor(Theme.Colors.secondaryText)
                                        
                                        Button(action: {
                                            withAnimation(.easeInOut(duration: 0.3)) {
                                                isLoginMode = true
                                                clearFields()
                                                authManager.clearError()
                                            }
                                        }) {
                                            Text("Sign in!")
                                                .font(.system(size: 14, weight: .medium))
                                                .foregroundColor(Theme.Colors.primary)
                                        }
                                    }
                                }
                                .padding(24)
                            }
                        }
                        
                        // Error message
                        if let errorMessage = authManager.errorMessage {
                            Text(errorMessage)
                                .font(.system(size: 14))
                                .foregroundColor(Theme.Colors.danger)
                                .padding(.horizontal, 24)
                                .padding(.bottom, 16)
                        }
                    }
                    .background(Theme.Colors.cardBackground)
                    .cornerRadius(12)
                    .shadow(color: Theme.Shadows.card, radius: 20, x: 0, y: 8)
                    .padding(.horizontal, 32)
                    .padding(.bottom, max(40, geometry.safeAreaInsets.bottom + 20))
                }
            }
            .background(Theme.Colors.background)
            .ignoresSafeArea(.all)
            .onTapGesture {
                hideKeyboard()
            }
        }
    }
    
    private func clearFields() {
        username = ""
        email = ""
        password = ""
        firstName = ""
        lastName = ""
        phoneNumber = ""
    }
}

// MARK: - Extensions
extension View {
    func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
    
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#Preview {
    AuthenticationView()
        .environmentObject(AuthenticationManager())
}
