const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const axios = require('axios');
const http = require('http');
const expressLayouts = require('express-ejs-layouts');

// Load environment variables
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || 'http://localhost:8080/api';

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// MySQL session store configuration
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bookbite',
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

// Add error handling for session store
sessionStore.onReady().then(() => {
  console.log('✅ MySQL session store ready');
}).catch(error => {
  console.error('❌ MySQL session store error:', error);
});

// Session configuration with MySQL store
app.use(session({
  name: 'bookbite_sid', // Consistent session cookie name
  secret: process.env.SESSION_SECRET || 'bookbite-secret-key-change-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: false, // Don't reset expiry on every request to avoid issues
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours (shorter for testing)
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax' // Important for modern browsers
  }
}));

// Session debugging middleware
app.use((req, res, next) => {
  console.log(`📊 Session Debug - ID: ${req.sessionID}, Path: ${req.path}`);
  if (req.session.token) {
    console.log(`🔐 Token found in session (length: ${req.session.token.length})`);
  } else {
    console.log(`❌ No token in session`);
  }
  next();
});

// Set view engine and layouts
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set("layout extractScripts", true);

// Flash message middleware
app.use((req, res, next) => {
  res.locals.success = req.session.success;
  res.locals.error = req.session.error;
  delete req.session.success;
  delete req.session.error;
  res.locals.user = req.session.user;
  next();
});

// Simple API proxy without creating new sessions
app.use('/api', (req, res, next) => {
  // Skip proxy for auth routes - let them be handled by direct API calls
  if (req.path.startsWith('/auth/')) {
    return next('route'); // Skip to next route handler
  }
  
  // For all other API routes, proxy with session token
  const token = req.session?.token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  console.log(`🔄 Proxying ${req.method} ${req.url} with token: ${!!token}`);
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: req.url,
    method: req.method,
    headers
  };
  
  const proxyReq = require('http').request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  });
  
  if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
    proxyReq.write(JSON.stringify(req.body));
  }
  
  proxyReq.end();
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  console.log(`🔒 Authentication check for ${req.method} ${req.url}`);
  console.log(`🔐 Session token exists: ${!!req.session.token}`);
  console.log(`👤 Session user exists: ${!!req.session.user}`);
  
  if (req.session.token) {
    console.log(`✅ User is authenticated`);
    return next();
  }
  console.log(`❌ User not authenticated - redirecting to login`);
  res.redirect('/login');
};

// Admin authentication middleware
const isAdmin = (req, res, next) => {
  console.log(`🛡️ Admin check for ${req.method} ${req.url}`);
  
  if (!req.session.token) {
    console.log(`❌ User not authenticated - redirecting to login`);
    return res.redirect('/login');
  }
  
  if (!req.session.user) {
    console.log(`❌ No user data in session - redirecting to login`);
    return res.redirect('/login');
  }
  
  // Check if user has admin role or admin permissions
  const userRole = req.session.user.roleName || req.session.user.role;
  const permissions = req.session.user.permissions || [];
  const isUserAdmin = userRole === 'admin' || permissions.includes('manage_restaurants') || permissions.includes('view_admin_panel');
  
  console.log(`👤 User role: ${userRole}, permissions: ${permissions.join(', ')}`);
  console.log(`🛡️ Admin access: ${isUserAdmin}`);
  
  if (isUserAdmin) {
    console.log(`✅ Admin access granted`);
    return next();
  }
  
  console.log(`❌ Admin access denied - insufficient permissions`);
  req.session.error = 'Access denied. Administrator privileges required.';
  res.redirect('/restaurants');
};

// Add direct routes for reviews - this works around any proxy issues
app.get('/restaurants/:id/reviews', async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const response = await axios.get(`${API_URL}/restaurants/${restaurantId}/reviews`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    if (error.response) {
      res.status(error.response.status).json({ error: 'Failed to fetch reviews' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST route for submitting reviews
app.post('/restaurants/:id/reviews', async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const token = req.session.token;
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await axios.post(`${API_URL}/restaurants/${restaurantId}/reviews`, req.body, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('Error submitting review:', error);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
});

// Create axios instance with default headers
const createApiClient = (token = null) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return axios.create({
    baseURL: API_URL, // Point directly to backend API
    timeout: 5000,
    headers
  });
};

// Default apiClient for non-authenticated requests
const apiClient = createApiClient();

// Debug route for testing reviews
app.get('/debug-reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'debug-reviews.html'));
});

// Test route for simple reviews
app.get('/test-reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-reviews.html'));
});

// Routes
// Home page
app.get('/', async (req, res) => {
  try {
    // Get featured restaurants
    const response = await apiClient.get('/restaurants');
    const allRestaurants = response.data;
    const featuredRestaurants = allRestaurants.filter(restaurant => restaurant.isFeatured);
    
    res.render('pages/index', {
      title: 'BookBite - Find and Book Restaurants',
      isAuthenticated: !!req.session.token,
      featuredRestaurants: featuredRestaurants
    });
  } catch (error) {
    console.error('Error fetching featured restaurants:', error.message);
    res.render('pages/index', {
      title: 'BookBite - Find and Book Restaurants',
      isAuthenticated: !!req.session.token,
      featuredRestaurants: []
    });
  }
});

// Register page
app.get('/register', (req, res) => {
  if (req.session.token) {
    return res.redirect('/restaurants');
  }
  res.render('pages/register', {
    title: 'Register - BookBite',
    isAuthenticated: false
  });
});

// Login page
app.get('/login', (req, res) => {
  if (req.session.token) {
    return res.redirect('/restaurants');
  }
  res.render('pages/login', {
    title: 'Login - BookBite',
    isAuthenticated: false
  });
});

// Reservation confirmation page
app.get('/confirm-reservation', async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    req.session.error = 'Invalid confirmation link';
    return res.redirect('/');
  }
  
  try {
    // Call the backend API to confirm the reservation
    const response = await apiClient.get(`/reservations/confirm/${token}`);
    
    if (response.data.success) {
      req.session.success = 'Reservation confirmed successfully! You will receive a confirmation email shortly.';
      res.render('pages/reservation-confirmed', {
        title: 'Reservation Confirmed - BookBite',
        isAuthenticated: !!req.session.token,
        message: 'Your reservation has been confirmed successfully!'
      });
    } else {
      req.session.error = response.data.message || 'Failed to confirm reservation';
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error confirming reservation:', error.message);
    const errorMessage = error.response?.data?.message || 'Invalid or expired confirmation link';
    req.session.error = errorMessage;
    res.redirect('/');
  }
});

// Register handler
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      req.session.error = 'Passwords do not match';
      return res.redirect('/register');
    }
    
    const response = await apiClient.post('/auth/register', {
      username,
      email,
      password
    });
    
    req.session.success = 'Registration successful! Please log in.';
    res.redirect('/login');
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    req.session.error = error.response?.data?.message || 'Registration failed';
    res.redirect('/register');
  }
});

// Login handler
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`🔐 Login attempt for user: ${username}`);
    
    const response = await apiClient.post('/auth/login', {
      username,
      password
    });
    
    if (response.data.token) {
      req.session.token = response.data.token;
      req.session.user = response.data.user; // Store complete user object with id
      req.session.success = 'Login successful!';
      
      console.log(`✅ Login successful for user: ${username}`);
      console.log(`🔐 Token stored in session: ${response.data.token.substring(0, 20)}...`);
      console.log(`👤 User stored in session:`, response.data.user);
      
      // Force session save before redirecting
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          req.session.error = 'Login failed - session error';
          return res.redirect('/login');
        }
        console.log(`💾 Session saved successfully`);
        res.redirect('/restaurants');
      });
    } else {
      console.log(`❌ Login failed - no token returned`);
      req.session.error = 'Invalid credentials';
      res.redirect('/login');
    }
  } catch (error) {
    console.error('🚨 Login error:', error.response?.data || error.message);
    req.session.error = error.response?.data?.message || 'Login failed';
    res.redirect('/login');
  }
});

// Logout handler
app.get('/logout', async (req, res) => {
  try {
    if (req.session.token) {
      const authenticatedClient = createApiClient(req.session.token);
      await authenticatedClient.post('/auth/logout');
    }
  } catch (error) {
    console.error('Logout error:', error.message);
  }
  
  req.session.destroy();
  res.redirect('/');
});

// Restaurants page
app.get('/restaurants', async (req, res) => {
  try {
    const response = await apiClient.get('/restaurants');
    const restaurants = response.data;
    
    res.render('pages/restaurants', {
      title: 'Restaurants - BookBite',
      restaurants,
      isAuthenticated: !!req.session.token
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error.message);
    req.session.error = 'Failed to fetch restaurants';
    res.redirect('/');
  }
});

// Restaurant details page
app.get('/restaurants/:id', async (req, res) => {
  try {
    const restaurantResponse = await apiClient.get(`/restaurants/${req.params.id}`);
    const tablesResponse = await apiClient.get(`/restaurants/${req.params.id}/tableswithreservations`);
    
    const restaurant = restaurantResponse.data;
    const tables = tablesResponse.data;
    
    res.render('pages/restaurant-detail', {
      title: `${restaurant.name} - BookBite`,
      restaurant,
      tables,
      isAuthenticated: !!req.session.token,
      user: req.session.user,
      pageScripts: ['/js/reviews.js']
    });
  } catch (error) {
    console.error('Error fetching restaurant details:', error.message);
    req.session.error = 'Failed to fetch restaurant details';
    res.redirect('/restaurants');
  }
});

// Make a reservation page
app.get('/restaurants/:id/reserve', isAuthenticated, async (req, res) => {
  try {
    const authenticatedClient = createApiClient(req.session.token);
    
    console.log(`DEBUG: Making reservation page request for restaurant ${req.params.id}`);
    console.log(`DEBUG: User token exists: ${!!req.session.token}`);
    
    const restaurantResponse = await apiClient.get(`/restaurants/${req.params.id}`);
    console.log(`DEBUG: Restaurant response status: ${restaurantResponse.status}`);
    
    // Try non-authenticated client first, then authenticated if needed
    let tablesWithReservationsResponse;
    try {
      tablesWithReservationsResponse = await apiClient.get(`/restaurants/${req.params.id}/tableswithreservations`);
      console.log(`DEBUG: Tables response (non-auth) status: ${tablesWithReservationsResponse.status}`);
    } catch (error) {
      console.log(`DEBUG: Non-auth failed, trying authenticated client:`, error.message);
      tablesWithReservationsResponse = await authenticatedClient.get(`/restaurants/${req.params.id}/tableswithreservations`);
      console.log(`DEBUG: Tables response (auth) status: ${tablesWithReservationsResponse.status}`);
    }
    console.log(`DEBUG: Tables response data length: ${tablesWithReservationsResponse.data.length}`);
    
    const restaurant = restaurantResponse.data;
    const rawTablesData = tablesWithReservationsResponse.data;
    
    // Ensure we have valid tables data
    console.log('DEBUG: Raw tables data from API:', JSON.stringify(rawTablesData, null, 2));
    console.log('DEBUG: Raw tables data type:', typeof rawTablesData);
    console.log('DEBUG: Raw tables data is array:', Array.isArray(rawTablesData));
    console.log('DEBUG: Raw tables data length:', rawTablesData?.length);
    
    // Create a safe copy of the tables data
    const availableTables = Array.isArray(rawTablesData) ? [...rawTablesData] : [];
    console.log('DEBUG: Available tables after copy:', availableTables.length);
    
    // Extract URL parameters for pre-selection
    const selectedTableId = req.query.tableId || null;
    
    // Extract ALL reservation data from ALL tables for comprehensive time slot filtering
    let allRestaurantReservations = [];
    console.log('DEBUG: Processing tables:', availableTables.length);
    availableTables.forEach((table, index) => {
      console.log(`DEBUG: Table ${index + 1}/${availableTables.length}: ID=${table.id}, reservations=${table.reservations ? table.reservations.length : 0}`);
      if (table.reservations && table.reservations.length > 0) {
        table.reservations.forEach(reservation => {
          console.log('DEBUG: Adding reservation:', reservation);
          allRestaurantReservations.push({
            ...reservation,
            tableId: table.id
          });
        });
      }
    });
    console.log('DEBUG: Total restaurant reservations:', allRestaurantReservations.length);
    
    // Final validation before rendering
    console.log('DEBUG - FINAL VALIDATION:');
    console.log('- restaurant:', restaurant?.name);
    console.log('- availableTables type:', typeof availableTables);
    console.log('- availableTables is array:', Array.isArray(availableTables));
    console.log('- availableTables.length:', availableTables.length);
    console.log('- selectedTableId:', selectedTableId);
    console.log('- allRestaurantReservations.length:', allRestaurantReservations.length);
    
    // Log first few tables for debugging
    if (availableTables.length > 0) {
      console.log('DEBUG - First table:', JSON.stringify(availableTables[0], null, 2));
      if (availableTables.length > 1) {
        console.log('DEBUG - Second table:', JSON.stringify(availableTables[1], null, 2));
      }
    } else {
      console.error('ERROR: availableTables is empty before rendering!');
    }
    
    res.render('pages/make-reservation', {
      title: `Reserve at ${restaurant.name} - BookBite`,
      restaurant,
      availableTables,
      selectedTableId,
      restaurantReservationData: allRestaurantReservations, // Pass ALL restaurant reservations for comprehensive time slot filtering
      user: req.session.user, // Pass user data for auto-fill email
      isAuthenticated: true,
      pageScripts: ['/js/reservation.js']
    });
  } catch (error) {
    console.error('Error fetching reservation data:', error.message);
    req.session.error = 'Failed to load reservation page';
    res.redirect(`/restaurants/${req.params.id}`);
  }
});

// Create reservation handler
app.post('/reservations', isAuthenticated, async (req, res) => {
  try {
    const { 
      restaurantId, tableId, date, startTime, endTime, guestCount, 
      phoneNumber, email, specialRequests, paymentMethod,
      cardNumber, cardholderName, cardExpiry, cardCvv, billingZip
    } = req.body;
    
    console.log(`🍽️ Creating reservation for restaurant ${restaurantId}, table ${tableId}`);
    console.log(`💳 Payment method: ${paymentMethod}`);
    console.log(`🔐 Session token exists: ${!!req.session.token}`);
    console.log(`👤 Session user:`, req.session.user);
    
    // First, get restaurant details to calculate the total amount
    const restaurantResponse = await apiClient.get(`/restaurants/${restaurantId}`);
    const restaurant = restaurantResponse.data;
    
    // Get table details to calculate dynamic fee
    const tablesResponse = await apiClient.get(`/restaurants/${restaurantId}/tableswithreservations`);
    const tables = tablesResponse.data;
    const selectedTable = tables.find(t => t.id == tableId);
    
    // Calculate dynamic fee based on table capacity
    let totalAmount = 4.0; // Default for small tables
    
    if (selectedTable) {
        const seatCount = selectedTable.seatCount;
        
        if (seatCount <= 2) {
            totalAmount = 4.0;
        } else if (seatCount <= 4) {
            totalAmount = 6.0;
        } else if (seatCount <= 6) {
            totalAmount = 9.0;
        } else {
            totalAmount = 12.0;
        }
    }
    
    const authenticatedClient = createApiClient(req.session.token);
    
    // Prepare reservation data
    const reservationData = {
      restaurantId: parseInt(restaurantId),
      tableId: parseInt(tableId),
      date,
      startTime,
      endTime,
      guestCount: parseInt(guestCount),
      phoneNumber: phoneNumber || '',
      email: email || '',
      specialRequests: specialRequests || '',
      totalAmount: totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending'
    };
    
    // Add payment data if card payment
    if (paymentMethod === 'card' && cardNumber) {
      reservationData.paymentData = {
        cardLastFour: cardNumber.replace(/\s/g, '').slice(-4),
        cardType: getCardType(cardNumber),
        cardholderName: cardholderName || '',
        billingZip: billingZip || ''
      };
    }
    
    const response = await authenticatedClient.post('/reservations', reservationData);
    
    console.log(`✅ Reservation created successfully`);
    const successMessage = paymentMethod === 'card' 
      ? `Reservation created! Payment of $${totalAmount.toFixed(2)} processed successfully. Please check your email to confirm your reservation.`
      : `Reservation created! Please check your email to confirm your reservation. You'll pay $${totalAmount.toFixed(2)} when you arrive at the restaurant.`;
    
    req.session.success = successMessage;
    res.redirect('/my-reservations');
  } catch (error) {
    console.error('🚨 Reservation error:', error.response?.data || error.message);
    req.session.error = error.response?.data?.message || 'Failed to create reservation';
    res.redirect(`/restaurants/${req.body.restaurantId}/reserve`);
  }
});

// Helper function to determine card type
function getCardType(cardNumber) {
  const number = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(number)) return 'Visa';
  if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'American Express';
  if (/^6/.test(number)) return 'Discover';
  
  return 'Unknown';
}

// User reservations page
app.get('/my-reservations', isAuthenticated, async (req, res) => {
  try {
    const authenticatedClient = createApiClient(req.session.token);
    const response = await authenticatedClient.get('/user/reservations');
    const reservations = response.data;
    
    console.log('Raw reservations data:', JSON.stringify(reservations, null, 2));
    
    // Fetch restaurant details for each reservation
    const reservationsWithDetails = await Promise.all(
      reservations.map(async (reservation) => {
        console.log(`Fetching restaurant details for ID: ${reservation.restaurantId}`);
        try {
          const restaurantResponse = await apiClient.get(`/restaurants/${reservation.restaurantId}`);
          console.log(`Successfully fetched restaurant ${reservation.restaurantId}:`, restaurantResponse.data);
          return {
            ...reservation,
            restaurant: restaurantResponse.data
          };
        } catch (error) {
          console.error(`Error fetching restaurant ${reservation.restaurantId}:`, error.message);
          console.error('Full error:', error.response?.data || error);
          return {
            ...reservation,
            restaurant: { 
              name: 'Unknown Restaurant',
              address: 'Address not available'
            }
          };
        }
      })
    );
    
    res.render('pages/my-reservations', {
      title: 'My Reservations - BookBite',
      reservations: reservationsWithDetails,
      isAuthenticated: true
    });
  } catch (error) {
    console.error('Error fetching reservations:', error.message);
    req.session.error = 'Failed to fetch your reservations';
    res.redirect('/');
  }
});

// Cancel reservation handler
app.post('/reservations/:id/cancel', isAuthenticated, async (req, res) => {
  try {
    const authenticatedClient = createApiClient(req.session.token);
    await authenticatedClient.post(`/reservations/${req.params.id}/cancel`);
    req.session.success = 'Reservation cancelled successfully!';
    res.redirect('/my-reservations');
  } catch (error) {
    console.error('Error cancelling reservation:', error.message);
    req.session.error = 'Failed to cancel reservation';
    res.redirect('/my-reservations');
  }
});

// Update reservation handler
app.post('/reservations/:id/update', isAuthenticated, async (req, res) => {
  try {
    const { date, startTime, endTime, guestCount, phoneNumber, email, specialRequests } = req.body;
    const updateData = {
      date,
      startTime,
      endTime,
      guestCount: parseInt(guestCount, 10),
      phoneNumber: phoneNumber || '',
      email: email || '',
      specialRequests: specialRequests || ''
    };
    
    const authenticatedClient = createApiClient(req.session.token);
    await authenticatedClient.put(`/reservations/${req.params.id}`, updateData);
    req.session.success = 'Reservation updated successfully!';
    res.redirect('/my-reservations');
  } catch (error) {
    console.error('Error updating reservation:', error.message);
    req.session.error = 'Failed to update reservation';
    res.redirect('/my-reservations');
  }
});

// Rating handler
app.post('/restaurants/:id/rate', isAuthenticated, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const authenticatedClient = createApiClient(req.session.token);
    await authenticatedClient.post(`/restaurants/${req.params.id}/ratings`, {
      rating: parseInt(rating, 10),
      review: review || ''
    });
    
    res.json({ success: true, message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Error submitting rating:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit rating' });
  }
});

// Debug route for testing reviews
app.get('/debug-reviews', (req, res) => {
  res.sendFile(path.join(__dirname, 'debug-reviews.html'));
});

// Admin Panel Routes
app.get('/admin', isAdmin, async (req, res) => {
  try {
    console.log('🔧 Admin dashboard loading - starting API calls');
    const authenticatedClient = createApiClient(req.session.token);
    
    // Get dashboard data
    const [restaurantsRes, usersRes, reservationsRes] = await Promise.all([
      authenticatedClient.get('/restaurants'),
      authenticatedClient.get('/admin/users'),
      authenticatedClient.get('/admin/reservations')
    ]);
    
    console.log('✅ API calls successful');
    console.log('📊 Restaurants count:', restaurantsRes.data.length);
    console.log('👥 Users count:', usersRes.data.length);
    console.log('📅 Reservations count:', reservationsRes.data.length);
    
    const restaurants = restaurantsRes.data;
    const users = usersRes.data;
    const reservations = reservationsRes.data;
    
    // Calculate stats
    const totalRestaurants = restaurants.length;
    const totalUsers = users.length;
    const totalReservations = reservations.length;
    const todayReservations = reservations.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.date === today;
    }).length;
    
    res.locals.layout = 'layouts/admin';
    res.render('pages/admin/dashboard', {
      title: 'Admin Dashboard - BookBite',
      isAuthenticated: true,
      isAdmin: true,
      totalRestaurants,
      totalUsers,
      totalReservations,
      todayReservations,
      recentReservations: reservations.slice(0, 5),
      recentUsers: users.slice(-5)
    });
  } catch (error) {
    console.error('Admin dashboard error:', error.message);
    req.session.error = 'Failed to load admin dashboard';
    res.redirect('/restaurants');
  }
});

// Admin Restaurant Management
app.get('/admin/restaurants', isAdmin, async (req, res) => {
  try {
    const authenticatedClient = createApiClient(req.session.token);
    const response = await authenticatedClient.get('/restaurants');
    const restaurants = response.data;
    
    res.locals.layout = 'layouts/admin';
    res.render('pages/admin/restaurants', {
      title: 'Manage Restaurants - Admin',
      isAuthenticated: true,
      isAdmin: true,
      restaurants,
      pageScripts: ['/js/admin-restaurants.js']
    });
  } catch (error) {
    console.error('Admin restaurants error:', error.message);
    req.session.error = 'Failed to load restaurants';
    res.redirect('/admin');
  }
});

// Admin Add Restaurant
app.get('/admin/restaurants/add', isAdmin, (req, res) => {
  res.locals.layout = 'layouts/admin';
  res.render('pages/admin/add-restaurant', {
    title: 'Add Restaurant - Admin',
    isAuthenticated: true,
    isAdmin: true,
    pageScripts: ['/js/admin-forms.js']
  });
});

// Admin Edit Restaurant
app.get('/admin/restaurants/:id/edit', isAdmin, async (req, res) => {
  try {
    const authenticatedClient = createApiClient(req.session.token);
    const response = await authenticatedClient.get(`/restaurants/${req.params.id}`);
    const restaurant = response.data;
    
    res.locals.layout = 'layouts/admin';
    res.render('pages/admin/edit-restaurant', {
      title: `Edit ${restaurant.name} - Admin`,
      isAuthenticated: true,
      isAdmin: true,
      restaurant,
      pageScripts: ['/js/admin-forms.js']
    });
  } catch (error) {
    console.error('Edit restaurant error:', error.message);
    req.session.error = 'Restaurant not found';
    res.redirect('/admin/restaurants');
  }
});

// Admin User Management
app.get('/admin/users', isAdmin, async (req, res) => {
  try {
    const authenticatedClient = createApiClient(req.session.token);
    const [usersRes, rolesRes] = await Promise.all([
      authenticatedClient.get('/admin/users'),
      authenticatedClient.get('/admin/roles')
    ]);
    
    const users = usersRes.data;
    const roles = rolesRes.data;
    
    res.locals.layout = 'layouts/admin';
    res.render('pages/admin/users', {
      title: 'Manage Users - Admin',
      isAuthenticated: true,
      isAdmin: true,
      users,
      roles,
      pageScripts: ['/js/admin-users.js']
    });
  } catch (error) {
    console.error('Admin users error:', error.message);
    req.session.error = 'Failed to load users';
    res.redirect('/admin');
  }
});

// Admin promote user
app.post('/admin/users/:id/promote', isAdmin, async (req, res) => {
  try {
    const { roleId } = req.body;
    const authenticatedClient = createApiClient(req.session.token);
    
    await authenticatedClient.put(`/admin/users/${req.params.id}/role`, {
      roleId: parseInt(roleId, 10)
    });
    
    req.session.success = 'User role updated successfully';
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Promote user error:', error.message);
    req.session.error = 'Failed to update user role';
    res.redirect('/admin/users');
  }
});

// Admin change user status
app.post('/admin/users/:id/status', isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const authenticatedClient = createApiClient(req.session.token);
    
    await authenticatedClient.put(`/admin/users/${req.params.id}/status`, {
      isActive: Boolean(isActive)
    });
    
    res.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Change user status error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
});

// Admin create restaurant
app.post('/admin/restaurants', isAdmin, async (req, res) => {
  try {
    const authenticatedClient = createApiClient(req.session.token);
    const restaurantData = {
      name: req.body.name,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      description: req.body.description,
      cuisineType: req.body.cuisineType,
      priceRange: req.body.priceRange,
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
      imageUrl: req.body.imageUrl,
      reservationFee: parseFloat(req.body.reservationFee) || 25.00,
      isFeatured: req.body.isFeatured === 'on'
    };
    
    await authenticatedClient.post('/admin/restaurants', restaurantData);
    
    req.session.success = 'Restaurant created successfully';
    res.redirect('/admin/restaurants');
  } catch (error) {
    console.error('Create restaurant error:', error.message);
    req.session.error = 'Failed to create restaurant';
    res.redirect('/admin/restaurants/add');
  }
});

// Admin update restaurant
app.post('/admin/restaurants/:id', isAdmin, async (req, res) => {
  try {
    const authenticatedClient = createApiClient(req.session.token);
    const restaurantData = {
      name: req.body.name,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      description: req.body.description,
      cuisineType: req.body.cuisineType,
      priceRange: req.body.priceRange,
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
      imageUrl: req.body.imageUrl,
      reservationFee: parseFloat(req.body.reservationFee) || 25.00,
      isFeatured: req.body.isFeatured === 'on'
    };
    
    await authenticatedClient.put(`/admin/restaurants/${req.params.id}`, restaurantData);
    
    req.session.success = 'Restaurant updated successfully';
    res.redirect('/admin/restaurants');
  } catch (error) {
    console.error('Update restaurant error:', error.message);
    req.session.error = 'Failed to update restaurant';
    res.redirect(`/admin/restaurants/${req.params.id}/edit`);
  }
});

// Admin delete restaurant
app.post('/admin/restaurants/:id', isAdmin, async (req, res) => {
  if (req.body._method === 'DELETE') {
    try {
      const authenticatedClient = createApiClient(req.session.token);
      await authenticatedClient.delete(`/admin/restaurants/${req.params.id}`);
      
      req.session.success = 'Restaurant deleted successfully';
      res.redirect('/admin/restaurants');
    } catch (error) {
      console.error('Delete restaurant error:', error.message);
      req.session.error = 'Failed to delete restaurant';
      res.redirect('/admin/restaurants');
    }
  } else {
    // Handle regular PUT update
    try {
      const authenticatedClient = createApiClient(req.session.token);
      const restaurantData = {
        name: req.body.name,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        description: req.body.description,
        cuisineType: req.body.cuisineType,
        priceRange: req.body.priceRange,
        openingTime: req.body.openingTime,
        closingTime: req.body.closingTime,
        imageUrl: req.body.imageUrl,
        reservationFee: parseFloat(req.body.reservationFee) || 25.00,
        isFeatured: req.body.isFeatured === 'on'
      };
      
      await authenticatedClient.put(`/admin/restaurants/${req.params.id}`, restaurantData);
      
      req.session.success = 'Restaurant updated successfully';
      res.redirect('/admin/restaurants');
    } catch (error) {
      console.error('Update restaurant error:', error.message);
      req.session.error = 'Failed to update restaurant';
      res.redirect(`/admin/restaurants/${req.params.id}/edit`);
    }
  }
});

// Admin delete user
app.post('/admin/users/:id/delete', isAdmin, async (req, res) => {
  try {
    const authenticatedClient = createApiClient(req.session.token);
    await authenticatedClient.delete(`/admin/users/${req.params.id}`);
    
    req.session.success = 'User deleted successfully';
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Delete user error:', error.message);
    req.session.error = 'Failed to delete user';
    res.redirect('/admin/users');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
