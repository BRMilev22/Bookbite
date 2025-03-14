'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createCustomer, createReservation, getTables, RestaurantTable } from '@/lib/api';

export default function NewReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTableId = searchParams.get('tableId');
  
  const [step, setStep] = useState<'customerInfo' | 'reservationDetails'>('customerInfo');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Customer form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Reservation form state
  const [tableId, setTableId] = useState(preselectedTableId || '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [partySize, setPartySize] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await getTables();
        setTables(data);
      } catch (err) {
        console.error('Failed to fetch tables:', err);
        setError('Failed to load tables. Please try again later.');
      }
    };
    
    fetchTables();
  }, []);
  
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone) {
      setError('Please fill out all required fields.');
      return;
    }
    setError(null);
    setStep('reservationDetails');
  };
  
  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableId || !date || !startTime || !endTime || !partySize) {
      setError('Please fill out all required fields.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create customer first
      const customerResponse = await createCustomer({
        firstName,
        lastName,
        email,
        phone
      });
      
      // Then create reservation with the customer ID
      await createReservation({
        customerId: customerResponse.id,
        tableId: parseInt(tableId),
        reservationDate: date,
        startTime,
        endTime,
        partySize: parseInt(partySize),
        status: 'pending',
        specialRequests
      });
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/reservations');
      }, 3000);
      
    } catch (err) {
      console.error('Failed to create reservation:', err);
      setError('Failed to create reservation. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Make a Reservation</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Your reservation has been created successfully! Redirecting to reservations page...
        </div>
      )}
      
      {!success && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === 'customerInfo' ? 'bg-blue-600' : 'bg-green-600'
              } text-white font-bold`}>
                1
              </div>
              <div className="h-1 flex-1 mx-2 bg-gray-300">
                <div className={`h-1 ${
                  step === 'reservationDetails' ? 'bg-green-600' : 'bg-blue-600'
                }`} style={{ width: step === 'customerInfo' ? '0%' : '100%' }}></div>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === 'customerInfo' ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white'
              } font-bold`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium">Customer Information</span>
              <span className="text-sm font-medium">Reservation Details</span>
            </div>
          </div>
          
          {step === 'customerInfo' && (
            <form onSubmit={handleCustomerSubmit}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next
                </button>
              </div>
            </form>
          )}
          
          {step === 'reservationDetails' && (
            <form onSubmit={handleReservationSubmit}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Reservation Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="table" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Table *
                    </label>
                    <select
                      id="table"
                      value={tableId}
                      onChange={(e) => setTableId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a table</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          Table #{table.tableNumber} - {table.capacity} Seats ({table.location})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="partySize" className="block text-sm font-medium text-gray-700 mb-1">
                      Party Size *
                    </label>
                    <input
                      type="number"
                      id="partySize"
                      min="1"
                      max="20"
                      value={partySize}
                      onChange={(e) => setPartySize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                      Special Requests
                    </label>
                    <textarea
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep('customerInfo')}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Make Reservation'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
} 