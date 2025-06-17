# BookBite iOS App 📱

A native iOS application for the BookBite restaurant reservation system, built with SwiftUI and targeting iOS 16.0+. This app provides a beautiful, native mobile experience while connecting to the same robust C++ backend API used by the web application.

## 🌟 Features

### Core Functionality
- **Native iOS Experience** - Built with SwiftUI for iOS 16.0+
- **User Authentication** - Login and registration with JWT token management
- **Restaurant Discovery** - Browse restaurants with search and filtering
- **Detailed Restaurant Views** - View restaurant info, tables, and reviews
- **Reservation Management** - Make and manage restaurant reservations
- **Review System** - Rate and review restaurants
- **Offline-Ready** - Graceful handling of network connectivity

### User Interface
- **Modern SwiftUI Design** - Clean, intuitive interface following iOS design guidelines
- **Dark Mode Support** - Automatic adaptation to system appearance
- **Accessibility** - Full VoiceOver and accessibility support
- **Responsive Layout** - Optimized for all iPhone screen sizes
- **Pull-to-Refresh** - Easy data refreshing throughout the app
- **Error Handling** - User-friendly error messages and retry options

## 📱 Screenshots

*Screenshots will be added once the app is built and running*

## 🏗️ Architecture

### Project Structure
```
ios/
├── BookBiteApp.swift              # Main app entry point
├── ContentView.swift              # Root view with authentication logic
├── Models.swift                   # Data models matching backend API
├── APIService.swift               # Network layer and API communication
├── AuthenticationManager.swift    # Authentication state management
├── Views/
│   ├── AuthenticationView.swift   # Login/Register screen
│   ├── RestaurantsView.swift      # Restaurant list and search
│   ├── RestaurantDetailView.swift # Restaurant details, tables, reviews
│   ├── MakeReservationView.swift  # Reservation creation form
│   ├── ReservationsView.swift     # User's reservations list
│   ├── AddReviewView.swift        # Review creation form
│   └── ProfileView.swift          # User profile and settings
```

### Architecture Pattern
- **MVVM** - Model-View-ViewModel pattern with ObservableObject
- **Combine** - Reactive programming for data binding
- **AsyncAwait** - Modern Swift concurrency for API calls
- **Environment Objects** - Shared state management across views

## 🛠️ Technology Stack

- **SwiftUI** - Declarative UI framework
- **iOS 16.0+** - Minimum deployment target
- **Swift 5.9+** - Programming language
- **Combine** - Reactive framework
- **URLSession** - Network requests
- **UserDefaults** - Local storage for authentication tokens
- **AsyncImage** - Asynchronous image loading

## 🚀 Getting Started

### Prerequisites
- **Xcode 15.0+** - Latest Xcode with iOS 16+ SDK
- **macOS Sonoma+** - Required for latest Xcode
- **Active Apple Developer Account** - For device testing
- **Running Backend** - BookBite C++ backend server

### Backend Setup
Ensure your BookBite backend is running locally:

1. Start the C++ backend server:
   ```bash
   cd backend/build
   ./bookbite_server
   ```
   Backend should be running on `http://localhost:8080/api`

### iOS App Setup

1. **Open in Xcode**:
   - Copy all Swift files from the `ios/` folder to your Xcode project
   - Ensure the files are added to your target

2. **Configure Project Settings**:
   - Minimum Deployment Target: iOS 16.0
   - Bundle Identifier: `bmilev.BookBite` (as shown in your screenshot)
   - Team: Your Apple Developer Team

3. **Update API Configuration**:
   In `APIService.swift`, update the base URL if your backend is running on a different host:
   ```swift
   private let baseURL = "http://localhost:8080/api"  // For simulator
   // or
   private let baseURL = "http://YOUR_IP:8080/api"    // For device testing
   ```

4. **Build and Run**:
   - Select your target device or simulator
   - Press Cmd+R to build and run

### Network Configuration

#### For iOS Simulator
- Use `http://localhost:8080/api` - works directly

#### For Physical Device Testing
- Replace `localhost` with your Mac's IP address
- Example: `http://192.168.1.100:8080/api`
- Ensure your Mac and iPhone are on the same WiFi network

#### For Production
- Update the base URL to your production server
- Ensure HTTPS is used for App Store distribution

## 📐 App Flow

### Authentication Flow
1. **Launch** → Check for stored auth token
2. **Login/Register** → API authentication
3. **Token Storage** → UserDefaults persistence
4. **Main App** → Tab-based navigation

### Main Navigation
- **Restaurants Tab** → Browse and search restaurants
- **Reservations Tab** → View and manage bookings
- **Profile Tab** → User info and app settings

### Restaurant Discovery
1. **Restaurant List** → Search and filter options
2. **Restaurant Detail** → Info, tables, reviews
3. **Make Reservation** → Date, time, table selection
4. **Confirmation** → Email notification

## 🔧 API Integration

The iOS app communicates with the same C++ backend used by the web frontend:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Restaurant Endpoints
- `GET /restaurants` - List restaurants
- `GET /restaurants/{id}` - Restaurant details
- `GET /restaurants/{id}/tables` - Restaurant tables
- `GET /restaurants/{id}/reviews` - Restaurant reviews

### Reservation Endpoints
- `POST /reservations` - Create reservation
- `GET /user/reservations` - User's reservations
- `POST /reservations/{id}/cancel` - Cancel reservation

### Review Endpoints
- `POST /reviews` - Create review

## 🎨 UI/UX Features

### Design Elements
- **Orange Accent Color** - Consistent with BookBite branding
- **SF Symbols** - Native iOS iconography
- **Typography** - iOS system fonts with proper hierarchy
- **Spacing** - Consistent padding and margins

### User Experience
- **Loading States** - Progress indicators for all network requests
- **Error Handling** - Retry buttons and clear error messages
- **Empty States** - Helpful messages when no data is available
- **Pull-to-Refresh** - Easy data refreshing
- **Form Validation** - Real-time validation feedback

### Accessibility
- **VoiceOver** - Full screen reader support
- **Dynamic Type** - Text scaling support
- **High Contrast** - Proper color contrast ratios
- **Keyboard Navigation** - Full keyboard accessibility

## 🔒 Security Features

- **JWT Token Management** - Secure token storage and refresh
- **HTTPS Support** - Encrypted network communication
- **Input Validation** - Client-side validation before API calls
- **Secure Storage** - UserDefaults for non-sensitive data only

## 🐛 Troubleshooting

### Common Issues

**App won't connect to backend:**
- Verify backend is running on port 8080
- Check IP address configuration for device testing
- Ensure firewall allows connections

**Authentication errors:**
- Clear app data and try logging in again
- Verify email/password combination
- Check backend logs for authentication issues

**Images not loading:**
- Verify internet connection
- Check image URLs in restaurant data
- AsyncImage requires iOS 15+

**Build errors:**
- Ensure iOS 16.0+ deployment target
- Verify all Swift files are added to target
- Clean build folder (Cmd+Shift+K)

### Debug Tips
- Use Xcode's Network debugging for API issues
- Check Console app for detailed logs
- Use breakpoints in APIService for network debugging

## 📱 Device Compatibility

- **iPhone** - All iPhone models supporting iOS 16+
- **iPad** - Runs in compatibility mode
- **Apple Silicon Macs** - Runs natively via Mac Catalyst

## 🚀 Future Enhancements

### Planned Features
- **Push Notifications** - Reservation reminders and confirmations
- **Apple Pay Integration** - Payment processing
- **MapKit Integration** - Restaurant location maps
- **Core Data** - Local data persistence
- **Widget Support** - Home screen widgets for quick access
- **Watch App** - Apple Watch companion app

### Performance Optimizations
- **Image Caching** - Local image storage
- **Data Persistence** - Offline data access
- **Background Refresh** - Automatic data updates

## 📄 License

This iOS app is part of the BookBite project and follows the same MIT License.

---

**BookBite iOS** - Native restaurant reservations at your fingertips! 📱✨
