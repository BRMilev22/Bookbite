'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Image } from "@heroui/react";
import { StarIcon } from '@heroicons/react/24/solid';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Restaurant, getRestaurants } from '@/lib/api';

export default function ReservationsPage() {
  const [showFilter, setShowFilter] = useState(false);
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
    <div className="bg-tableease-dark min-h-screen pt-8 px-4">
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 mr-8">
          <div className="bg-tableease-darkgray rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-6">Search for a table</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Restaurant</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Enter restaurant name"
                    className="tableease-input w-full pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reservation date</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    type="date"
                    className="tableease-input w-full pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reservation time</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <input
                    type="time"
                    className="tableease-input w-full pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Guests</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    placeholder="Number of guests"
                    className="tableease-input w-full pl-10"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price range</label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="tableease-input text-center text-tableease-textgray">$</button>
                  <button className="tableease-input text-center text-tableease-textgray">$$</button>
                  <button className="tableease-input text-center text-tableease-textgray">$$$</button>
                </div>
              </div>
              
              <button className="bg-tableease-primary hover:bg-tableease-secondary text-tableease-dark w-full py-2 rounded-md font-medium mt-2">
                Search
              </button>
            </div>
            
            {/* Additional filters */}
            <div className="mt-8">
              <h3 className="text-white font-medium mb-3">Additional Filters</h3>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="special-offers" 
                    className="w-4 h-4 rounded border-gray-600 text-tableease-primary focus:ring-tableease-primary"
                  />
                  <label htmlFor="special-offers" className="ml-2 text-gray-300 text-sm">Special offers</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="outdoor-seating" 
                    className="w-4 h-4 rounded border-gray-600 text-tableease-primary focus:ring-tableease-primary"
                  />
                  <label htmlFor="outdoor-seating" className="ml-2 text-gray-300 text-sm">Outdoor seating</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="window-view" 
                    className="w-4 h-4 rounded border-gray-600 text-tableease-primary focus:ring-tableease-primary"
                  />
                  <label htmlFor="window-view" className="ml-2 text-gray-300 text-sm">Window view</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="private-dining" 
                    className="w-4 h-4 rounded border-gray-600 text-tableease-primary focus:ring-tableease-primary"
                  />
                  <label htmlFor="private-dining" className="ml-2 text-gray-300 text-sm">Private dining</label>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Mobile filter button */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <button 
            className="bg-tableease-primary text-tableease-dark p-4 rounded-full shadow-lg"
            onClick={() => setShowFilter(!showFilter)}
          >
            {showFilter ? <XMarkIcon className="h-6 w-6" /> : <FunnelIcon className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile filter panel */}
        {showFilter && (
          <div className="md:hidden fixed inset-0 bg-tableease-dark bg-opacity-90 z-40 overflow-y-auto">
            <div className="p-6">
              <button 
                className="absolute top-4 right-4 text-white"
                onClick={() => setShowFilter(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              
              <h2 className="text-lg font-medium text-white mb-6">Filter</h2>
              
              {/* Mobile filter form - would mirror the sidebar form */}
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Restaurant Reservations</h1>
            <p className="text-tableease-textgray">Book a table at your favorite restaurant</p>
          </div>
          
          {/* Results */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">Loading restaurants...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              restaurants.map((restaurant) => (
                <div key={restaurant.id} className="bg-tableease-darkgray rounded-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <Image
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <h2 className="text-xl text-white font-semibold mb-1">{restaurant.name}</h2>
                          <p className="text-tableease-textgray text-sm mb-2">{restaurant.distance}</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {restaurant.features.map((feature, index) => (
                              <span key={index} className="text-xs bg-tableease-darkergray text-tableease-textgray py-1 px-2 rounded-full">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 space-y-2">
                          <h3 className="text-white font-medium">Available Tables</h3>
                          <p className="text-tableease-textgray text-sm">Check availability</p>
                        </div>
                      </div>
                      <div className="mt-auto flex flex-col md:flex-row justify-between items-end">
                        <div className="flex items-center space-x-4 mb-2 md:mb-0">
                          {restaurant.isSpecial && (
                            <span className="text-xs bg-tableease-primary text-tableease-dark py-1 px-2 rounded-full">
                              Special
                            </span>
                          )}
                          {restaurant.isRecommended && (
                            <span className="text-xs bg-green-600 text-white py-1 px-2 rounded-full">
                              Recommended
                            </span>
                          )}
                          {restaurant.isTrending && (
                            <span className="text-xs bg-purple-600 text-white py-1 px-2 rounded-full">
                              Trending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                          <div className="flex items-center">
                            <div className="flex items-center bg-tableease-darkergray rounded-lg py-1 px-3">
                              <span className="text-sm text-white">{restaurant.ratingLabel}</span>
                              <span className="mx-1 text-tableease-textgray">|</span>
                              <span className="flex items-center">
                                {restaurant.rating}
                                <StarIcon className="h-4 w-4 text-tableease-primary ml-1" />
                              </span>
                            </div>
                            <span className="text-tableease-textgray text-xs ml-2">
                              {restaurant.reviews} reviews
                            </span>
                          </div>
                          <div className="text-white font-medium">
                            {restaurant.priceRange}
                          </div>
                          <Link
                            href={`/reservations/${restaurant.id}`}
                            className="bg-tableease-primary hover:bg-tableease-secondary text-tableease-dark px-4 py-2 rounded-md font-medium"
                          >
                            Book Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 