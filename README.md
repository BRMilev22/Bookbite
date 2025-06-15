# BookBite - Restaurant Reservation System

BookBite is a comprehensive restaurant reservation system featuring email confirmation workflows, user authentication, and modern web technologies. The system consists of a robust C++ backend using the Crow framework and a responsive Node.js/Express frontend with EJS templating.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure registration, login/logout with session management
- **Restaurant Management**: Browse restaurants with detailed information, photos, and reviews
- **Table Reservations**: Real-time table availability and booking system
- **Email Confirmation**: Automatic email confirmation workflow for reservations
- **Admin Dashboard**: Comprehensive admin interface for managing restaurants, users, and reservations
- **Responsive Design**: Modern, mobile-friendly interface

### Email Confirmation System
- Reservations start with "pending" status requiring email confirmation
- Automatic confirmation emails with secure token-based verification
- Resend confirmation email functionality for pending reservations
- Confirmation page with next steps and reservation management links

### Advanced Features
- Real-time reservation status tracking (pending → confirmed → completed)
- Payment status management
- Special requests handling
- Search and filter functionality
- Reservation history and management

## 🏗️ Project Structure

```
bookbite/
├── backend/                    # C++ API Server
│   ├── include/               # Header files
│   │   ├── businessLogic/     # Service layer
│   │   ├── dataAccess/        # Database access layer
│   │   ├── models/            # Data models
│   │   ├── presentation/      # API controllers
│   │   └── utils/             # Utilities (email, env loader)
│   ├── src/                   # Source files
│   │   ├── main.cpp           # Application entry point
│   │   └── [mirrors include structure]
│   ├── build/                 # Build directory
│   │   └── .env              # Environment configuration (REQUIRED)
│   └── CMakeLists.txt        # Build configuration
├── frontend/                  # Node.js/Express Frontend
│   ├── views/                 # EJS templates
│   │   ├── pages/            # Page templates
│   │   ├── partials/         # Reusable components
│   │   └── layouts/          # Layout templates
│   ├── public/               # Static assets
│   ├── app.js                # Express application
│   └── package.json          # Dependencies
├── add_confirmation_tokens.sql # Database migration
├── bookbite.sql              # Database schema
└── README.md                 # This file
```

## 🛠️ Technology Stack

### Backend (C++)
- **Framework**: Crow (Modern C++ web framework)
- **Database**: MySQL with nanodbc connectivity
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: CURL-based SMTP client with Gmail integration
- **JSON**: nlohmann/json for API responses
- **Security**: OpenSSL for cryptographic operations

### Frontend (Node.js)
- **Framework**: Express.js with EJS templating
- **Session Management**: MySQL session store
- **Styling**: Bootstrap 5 with custom CSS
- **Icons**: Font Awesome
- **HTTP Client**: Axios for API communication

## 🚀 Getting Started

### Prerequisites
- C++ compiler with C++17 support
- CMake 3.10+
- MySQL/MariaDB database
- Node.js 16+
- npm

### Database Setup

1. Create a MySQL database and import the schema:
   ```bash
   mysql -u root -p < bookbite.sql
   ```

2. Apply the email confirmation migration:
   ```bash
   mysql -u root -p bookbite < add_confirmation_tokens.sql
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **IMPORTANT**: Create the `.env` file in the `build/` directory with your email configuration:
   ```bash
   mkdir -p build
   cat > build/.env << EOF
   # Email Configuration (Required for email confirmation)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   FROM_EMAIL=your-email@gmail.com
   EOF
   ```

   **Note**: For Gmail, you need to:
   - Enable 2-factor authentication
   - Generate an app-specific password
   - Use the app password (not your regular password)

3. Build the project:
   ```bash
   mkdir -p build && cd build
   cmake ..
   make
   ```

4. Run the server:
   ```bash
   ./bookbite_server
   ```

   The backend API will be available at `http://localhost:8080/api`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev -c
   ```

   The frontend will be available at `http://localhost:3000`

## 📧 Email Configuration

The email confirmation system requires proper SMTP configuration:

### Gmail Setup (Recommended)
1. Enable 2-factor authentication on your Google account
2. Generate an app-specific password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use this app password in your `.env` file

### Environment Variables
The `.env` file **must** be placed in `backend/build/.env` (same directory as the executable):

```properties
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Restaurant Endpoints
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (admin)
- `PUT /api/restaurants/:id` - Update restaurant (admin)
- `DELETE /api/restaurants/:id` - Delete restaurant (admin)

### Reservation Endpoints
- `GET /api/user/reservations` - Get user's reservations
- `POST /api/reservations` - Create new reservation (creates pending status)
- `GET /api/reservations/confirm/:token` - Confirm reservation via email
- `POST /api/reservations/:id/resend-email` - Resend confirmation email
- `PUT /api/reservations/:id/cancel` - Cancel reservation

### Table Endpoints
- `GET /api/restaurants/:id/tables` - Get restaurant tables
- `GET /api/restaurants/:id/availabletables` - Get available tables

## 💫 Email Confirmation Workflow

1. **Reservation Creation**: User makes a reservation → Status: "pending"
2. **Email Sent**: Confirmation email with secure token sent automatically
3. **Email Confirmation**: User clicks link → Status: "confirmed"
4. **Completion**: Restaurant can mark as "completed" after dining

### Pending Reservations Management
- Users can view pending reservations in "My Reservations" → "Pending" tab
- Resend confirmation email if not received
- Pending reservations are excluded from upcoming/confirmed lists

## 🔧 Development

### Building the Backend
```bash
cd backend/build
cmake ..
make
```

### Environment Variables
Ensure the `.env` file is in the correct location (`backend/build/.env`) for the email service to work properly.

## 📋 Common Issues

### Email Not Sending
- Verify `.env` file is in `backend/build/.env`
- Check Gmail app password is correct
- Ensure 2FA is enabled on Gmail account

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in the code
- Ensure database schema is properly imported

### Build Issues
- Ensure all dependencies are installed
- Check CMake version compatibility
- Verify C++17 compiler support

# Made with ❤️
- Boris Milev
