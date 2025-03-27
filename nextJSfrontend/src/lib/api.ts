import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on our backend models
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface RestaurantTable {
  id: number;
  restaurantId: number;
  tableNumber: number;
  capacity: number;
  location: string;
  tableType: string;
  tableDetails: string;
  isActive: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  image: string;
  location: string;
  distance: string;
  category: string;
  priceRange: string;
  rating: number;
  ratingLabel: string;
  reviews: number;
  isSpecial: boolean;
  isRecommended: boolean;
  isTrending: boolean;
  features: string[];
  tables?: RestaurantTable[];
}

export interface Reservation {
  id: number;
  customerId: number;
  tableId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  partySize: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  specialRequests?: string;
  customer?: Customer;
  table?: RestaurantTable;
  restaurant?: Restaurant;
}

// API methods

// Customers
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get('/customers');
  return response.data.customers;
};

export const getCustomer = async (id: number): Promise<Customer> => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  const response = await apiClient.post('/customers', customer);
  return response.data;
};

// Restaurants
export const getRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const response = await apiClient.get('/restaurants');
    
    // Handle both the old and new API structure
    // Old API returned { restaurants: Restaurant[] }
    // New API directly returns Restaurant[]
    if (response.data && Array.isArray(response.data)) {
      // Map to ensure returned data matches our interface
      return response.data.map((restaurant: any) => ({
        id: restaurant.id,
        name: restaurant.name,
        // Handle possible change in imageUrl vs image property
        image: restaurant.image || restaurant.imageUrl,
        location: restaurant.location,
        distance: restaurant.distance,
        category: restaurant.category,
        priceRange: restaurant.priceRange,
        rating: restaurant.rating,
        ratingLabel: restaurant.ratingLabel,
        reviews: restaurant.reviews,
        isSpecial: restaurant.isSpecial,
        isRecommended: restaurant.isRecommended,
        isTrending: restaurant.isTrending,
        features: Array.isArray(restaurant.features) 
          ? restaurant.features.map((f: any) => typeof f === 'string' ? f : f.name)
          : []
      }));
    }
    
    // Handle the old API structure
    if (response.data && response.data.restaurants && Array.isArray(response.data.restaurants)) {
      return response.data.restaurants;
    }
    
    // If neither structure is found, return empty array
    console.error('Unexpected restaurants API response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return []; // Return empty array instead of throwing
  }
};

export const getRestaurant = async (id: number): Promise<Restaurant | null> => {
  try {
    const response = await apiClient.get(`/restaurants/${id}`);
    
    if (!response.data) {
      return null;
    }
    
    // Parse response data
    const restaurant = response.data;
    
    return {
      id: restaurant.id,
      name: restaurant.name,
      // Handle possible change in imageUrl vs image property
      image: restaurant.image || restaurant.imageUrl,
      location: restaurant.location,
      distance: restaurant.distance,
      category: restaurant.category,
      priceRange: restaurant.priceRange,
      rating: restaurant.rating,
      ratingLabel: restaurant.ratingLabel,
      reviews: restaurant.reviews,
      isSpecial: restaurant.isSpecial,
      isRecommended: restaurant.isRecommended,
      isTrending: restaurant.isTrending,
      features: Array.isArray(restaurant.features) 
        ? restaurant.features.map((f: any) => typeof f === 'string' ? f : f.name)
        : [],
      tables: restaurant.tables
    };
  } catch (error) {
    console.error(`Error fetching restaurant with ID ${id}:`, error);
    return null;
  }
};

export const getRestaurantTables = async (restaurantId: number): Promise<RestaurantTable[]> => {
  const response = await apiClient.get(`/restaurants/${restaurantId}/tables`);
  return response.data.tables;
};

// Tables
export const getTables = async (): Promise<RestaurantTable[]> => {
  const response = await apiClient.get('/tables');
  return response.data.tables;
};

export const getTable = async (id: number): Promise<RestaurantTable> => {
  const response = await apiClient.get(`/tables/${id}`);
  return response.data;
};

// Reservations
export const createReservation = async (reservation: Omit<Reservation, 'id'>): Promise<Reservation> => {
  const response = await apiClient.post('/reservations', reservation);
  return response.data;
};

export const getAvailableTables = async (
  date: string,
  startTime: string,
  endTime: string,
  partySize: number
): Promise<RestaurantTable[]> => {
  const response = await apiClient.get('/tables/available', {
    params: { date, startTime, endTime, partySize },
  });
  return response.data.tables;
}; 