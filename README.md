# BookBite - Restaurant Reservation System

BookBite is a modern restaurant reservation system with a C++ backend (Crow + nanodbc) and a Next.js frontend. The application allows customers to view available tables, make reservations, and manage their bookings.

## Project Structure

The project consists of two main parts:

1. **Backend**: C++ application with Crow RESTful API framework and nanodbc for MySQL/MariaDB connectivity
2. **Frontend**: Next.js application with TypeScript, Tailwind CSS, and Hero UI components

## Prerequisites

### Backend

- C++ compiler with C++17 support
- CMake 3.12+
- Crow C++ framework
- nanodbc library
- MySQL or MariaDB
- MariaDB Connector/C and Connector/ODBC

These can be installed on macOS via Homebrew:

```bash
brew install crow odbc mysql mariadb-connector-c mariadb-connector-odbc
```

### Frontend

- Node.js 18+
- npm

## Getting Started

### Database Setup

Get the sql file from the backend folder and run it on your database.

### Backend Setup

```bash
cd backend
mkdir build
cd build
cmake ..
make 
cd ../..
```

### Frontend Setup

```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Start the Backend Server

```bash
./bookbite_server
```

The API will be available at http://localhost:8080

### Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:3000

## Features

- View available restaurant tables
- Make reservations with customer information
- Specify special requests and requirements
- Admin interface for restaurant staff (coming soon)
- Email notifications (coming soon)

## Architecture

The project follows a three-layer architecture:

1. **Data Layer**: Database models and direct database access
2. **Service Layer**: Business logic and operations
3. **Controller Layer**: API endpoints and request/response handling

## API Endpoints

- `GET /api/tables` - Get all restaurant tables
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers/:id` - Get a specific customer
- `POST /api/reservations` - Create a new reservation
- More endpoints coming soon

## License

This project is open source under the MIT license. 