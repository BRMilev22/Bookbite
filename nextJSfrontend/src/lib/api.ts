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
  tableNumber: number;
  capacity: number;
  location: string;
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