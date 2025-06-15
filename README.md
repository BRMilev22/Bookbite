# BookBite - Restaurant Reservation System

BookBite is a modern web application that allows users to browse restaurants, view their details, and make reservations. The system consists of a C++ backend using the Crow framework and a React frontend with Material UI.

## Project Structure

The project is organized into two main directories:

- `backend/`: Contains the C++ backend API server
- `frontend/`: Contains the React frontend application

## Backend

The backend is built using:

- C++ with the Crow web framework
- nanodbc for database connectivity
- nlohmann/json for JSON handling
- OpenSSL for password hashing and security

### Backend Features

- User authentication (register, login, logout)
- Restaurant management
- Table management
- Reservation system

## Frontend

The frontend is built using:

- React with TypeScript
- Material UI for the user interface
- React Router for navigation
- Axios for API calls
- JWT for authentication

### Frontend Features

- Modern responsive UI
- User authentication (login/register)
- Browse restaurants
- View restaurant details
- Make table reservations
- View and manage reservations

## Getting Started

### Running the Backend

1. Navigate to the backend directory:
   ```
   cd /Users/borismilev/Desktop/bookbite/backend
   ```

2. Build and run the application:
   ```
   ./build_and_run.sh
   ```

3. The backend API will be available at `http://localhost:8080/api`

### Running the Frontend

1. Navigate to the frontend directory:
   ```
   cd /Users/borismilev/Desktop/bookbite/frontend
   ```

2. Install dependencies (if you haven't already):
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The frontend application will be available at `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user

### Restaurants

- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create a new restaurant (requires auth)
- `PUT /api/restaurants/:id` - Update a restaurant (requires auth)
- `DELETE /api/restaurants/:id` - Delete a restaurant (requires auth)

### Tables

- `GET /api/restaurants/:id/tables` - Get all tables for a restaurant
- `GET /api/restaurants/:id/availabletables` - Get available tables for a restaurant
- `POST /api/restaurants/:id/tables` - Add a table to a restaurant (requires auth)

### Reservations

- `GET /api/reservations` - Get all reservations (requires auth)
- `GET /api/user/reservations` - Get user's reservations (requires auth)
- `GET /api/restaurants/:id/reservations` - Get reservations for a restaurant (requires auth)
- `POST /api/reservations` - Create a new reservation (requires auth)
- `PUT /api/reservations/:id/cancel` - Cancel a reservation (requires auth)

## License

This project is licensed under the MIT License.
