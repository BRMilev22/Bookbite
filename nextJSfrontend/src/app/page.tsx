'use client';

import Link from 'next/link';
import { Button, Card, Image } from "@heroui/react";
import { StarIcon } from '@heroicons/react/24/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Restaurant, getRestaurants } from '@/lib/api';

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
  return (
    <Card className="bg-tableease-darkgray text-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-700 transform hover:-translate-y-1 hover:scale-[1.02]">
      <div className="relative">
        <Image
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <Rating score={rating} />
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-tableease-darkgray bg-opacity-75 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
            {priceRange}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-col">
          <span className="category-chip mb-2 inline-block">{category}</span>
          <h3 className="text-lg font-semibold mb-1">{name}</h3>
          <p className="text-tableease-textgray text-sm mb-3">
            <span className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-tableease-textgray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
          </p>
        </div>
        <Link 
          href={`/restaurants/${id}`}
          className="tableease-btn mt-2 text-sm inline-flex items-center justify-center"
        >
          View Details
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </Card>
  );
};

// Category card component
const CategoryCard = ({ image, name }: { image: string; name: string }) => {
  return (
    <div className="relative rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-all duration-300 border border-gray-700 transform hover:-translate-y-1">
      <Image
        src={image}
        alt={name}
        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <span className="bg-tableease-primary text-tableease-dark text-xs font-medium px-2 py-1 rounded-full mb-2 inline-block">
          Category
        </span>
        <h3 className="text-white font-semibold text-lg">{name}</h3>
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

  const cuisineTypes = [
    { name: "Italian", image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
    { name: "Seafood", image: "https://images.unsplash.com/photo-1579617385447-e27d2ccfed18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
    { name: "Mexican", image: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
    { name: "Steakhouse", image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
    { name: "Vegetarian", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
    { name: "Asian Fusion", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" },
  ];

  return (
    <div className="bg-tableease-dark text-white">
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
            <div className="bg-tableease-darkgray rounded-lg p-6 shadow-lg border border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <select className="tableease-input w-full">
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
                  <input type="date" className="tableease-input w-full" placeholder="Pick Date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                  <select className="tableease-input w-full">
                    <option>Select Time</option>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i < 10 ? `0${i}` : `${i}`;
                      return <option key={hour} value={`${hour}:00`}>{`${hour}:00`}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Guests</label>
                  <select className="tableease-input w-full">
                    <option>Number of Guests</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  className="tableease-btn px-8 py-3 rounded-full flex items-center"
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
            <h2 className="text-2xl font-bold text-white">Popular Categories</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cuisineTypes.slice(0, 4).map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Top-rated Eateries Section */}
      <section className="py-12 px-4 bg-tableease-dark">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center">
            <div className="w-10 h-1 bg-tableease-primary rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-white">Top-rated Eateries</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-8 bg-tableease-darkgray rounded-lg p-8">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-10 w-10 bg-tableease-lightgray rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-tableease-lightgray rounded mb-2"></div>
                <div className="h-3 w-32 bg-tableease-lightgray rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 bg-red-900 bg-opacity-20 rounded-lg p-8">
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
      <section className="py-12 px-4 bg-gradient-to-r from-tableease-darkgray to-tableease-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 bg-tableease-darkgray p-8 rounded-xl shadow-lg border border-gray-700">
          <div className="flex items-center">
            <div className="bg-tableease-primary p-4 rounded-lg mr-4">
              <svg className="h-7 w-7 text-tableease-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h2 className="text-white text-xl font-semibold">Join the Rewards Program</h2>
              </div>
              <p className="text-tableease-textgray text-sm mt-1">Unlock exclusive deals and discounts for a delightful dining experience. Join our BookBite Club now!</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button className="tableease-btn px-6 py-2">
              Learn More
            </Button>
            <Button className="bg-white hover:bg-gray-100 text-tableease-dark font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
              Register
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
