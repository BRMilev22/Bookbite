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
  const response = await apiClient.get('/restaurants');
  return response.data.restaurants;
};

export const getRestaurant = async (id: number): Promise<Restaurant> => {
  const response = await apiClient.get(`/restaurants/${id}`);
  return response.data;
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