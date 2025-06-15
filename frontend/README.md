# BookBite Frontend

A modern web frontend built with Express.js that interfaces with a C++ backend API for restaurant booking.

## Features

- User authentication (register, login, logout)
- Browse restaurants with dynamic image links from Unsplash
- View restaurant details with tables information
- Make reservations at restaurants
- Manage and view your reservations (upcoming, past, cancelled)
- Modern and responsive design

## Technologies Used

- Express.js - Web framework
- EJS - Templating engine
- Bootstrap 5 - UI framework
- Axios - HTTP client
- Unsplash - Dynamic restaurant images
- Express-session - Session management

## Prerequisites

- Node.js (v14+)
- npm

## Installation

1. Clone the repository
2. Navigate to the frontend directory

```bash
cd /path/to/bookbite/frontend
```

3. Install dependencies

```bash
npm install
```

4. Create a .env file in the root directory with the following content:

```
PORT=3000
API_URL=http://localhost:8080/api
```

5. Start the application

```bash
npm start
```

Or for development with automatic restart:

```bash
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## API Integration

The frontend integrates with the BookBite C++ backend API which provides the following endpoints:

- Authentication: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`
- Restaurants: `/api/restaurants`, `/api/restaurants/:id`
- Tables: `/api/restaurants/:id/tables`, `/api/restaurants/:id/availabletables`
- Reservations: `/api/reservations`, `/api/user/reservations`, `/api/reservations/:id/cancel`

## Directory Structure

- `app.js` - Main application file
- `views/` - EJS templates
  - `layouts/` - Main layout templates
  - `pages/` - Page templates
  - `partials/` - Reusable template parts
- `public/` - Static assets
  - `css/` - Stylesheets
  - `js/` - Client-side JavaScript
  - `img/` - Images
- `package.json` - Project configuration

