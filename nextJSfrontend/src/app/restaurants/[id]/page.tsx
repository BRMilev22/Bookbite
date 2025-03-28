'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Type definitions
interface RestaurantFeature {
  id: number;
  name: string;
}

interface Restaurant {
  id: number;
  name: string;
  imageUrl: string;
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
  features: RestaurantFeature[];
}

interface RestaurantTable {
  id: number;
  restaurantId: number;
  tableNumber: number;
  capacity: number;
  location: string;
  tableType: string;
  tableDetails: string;
  isActive: boolean;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  shape: 'rectangle' | 'circle' | 'custom';
  isAvailable: boolean;
}

interface ReservationDetails {
  date: string;
  time: string;
  endTime?: string; // Optional end time
  partySize: number;
}

// Unsplash restaurant images - must match EXACTLY with the array in restaurants/page.tsx
const restaurantImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
];

// Fallback image is the first image in the array for consistency
const fallbackImage = restaurantImages[0];

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [reservationDetails, setReservationDetails] = useState<ReservationDetails>({
    date: new Date().toISOString().split('T')[0], // Default to today
    time: '19:00', // Default time: 19:00
    endTime: '21:00', // Default end time: 21:00 (2 hours after start time)
    partySize: 2,
  });
  const [tableReservations, setTableReservations] = useState<{[tableId: number]: {startTime: string, endTime: string}[]}>({});
  
  // Canvas dimensions
  const canvasWidth = 600;
  const canvasHeight = 400;
  
  // Fetch restaurant and table data
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoading(true);
      try {
        // Fetch restaurant details
        const restaurantResponse = await fetch(`/api/restaurants/${restaurantId}`);
        if (!restaurantResponse.ok) {
          throw new Error('Failed to fetch restaurant details');
        }
        const restaurantData = await restaurantResponse.json();
        
        // Always set a fallback image for missing, placeholder, or via.placeholder.com URLs
        if (!restaurantData.imageUrl || 
            restaurantData.imageUrl === 'placeholder' || 
            restaurantData.imageUrl.includes('placeholder.com') ||
            !restaurantData.imageUrl.startsWith('http')) {
          // Use consistent image selection based on restaurant ID
          // This ensures the same restaurant always gets the same image
          const restaurantIdNum = parseInt(restaurantId, 10);
          // Use modulo to get index within array range, ensuring same restaurant always gets same image
          const imageIndex = restaurantIdNum % restaurantImages.length;
          restaurantData.imageUrl = restaurantImages[imageIndex];
        }
        
        setRestaurant(restaurantData);
        
        // Fetch table reservations for the date
        const reservationsResponse = await fetch(`/api/restaurants/${restaurantId}/tables?date=${reservationDetails.date}&reservations=true`);
        if (reservationsResponse.ok) {
          const reservationsData = await reservationsResponse.json();
          setTableReservations(reservationsData);
        }
        
        // Fetch table availability with query parameters
        const queryParams = new URLSearchParams({
          date: reservationDetails.date,
          time: reservationDetails.time,
          endTime: reservationDetails.endTime || '', // Include end time if available
          partySize: reservationDetails.partySize.toString(),
        });
        
        const tablesResponse = await fetch(`/api/restaurants/${restaurantId}/tables?${queryParams.toString()}`);
        if (!tablesResponse.ok) {
          throw new Error('Failed to fetch tables');
        }
        const tablesData = await tablesResponse.json();
        setTables(tablesData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    if (restaurantId) {
      fetchRestaurantDetails();
    }
  }, [restaurantId, reservationDetails]);
  
  useEffect(() => {
    const fetchTableReservations = async () => {
      if (!restaurantId || !reservationDetails.date) return;
      
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}/tables/reservations?date=${reservationDetails.date}`);
        if (response.ok) {
          const data = await response.json();
          // Format: { tableId: [{ startTime, endTime }] }
          setTableReservations(data);
        }
      } catch (error) {
        console.error("Error fetching table reservations:", error);
      }
    };
    
    fetchTableReservations();
  }, [restaurantId, reservationDetails.date]);
  
  // Handle table selection
  const handleTableClick = (table: RestaurantTable) => {
    // Always allow selecting a table to see its details
    const isCurrentlySelected = selectedTable?.id === table.id;
    
    if (isCurrentlySelected) {
      // If already selected, deselect it
      setSelectedTable(null);
      return;
    }
    
    setSelectedTable(table);
    
    // If table is not available, fetch and show its reservation details
    if (!table.isAvailable && tableReservations[table.id]) {
      // We already have the reservation data from the initial fetch
      // The UI will show reservation times in the selected table info section
    }
  };
  
  // Add a function to update the default end time when start time changes
  const updateEndTimeFromStartTime = (startTime: string) => {
    // Calculate default end time (2 hours after start time)
    const [hours, minutes] = startTime.split(':').map(Number);
    let endHours = hours + 2;
    if (endHours >= 24) {
      endHours -= 24;
    }
    
    // Format back to HH:MM
    const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return endTime;
  };
  
  // Handle reservation details change
  const handleDetailsChange = (field: keyof ReservationDetails, value: string | number) => {
    setReservationDetails(prev => {
      const newDetails = { ...prev, [field]: value };
      
      // If changing start time, update end time automatically (unless end time was manually set)
      if (field === 'time') {
        newDetails.endTime = updateEndTimeFromStartTime(value as string);
      }
      
      return newDetails;
    });
    setSelectedTable(null); // Reset selected table when changing reservation details
  };
  
  // Handle reservation submission
  const handleReserveTable = () => {
    if (!selectedTable || !restaurant) return;
    
    // Check if the table is available at the selected time
    if (isTableReservedAtTime(selectedTable.id, reservationDetails.time)) {
      // If the table is reserved at this time, don't proceed
      return;
    }
    
    // Get the end time (either specified or default 2 hours later)
    const endTime = reservationDetails.endTime || updateEndTimeFromStartTime(reservationDetails.time);
    
    // Navigate to reservation form with pre-filled details
    router.push(
      `/reservations/new?restaurantId=${restaurantId}` +
      `&restaurantName=${encodeURIComponent(restaurant.name)}` + 
      `&tableId=${selectedTable.id}` +
      `&tableNumber=${selectedTable.tableNumber}` +
      `&date=${reservationDetails.date}` +
      `&time=${reservationDetails.time}` +
      `&endTime=${endTime}` +
      `&partySize=${selectedTable.capacity}` // Use table capacity instead of current party size
    );
  };
  
  // Helper function to check if a table is reserved at the selected time
  const isTableReservedAtTime = (tableId: number, selectedTime: string) => {
    if (!tableReservations[tableId]) return false;
    
    // Convert the selected time to a comparable format (in minutes since midnight)
    const [selectedHours, selectedMinutes] = selectedTime.split(':').map(Number);
    const selectedTimeInMinutes = selectedHours * 60 + selectedMinutes;
    
    // Get the end time (either specified or default 2 hours later)
    const selectedEndTime = reservationDetails.endTime || updateEndTimeFromStartTime(selectedTime);
    const [endHours, endMinutes] = selectedEndTime.split(':').map(Number);
    const selectedEndTimeInMinutes = endHours * 60 + endMinutes;
    
    // Check if any of the table's reservations overlap with the selected time slot
    return tableReservations[tableId].some(reservation => {
      const [startHours, startMinutes] = reservation.startTime.split(':').map(Number);
      const [endHours, endMinutes] = reservation.endTime.split(':').map(Number);
      
      const reservationStartInMinutes = startHours * 60 + startMinutes;
      const reservationEndInMinutes = endHours * 60 + endMinutes;
      
      // Check for overlap between the time slots
      return (reservationStartInMinutes < selectedEndTimeInMinutes && 
              reservationEndInMinutes > selectedTimeInMinutes);
    });
  };
  
  // Render table on canvas with improved styling
  const renderTable = (table: RestaurantTable) => {
    const isSelected = selectedTable?.id === table.id;
    
    // Determine table color based on availability and reservations
    let tableColor;
    let reservedAtSelectedTime = isTableReservedAtTime(table.id, reservationDetails.time);
    
    if (table.isAvailable) {
      tableColor = isSelected ? 'bg-tableease-primary' : 'bg-green-500';
    } else if (reservedAtSelectedTime) {
      tableColor = 'bg-red-500'; // Reserved at the selected time
    } else {
      tableColor = 'bg-yellow-500'; // Reserved at other times
    }
    
    const tableStyles = {
      position: 'absolute',
      left: `${table.positionX}px`,
      top: `${table.positionY}px`,
      width: `${table.width}px`,
      height: `${table.height}px`,
      borderRadius: table.shape === 'circle' ? '50%' : '8px',
      cursor: 'pointer', // Make all tables clickable
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontWeight: 'bold',
      border: isSelected ? '3px solid white' : 'none',
      boxShadow: isSelected ? '0 0 15px rgba(255, 255, 255, 0.6)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    };
    
    return (
      <div 
        key={table.id}
        className={`${tableColor} shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
        style={tableStyles as React.CSSProperties}
        onClick={() => handleTableClick(table)}
        title={`Table ${table.tableNumber} - ${table.capacity} people - ${table.tableType}`}
      >
        {table.tableNumber}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-tableease-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tableease-primary"></div>
      </div>
    );
  }
  
  if (error || !restaurant) {
    return (
      <div className="bg-tableease-dark min-h-screen py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded">
            {error || 'Restaurant not found'}
          </div>
          <div className="mt-4">
            <Link href="/restaurants" className="text-tableease-primary hover:underline">
              Back to restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-b from-tableease-dark to-gray-900 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Restaurant header */}
        <div className="mb-8">
          <Link href="/restaurants" className="text-tableease-primary hover:text-tableease-secondary transition-colors duration-300 mb-4 inline-flex items-center font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to restaurants
          </Link>
          
          {restaurant && (
            <>
              <div className="bg-tableease-darkgray backdrop-blur-sm bg-opacity-80 border border-gray-700 rounded-xl overflow-hidden shadow-xl transition-all duration-500">
                <div className="relative h-80 w-full bg-tableease-darkergray">
                  {/* Show a loading placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse">
                      <svg className="h-16 w-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <Image
                    src={restaurant.imageUrl && !restaurant.imageUrl.includes('placeholder.com') 
                      ? restaurant.imageUrl 
                      : fallbackImage}
                    alt={restaurant.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="brightness-75 hover:brightness-90 transition-all duration-300"
                    onError={(e) => {
                      // If image fails to load, use fallback
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite error loop
                      target.src = fallbackImage; // Use main fallback image for consistency
                    }}
                    priority // Add priority to ensure image loads first
                  />
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-tableease-primary text-white px-3 py-1 rounded-full shadow-lg">
                      <span className="font-bold mr-1">{restaurant.rating}</span>
                      <span>{restaurant.ratingLabel}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">{restaurant.name}</h1>
                    <div className="flex flex-wrap items-center text-gray-200 gap-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{restaurant.location}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>Capacity from 1 to 10 people</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        <span>{restaurant.reviews} reviews</span>
                      </div>
                      <div className="flex items-center">
                        <span>{restaurant.category}</span>
                        <span className="mx-2">•</span>
                        <span>{restaurant.priceRange}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.features.map((feature) => (
                      <span key={feature.id} className="bg-tableease-dark/40 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                        {feature.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Reservation options */}
              <div className="bg-tableease-darkgray backdrop-blur-sm bg-opacity-80 border border-gray-700 rounded-xl p-8 mb-8 mt-8 shadow-xl">
                <h2 className="text-2xl font-bold mb-6 text-white inline-flex items-center">
                  <svg className="w-6 h-6 mr-2 text-tableease-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Choose Your Table
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="md:col-span-1">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500"
                      value={reservationDetails.date}
                      onChange={(e) => handleDetailsChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                      Start Time
                    </label>
                    <select
                      id="time"
                      className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500 [&>option]:text-black"
                      value={reservationDetails.time}
                      onChange={(e) => handleDetailsChange('time', e.target.value)}
                    >
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30</option>
                      <option value="20:00">20:00</option>
                      <option value="20:30">20:30</option>
                      <option value="21:00">21:00</option>
                      <option value="21:30">21:30</option>
                      <option value="22:00">22:00</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-1">
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-2">
                      End Time <span className="text-xs font-normal text-tableease-primary">(Default: +2h)</span>
                    </label>
                    <select
                      id="endTime"
                      className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500 [&>option]:text-black"
                      value={reservationDetails.endTime}
                      onChange={(e) => handleDetailsChange('endTime', e.target.value)}
                    >
                      <option value="12:00">12:00</option>
                      <option value="12:30">12:30</option>
                      <option value="13:00">13:00</option>
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                      <option value="17:30">17:30</option>
                      <option value="18:00">18:00</option>
                      <option value="18:30">18:30</option>
                      <option value="19:00">19:00</option>
                      <option value="19:30">19:30</option>
                      <option value="20:00">20:00</option>
                      <option value="20:30">20:30</option>
                      <option value="21:00">21:00</option>
                      <option value="21:30">21:30</option>
                      <option value="22:00">22:00</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-1">
                    <label htmlFor="partySize" className="block text-sm font-medium text-gray-300 mb-2">
                      Party Size
                    </label>
                    <select
                      id="partySize"
                      className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500 [&>option]:text-black"
                      value={reservationDetails.partySize}
                      onChange={(e) => handleDetailsChange('partySize', parseInt(e.target.value, 10))}
                    >
                      <option value="1">1 person</option>
                      <option value="2">2 people</option>
                      <option value="3">3 people</option>
                      <option value="4">4 people</option>
                      <option value="5">5 people</option>
                      <option value="6">6 people</option>
                      <option value="7">7 people</option>
                      <option value="8">8+ people</option>
                    </select>
                  </div>
                </div>
                
                <div className="bg-tableease-darkergray/70 p-4 rounded-lg mb-6">
                  <h3 className="text-white text-sm font-medium mb-3">Table Legend</h3>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-md shadow-md shadow-green-500/20 mr-2"></div>
                      <span className="text-sm text-gray-300">Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-md shadow-md shadow-yellow-500/20 mr-2"></div>
                      <span className="text-sm text-gray-300">Reserved (at other times)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-md shadow-md shadow-red-500/20 mr-2"></div>
                      <span className="text-sm text-gray-300">Reserved (selected time)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-tableease-primary border-2 border-white rounded-md shadow-md shadow-tableease-primary/20 mr-2"></div>
                      <span className="text-sm text-gray-300">Selected</span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-sm text-gray-300 italic">Click on a table to see details</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Interactive table layout */}
          {restaurant && (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="bg-tableease-darkgray backdrop-blur-sm bg-opacity-80 border border-gray-700 rounded-xl p-8 mb-8 shadow-xl">
                  <h2 className="text-2xl font-bold mb-6 text-white inline-flex items-center">
                    <svg className="w-6 h-6 mr-2 text-tableease-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Table Layout
                  </h2>
                  
                  {tables.length === 0 ? (
                    <div className="text-center py-12 bg-tableease-darkergray/50 rounded-xl border border-gray-700">
                      <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-400 text-lg mb-2">No tables available</p>
                      <p className="text-gray-500 text-sm">Try adjusting your date, time, or party size</p>
                    </div>
                  ) : (
                    <div className="relative w-full mx-auto bg-tableease-darkergray border border-gray-600 rounded-xl overflow-hidden shadow-inner" style={{ height: `${canvasHeight}px`, width: `${canvasWidth}px` }}>
                      {tables
                        .filter(table => table.capacity >= reservationDetails.partySize) // Filter tables by party size
                        .map(renderTable)
                      }
                      
                      {/* Wall decorations with more elegant styling */}
                      <div className="absolute top-0 left-0 w-full h-4 bg-gray-800 bg-opacity-70"></div>
                      <div className="absolute bottom-0 left-0 w-full h-4 bg-gray-800 bg-opacity-70"></div>
                      <div className="absolute top-0 left-0 h-full w-4 bg-gray-800 bg-opacity-70"></div>
                      <div className="absolute top-0 right-0 h-full w-4 bg-gray-800 bg-opacity-70"></div>
                      
                      {/* Entrance with better visual indication */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-6">
                        <div className="absolute top-0 left-0 w-full h-full bg-gray-600 border-t-2 border-gray-400"></div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-medium bg-gray-800 px-3 py-1 rounded-full">
                          Entrance
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Message when tables are filtered out */}
                  {tables.length > 0 && tables.filter(table => table.capacity >= reservationDetails.partySize).length === 0 && (
                    <div className="text-center py-4 mt-6 bg-red-900/20 border border-red-500 text-red-400 rounded-lg">
                      <p className="font-medium">No tables available for a party of {reservationDetails.partySize}.</p>
                      <p className="text-sm">Please select a smaller party size.</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Selected table information in a separate column */}
              <div className="md:col-span-1">
                {selectedTable ? (
                  <div className="sticky top-8 bg-tableease-darkgray backdrop-blur-sm bg-opacity-80 border border-gray-700 rounded-xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <span className={`inline-block w-5 h-5 rounded-full mr-2 ${
                          selectedTable.isAvailable 
                            ? 'bg-green-500' 
                            : isTableReservedAtTime(selectedTable.id, reservationDetails.time)
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                        }`}></span>
                        Table #{selectedTable.tableNumber}
                      </h3>
                      <button 
                        onClick={() => setSelectedTable(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="bg-tableease-darkergray/50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Type</p>
                          <p className="text-white font-medium">{selectedTable.tableType}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Capacity</p>
                          <p className="text-white font-medium">{selectedTable.capacity} people</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Location</p>
                          <p className="text-white font-medium">{selectedTable.location}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Status</p>
                          <p className="text-white font-medium">
                            {selectedTable.isAvailable 
                              ? 'Available' 
                              : isTableReservedAtTime(selectedTable.id, reservationDetails.time)
                                ? 'Reserved at selected time'
                                : 'Reserved at other times'}
                          </p>
                        </div>
                      </div>
                      
                      {selectedTable.tableDetails && (
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Details</p>
                          <p className="text-white">{selectedTable.tableDetails}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Show reservation information if the table is reserved */}
                    {!selectedTable.isAvailable && tableReservations[selectedTable.id] && (
                      <div className="mb-4 bg-tableease-darkergray/50 rounded-lg p-4 border-l-4 border-yellow-500">
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Reservation Times
                        </h4>
                        <ul className="space-y-2">
                          {tableReservations[selectedTable.id].map((reservation, idx) => (
                            <li key={idx} className="text-gray-300 bg-tableease-darkergray/70 px-3 py-2 rounded flex items-center">
                              <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{reservation.startTime} - {reservation.endTime}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-sm text-gray-400">
                          This table is available at other times. Please select a different time slot.
                        </p>
                      </div>
                    )}
                    
                    {/* Only show reserve button if the table is not reserved at the selected time */}
                    {!isTableReservedAtTime(selectedTable.id, reservationDetails.time) && (
                      <button
                        className="w-full py-3 px-4 bg-gradient-to-r from-tableease-primary to-tableease-secondary hover:from-tableease-secondary hover:to-tableease-primary text-white font-bold rounded-lg shadow transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        onClick={handleReserveTable}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Reserve This Table
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="sticky top-8 bg-tableease-darkgray backdrop-blur-sm bg-opacity-80 border border-gray-700 rounded-xl p-6 shadow-xl text-center">
                    <div className="py-8">
                      <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-xl font-bold text-white mb-2">Select a Table</h3>
                      <p className="text-gray-400">Click on any table in the layout to view details and make a reservation.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 