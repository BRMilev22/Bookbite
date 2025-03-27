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
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
    time: '19:00', // Default time: 7 PM
    partySize: 2,
  });
  
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
        
        // Fetch table availability with query parameters
        const queryParams = new URLSearchParams({
          date: reservationDetails.date,
          time: reservationDetails.time,
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
  
  // Handle table selection
  const handleTableClick = (table: RestaurantTable) => {
    if (!table.isAvailable) {
      return; // Table is not available
    }
    
    setSelectedTable(table === selectedTable ? null : table);
  };
  
  // Handle reservation details change
  const handleDetailsChange = (field: keyof ReservationDetails, value: string | number) => {
    setReservationDetails(prev => ({
      ...prev,
      [field]: value,
    }));
    setSelectedTable(null); // Reset selected table when changing reservation details
  };
  
  // Handle reservation submission
  const handleReserveTable = () => {
    if (!selectedTable || !restaurant) return;
    
    // Navigate to reservation form with pre-filled details
    router.push(
      `/reservations/new?restaurantId=${restaurantId}` +
      `&restaurantName=${encodeURIComponent(restaurant.name)}` + 
      `&tableId=${selectedTable.id}` +
      `&tableNumber=${selectedTable.tableNumber}` +
      `&date=${reservationDetails.date}` +
      `&time=${reservationDetails.time}` +
      `&partySize=${selectedTable.capacity}` // Use table capacity instead of current party size
    );
  };
  
  // Render table on canvas
  const renderTable = (table: RestaurantTable) => {
    const isSelected = selectedTable?.id === table.id;
    const tableColor = table.isAvailable 
      ? isSelected ? 'bg-tableease-primary' : 'bg-green-500'
      : 'bg-red-500';
    
    const tableStyles = {
      position: 'absolute',
      left: `${table.positionX}px`,
      top: `${table.positionY}px`,
      width: `${table.width}px`,
      height: `${table.height}px`,
      borderRadius: table.shape === 'circle' ? '50%' : '4px',
      cursor: table.isAvailable ? 'pointer' : 'not-allowed',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontWeight: 'bold',
      border: isSelected ? '3px solid white' : 'none',
    };
    
    return (
      <div 
        key={table.id}
        className={`${tableColor} shadow transition-all duration-200 hover:shadow-lg`}
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
    <div className="bg-tableease-dark min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Restaurant header */}
        <div className="mb-8">
          <Link href="/restaurants" className="text-tableease-primary hover:underline mb-4 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to restaurants
          </Link>
          
          {restaurant && (
            <>
              <div className="bg-tableease-darkgray border border-gray-700 rounded-lg overflow-hidden">
                <div className="relative h-64 w-full bg-tableease-darkergray">
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
                    onError={(e) => {
                      // If image fails to load, use fallback
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite error loop
                      target.src = fallbackImage; // Use main fallback image for consistency
                    }}
                    priority // Add priority to ensure image loads first
                  />
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center bg-tableease-primary text-white px-3 py-1 rounded-full">
                      <span className="font-bold mr-1">{restaurant.rating}</span>
                      <span>{restaurant.ratingLabel}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-white mb-4">{restaurant.name}</h1>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center text-gray-400 mb-2">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>{restaurant.location} • {restaurant.distance}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400 mb-2">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>Capacity from 1 to 10 people</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-400 mb-2">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                        </svg>
                        <span>{restaurant.reviews} reviews</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1H3.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                        </svg>
                        <span>{restaurant.category}</span>
                        <span className="mx-2">•</span>
                        <span>{restaurant.priceRange}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.features.map((feature) => (
                      <span key={feature.id} className="bg-tableease-darkergray text-gray-300 px-3 py-1 rounded-full">
                        {feature.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Reservation options */}
              <div className="bg-tableease-darkgray border border-gray-700 rounded-lg p-6 mb-8 mt-8">
                <h2 className="text-2xl font-semibold mb-4 text-white">Choose Your Table</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      className="w-full p-2 bg-white text-gray-800 border border-gray-300 rounded focus:ring-tableease-primary focus:border-tableease-primary"
                      value={reservationDetails.date}
                      onChange={(e) => handleDetailsChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                      Time
                    </label>
                    <select
                      id="time"
                      className="w-full p-2 bg-white text-gray-800 border border-gray-300 rounded focus:ring-tableease-primary focus:border-tableease-primary"
                      value={reservationDetails.time}
                      onChange={(e) => handleDetailsChange('time', e.target.value)}
                    >
                      <option value="17:00">5:00 PM</option>
                      <option value="17:30">5:30 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="18:30">6:30 PM</option>
                      <option value="19:00">7:00 PM</option>
                      <option value="19:30">7:30 PM</option>
                      <option value="20:00">8:00 PM</option>
                      <option value="20:30">8:30 PM</option>
                      <option value="21:00">9:00 PM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="partySize" className="block text-sm font-medium text-gray-300 mb-2">
                      Party Size
                    </label>
                    <select
                      id="partySize"
                      className="w-full p-2 bg-white text-gray-800 border border-gray-300 rounded focus:ring-tableease-primary focus:border-tableease-primary"
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
                
                <div className="bg-tableease-darkergray p-3 rounded mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                        <span className="text-sm text-gray-300">Available</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                        <span className="text-sm text-gray-300">Reserved</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-tableease-primary border-2 border-white rounded mr-2"></div>
                        <span className="text-sm text-gray-300">Selected</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-300">Click on an available table to select it</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Interactive table layout */}
          {restaurant && (
            <div className="bg-tableease-darkgray border border-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-white">Table Layout</h2>
              
              {tables.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No tables available for this restaurant or selected criteria.
                </div>
              ) : (
                <div className="relative w-full max-w-3xl mx-auto bg-tableease-darkergray border border-gray-600 rounded-lg" style={{ height: `${canvasHeight}px`, width: `${canvasWidth}px` }}>
                  {tables
                    .filter(table => table.capacity >= reservationDetails.partySize) // Filter tables by party size
                    .map(renderTable)
                  }
                  
                  {/* Wall decorations */}
                  <div className="absolute top-0 left-0 w-full h-4 bg-gray-800"></div>
                  <div className="absolute bottom-0 left-0 w-full h-4 bg-gray-800"></div>
                  <div className="absolute top-0 left-0 h-full w-4 bg-gray-800"></div>
                  <div className="absolute top-0 right-0 h-full w-4 bg-gray-800"></div>
                  
                  {/* Entrance */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-gray-500 border-t-2 border-gray-400">
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
                      Entrance
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add message when tables are filtered out */}
              {tables.length > 0 && tables.filter(table => table.capacity >= reservationDetails.partySize).length === 0 && (
                <div className="text-center py-4 mt-4 text-red-400">
                  No tables available for a party of {reservationDetails.partySize}. Please select a smaller party size.
                </div>
              )}
              
              {/* Selected table information */}
              {selectedTable && (
                <div className="mt-6 p-4 bg-tableease-primary/10 border border-tableease-primary rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-white">Selected Table: #{selectedTable.tableNumber}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-300"><span className="font-medium text-white">Type:</span> {selectedTable.tableType}</p>
                      <p className="text-gray-300"><span className="font-medium text-white">Capacity:</span> {selectedTable.capacity} people</p>
                    </div>
                    <div>
                      <p className="text-gray-300"><span className="font-medium text-white">Location:</span> {selectedTable.location}</p>
                      <p className="text-gray-300"><span className="font-medium text-white">Details:</span> {selectedTable.tableDetails || 'No additional details'}</p>
                    </div>
                  </div>
                  
                  <button
                    className="mt-4 w-full py-2 px-4 bg-tableease-primary hover:bg-tableease-primary/90 text-white font-medium rounded-lg shadow transition-colors duration-200"
                    onClick={handleReserveTable}
                  >
                    Reserve This Table
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 