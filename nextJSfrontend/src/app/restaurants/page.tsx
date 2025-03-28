'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RestaurantImage from '@/components/RestaurantImage';

// Restaurant type definition
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

// Filter options type
interface FilterOptions {
  location: string;
  category: string;
  rating: number;
  priceRange: string;
  availability: {
    date: string;
    time: string;
    partySize: number;
  };
}

// Unsplash restaurant images
const restaurantImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
];

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    category: '',
    rating: 0,
    priceRange: '',
    availability: {
      date: new Date().toISOString().split('T')[0], // Default to today
      time: '19:00', // Default time: 19:00
      partySize: 2,
    },
  });

  // Extract query parameters from URL when component mounts
  useEffect(() => {
    // Get the URL search params
    const queryParams = new URLSearchParams(window.location.search);
    let filtersChanged = false;
    
    // Extract category from URL if present
    const categoryParam = queryParams.get('category');
    if (categoryParam) {
      setFilters(prev => {
        filtersChanged = true;
        return {
          ...prev,
          category: categoryParam
        };
      });
    }
    
    // Extract other potential params
    const locationParam = queryParams.get('location');
    if (locationParam) {
      setFilters(prev => {
        filtersChanged = true;
        return {
          ...prev,
          location: locationParam
        };
      });
    }
    
    const ratingParam = queryParams.get('minRating');
    if (ratingParam && !isNaN(parseFloat(ratingParam))) {
      setFilters(prev => {
        filtersChanged = true;
        return {
          ...prev,
          rating: parseFloat(ratingParam)
        };
      });
    }

    // Mark initial load as done, even if no filters were changed
    setInitialLoadDone(true);
  }, []);

  // Fetch restaurants based on filters - only trigger after initialLoadDone
  useEffect(() => {
    // Skip the first render if we need to load filters from URL
    if (!initialLoadDone) return;

    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        // Build query parameters from filters
        const queryParams = new URLSearchParams();
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.rating > 0) queryParams.append('minRating', filters.rating.toString());
        if (filters.priceRange) queryParams.append('priceRange', filters.priceRange);
        
        // Append availability filters if all are provided
        if (filters.availability.date && filters.availability.time && filters.availability.partySize) {
          queryParams.append('date', filters.availability.date);
          queryParams.append('time', filters.availability.time);
          queryParams.append('partySize', filters.availability.partySize.toString());
        }

        const response = await fetch(`/api/restaurants?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();
        
        // Add consistent images to restaurants based on ID
        const restaurantsWithImages = data.map((restaurant: Restaurant) => {
          // If image is missing or placeholder, use consistent fallback based on ID
          if (!restaurant.imageUrl || 
              restaurant.imageUrl === 'placeholder' || 
              restaurant.imageUrl.includes('placeholder.com') ||
              !restaurant.imageUrl.startsWith('http')) {
            // Use the same formula as in the detail page
            const imageIndex = restaurant.id % restaurantImages.length;
            return {
              ...restaurant,
              imageUrl: restaurantImages[imageIndex]
            };
          }
          return restaurant;
        });
        
        setRestaurants(restaurantsWithImages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [filters, initialLoadDone]);

  // Handle filter changes
  const handleFilterChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      // Handle nested fields (e.g., availability.date)
      const [parent, child] = field.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FilterOptions],
          [child]: value,
        },
      }));
    } else {
      // Handle top-level fields
      setFilters(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Navigate to restaurant detail page
  const handleRestaurantClick = (restaurantId: number) => {
    router.push(`/restaurants/${restaurantId}`);
  };

  return (
    <div className="bg-gradient-to-b from-tableease-dark to-gray-900 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white inline-flex items-center">
          <svg className="w-7 h-7 mr-2 text-tableease-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find Your Perfect Table
        </h1>
        
        {/* Filters section */}
        <div className="bg-tableease-darkgray backdrop-blur-sm bg-opacity-80 border border-gray-700 p-6 mb-8 rounded-xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Location filter */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <select
                id="location"
                className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="City Center">City Center</option>
                <option value="Waterfront">Waterfront</option>
                <option value="Downtown">Downtown</option>
                <option value="Botanical Garden">Botanical Garden</option>
                <option value="Cultural District">Cultural District</option>
              </select>
            </div>
            
            {/* Category filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Cuisine
              </label>
              <select
                id="category"
                className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Cuisines</option>
                <option value="Italian">Italian</option>
                <option value="Seafood">Seafood</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Asian Fusion">Asian Fusion</option>
                <option value="Steakhouse">Steakhouse</option>
              </select>
            </div>
            
            {/* Date filter */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500"
                value={filters.availability.date}
                onChange={(e) => handleFilterChange('availability.date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {/* Time filter */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                Time
              </label>
              <select
                id="time"
                className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500"
                value={filters.availability.time}
                onChange={(e) => handleFilterChange('availability.time', e.target.value)}
              >
                <option value="17:00">17:00</option>
                <option value="17:30">17:30</option>
                <option value="18:00">18:00</option>
                <option value="18:30">18:30</option>
                <option value="19:00">19:00</option>
                <option value="19:30">19:30</option>
                <option value="20:00">20:00</option>
                <option value="20:30">20:30</option>
                <option value="21:00">21:00</option>
              </select>
            </div>
            
            {/* Party size filter */}
            <div>
              <label htmlFor="partySize" className="block text-sm font-medium text-gray-300 mb-2">
                Party Size
              </label>
              <select
                id="partySize"
                className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500"
                value={filters.availability.partySize}
                onChange={(e) => handleFilterChange('availability.partySize', parseInt(e.target.value, 10))}
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
        </div>
        
        {/* Results section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tableease-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded">
            Error: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">No restaurants found matching your criteria.</p>
                <p className="text-gray-500">Try adjusting your filters.</p>
              </div>
            ) : (
              restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => handleRestaurantClick(restaurant.id)}
                  className="bg-tableease-darkgray border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-tableease-primary hover:shadow-md cursor-pointer transform transition duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <RestaurantImage
                      restaurantId={restaurant.id}
                      initialImageUrl={restaurant.imageUrl}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                    {restaurant.isSpecial && (
                      <div className="absolute top-3 left-3 bg-tableease-primary text-black text-xs font-bold px-2 py-1 rounded">
                        Special Offer
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-tableease-primary mb-2">{restaurant.name}</h3>
                    <div className="flex items-center text-gray-400 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>{restaurant.location} • {restaurant.distance}</span>
                    </div>
                    <div className="flex items-center text-gray-400 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                      </svg>
                      <span>{restaurant.reviews} reviews</span>
                    </div>
                    
                    <div className="mb-3 text-gray-300">
                      <span>{restaurant.category}</span>
                      <span className="mx-2">•</span>
                      <span>{restaurant.priceRange}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {restaurant.features.map((feature) => (
                        <span key={feature.id} className="bg-tableease-dark/40 text-gray-300 px-3 py-1 rounded-full text-sm font-medium">
                          {feature.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 