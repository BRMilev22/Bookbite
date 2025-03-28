'use client';

import Link from 'next/link';
import { Button, Card, Image } from "@heroui/react";
import { StarIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Restaurant, getRestaurants } from '@/lib/api';

// Unsplash restaurant images - must match EXACTLY with the array in restaurants/[id]/page.tsx
const restaurantImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
];

// Cuisine types
const cuisineTypes = [
  { name: "Italian", image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
  { name: "Seafood", image: "https://images.unsplash.com/photo-1579617385447-e27d2ccfed18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
  { name: "Mexican", image: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
  { name: "Steakhouse", image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
  { name: "Vegetarian", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
  { name: "Asian Fusion", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
];

// Rating component
const Rating = ({ score }: { score: number }) => {
  return (
    <div className="flex items-center gap-1 bg-tableease-darkgray bg-opacity-75 px-2 py-1 rounded-md backdrop-blur-sm">
      <StarIcon className="h-4 w-4 text-tableease-primary" />
      <span className="font-medium text-white text-xs">
        {score.toFixed(1)}
      </span>
    </div>
  );
};

// Restaurant card component
const RestaurantCard = ({ 
  name, 
  image, 
  rating, 
  priceRange, 
  location,
  category,
  id
}: { 
  name: string;
  image: string;
  rating: number;
  priceRange: string;
  location: string;
  category: string;
  id: number;
}) => {
  // Use consistent image based on ID for the same behavior as restaurants page
  const getConsistentImage = (id: number, originalImage?: string) => {
    if (originalImage && originalImage.startsWith('http') && !originalImage.includes('placeholder')) {
      return originalImage;
    }
    
    // Use same formula as in restaurant detail page - consistent image per ID
    const imageIndex = id % restaurantImages.length;
    return restaurantImages[imageIndex];
  };

  const restaurantImage = getConsistentImage(id, image);

  return (
    <div className="bg-tableease-darkgray backdrop-blur-sm bg-opacity-80 border border-gray-700 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02]"
      onClick={() => window.location.href = `/restaurants/${id}`}
    >
      <div className="relative h-56 w-full bg-tableease-darkergray">
        {/* Show a loading placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">
            <svg className="h-16 w-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <Image
          src={restaurantImage}
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
          className="brightness-75 hover:brightness-90 transition-all duration-300"
          onError={(e) => {
            // If image fails to load, use fallback
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite error loop
            target.src = restaurantImages[0]; // Use first restaurant image as fallback
          }}
        />
        <div className="absolute top-4 right-4">
          <div className="flex items-center bg-tableease-primary text-white px-3 py-1 rounded-full shadow-lg">
            <span className="font-bold mr-1">{rating}</span>
            <span>{rating > 4.5 ? 'Excellent' : rating > 4 ? 'Very Good' : rating > 3 ? 'Good' : 'Average'}</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{name}</h3>
          <div className="flex items-center text-gray-200">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{location}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 text-gray-300">
          <span>{category}</span>
          <span className="mx-2">•</span>
          <span>{priceRange}</span>
        </div>
        
        <Link 
          href={`/restaurants/${id}`}
          className="bg-tableease-primary hover:bg-tableease-secondary text-tableease-dark font-medium px-4 py-2 rounded-md text-sm inline-flex items-center transition-all duration-300"
        >
          View Details
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};

// Category card component
const CategoryCard = ({ image, name }: { image: string; name: string }) => {
  return (
    <div className="relative rounded-xl overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700 transform hover:-translate-y-1 bg-tableease-darkgray backdrop-blur-sm bg-opacity-80">
      <Image
        src={image}
        alt={name}
        fill
        style={{ objectFit: 'cover' }}
        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110 brightness-75 hover:brightness-90"
        onError={(e) => {
          // If image fails to load, use fallback
          const target = e.target as HTMLImageElement;
          target.onerror = null; // Prevent infinite error loop
          target.src = cuisineTypes[0].image; // Use first cuisine image as fallback
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <span className="bg-tableease-primary text-tableease-dark text-xs font-medium px-3 py-1 rounded-full mb-2 inline-block shadow-lg">
          Category
        </span>
        <h3 className="text-white font-bold text-xl drop-shadow-md">{name}</h3>
        <div className="mt-2 flex items-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>View restaurants</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getRestaurants();
        setRestaurants(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="bg-gradient-to-b from-tableease-dark to-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative bg-black">
          <Image
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
            alt="Restaurant atmosphere"
            fill
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tableease-dark to-transparent opacity-80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-tableease-dark to-transparent opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-4xl px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
              Find Your Perfect Table
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
              Discover the best dining experience with BookBite - instant reservations for your next memorable meal
            </p>
            
            {/* Reservation Form */}
            <div className="bg-tableease-darkgray backdrop-blur-sm bg-opacity-80 rounded-xl p-6 shadow-xl border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <select className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500">
                    <option>Select Restaurant</option>
                    {restaurants && restaurants.length > 0 ? (
                      restaurants.map(restaurant => (
                        <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                      ))
                    ) : (
                      <option disabled>Loading restaurants...</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input type="date" className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500" placeholder="Pick Date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                  <select className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500">
                    <option>Select Time</option>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i < 10 ? `0${i}` : `${i}`;
                      return <option key={hour} value={`${hour}:00`}>{`${hour}:00`}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Guests</label>
                  <select className="w-full p-3 bg-tableease-darkergray text-black border border-gray-600 rounded-lg focus:ring-tableease-primary focus:border-tableease-primary transition-all duration-200 hover:border-gray-500">
                    <option>Number of Guests</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  className="bg-tableease-primary hover:bg-tableease-secondary text-tableease-dark font-medium px-8 py-3 rounded-full flex items-center transition-all duration-300"
                >
                  <span className="mr-2">Find a Table</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center">
            <div className="w-10 h-1 bg-tableease-primary rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-white inline-flex items-center">
              <svg className="w-6 h-6 mr-2 text-tableease-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Popular Categories
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cuisineTypes.slice(0, 4).map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Top-rated Eateries Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-gray-900 to-tableease-dark">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center">
            <div className="w-10 h-1 bg-tableease-primary rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-white inline-flex items-center">
              <svg className="w-6 h-6 mr-2 text-tableease-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Top-rated Eateries
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tableease-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id} 
                  id={restaurant.id}
                  name={restaurant.name}
                  image={restaurant.image}
                  rating={restaurant.rating}
                  priceRange={restaurant.priceRange}
                  location={restaurant.location}
                  category={restaurant.category}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Club Membership Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-tableease-darkgray backdrop-blur-sm bg-opacity-80 p-8 rounded-xl shadow-xl border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center">
              <div className="bg-tableease-primary p-4 rounded-lg mr-4 shadow-lg">
                <svg className="h-7 w-7 text-tableease-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h2 className="text-white text-xl font-bold">Join the Rewards Program</h2>
                </div>
                <p className="text-tableease-textgray text-sm mt-1">Unlock exclusive deals and discounts for a delightful dining experience. Join our BookBite Club now!</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button className="bg-tableease-primary hover:bg-tableease-secondary text-tableease-dark font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                Learn More
              </Button>
              <Button className="bg-white hover:bg-gray-100 text-tableease-dark font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                Register
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
