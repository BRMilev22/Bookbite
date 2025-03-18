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
    <div className="flex items-center gap-1">
      <span className="bg-tableease-primary text-tableease-dark font-medium px-2 py-0.5 rounded text-xs">
        {score}
      </span>
      <StarIcon className="h-4 w-4 text-tableease-primary" />
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
    <Card className="bg-tableease-darkgray text-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all">
      <div className="relative">
        <Image
          src={image}
          alt={name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <Rating score={rating} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="category-chip mb-2 inline-block">{category}</span>
            <h3 className="text-lg font-semibold mb-1">{name}</h3>
            <p className="text-tableease-textgray text-sm mb-2">{location}</p>
          </div>
          <span className="price-tag">{priceRange}</span>
        </div>
        <Link 
          href={`/restaurants/${id}`}
          className="flex items-center text-tableease-primary text-sm mt-2 hover:underline"
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
    <div className="relative rounded-lg overflow-hidden group">
      <Image
        src={image}
        alt={name}
        className="w-full h-56 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>
      <div className="absolute bottom-0 left-0 p-4 w-full">
        <h3 className="text-white font-medium text-lg">{name}</h3>
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

  const categories = [
    { name: "Italian", image: "https://via.placeholder.com/600x400?text=Italian" },
    { name: "Seafood", image: "https://via.placeholder.com/600x400?text=Seafood" },
    { name: "Mexican", image: "https://via.placeholder.com/600x400?text=Mexican" },
    { name: "Steakhouse", image: "https://via.placeholder.com/600x400?text=Steakhouse" },
    { name: "Vegetarian", image: "https://via.placeholder.com/600x400?text=Vegetarian" },
    { name: "Asian Fusion", image: "https://via.placeholder.com/600x400?text=Asian+Fusion" },
  ];

  return (
    <div className="bg-tableease-dark text-white">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative bg-black">
          <Image
            src="https://via.placeholder.com/1920x800?text=Restaurant+Atmosphere"
            alt="Restaurant Atmosphere"
            className="w-full h-[600px] object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-tableease-dark to-transparent opacity-80"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-4xl px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover the best dining experience with
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Find the perfect table instantly for your next meal!
            </p>
            
            {/* Reservation Form */}
            <div className="bg-tableease-darkgray rounded-lg p-4 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                  <select className="tableease-input w-full">
                    <option>Select Restaurant</option>
                    {restaurants.map(restaurant => (
                      <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input type="date" className="tableease-input w-full" placeholder="Pick Date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
                  <select className="tableease-input w-full">
                    <option>Select Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Guests</label>
                  <select className="tableease-input w-full">
                    <option>Number of Guests</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button 
                  className="bg-tableease-primary hover:bg-tableease-secondary text-tableease-dark font-medium px-6 py-3 rounded-full"
                >
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
          <h2 className="text-2xl font-bold mb-8">Popular Restaurants</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Top-rated Eateries Section */}
      <section className="py-12 px-4 bg-tableease-dark">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Top-rated Eateries</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading restaurants...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
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
      <section className="py-12 px-4 bg-tableease-darkgray">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center">
            <div className="bg-white p-3 rounded-lg mr-4">
              <svg className="h-6 w-6 text-tableease-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <h2 className="text-white text-xl font-semibold ml-2">Join the Rewards Program</h2>
              </div>
              <p className="text-tableease-textgray text-sm">Unlock exclusive deals and discounts for a delightful dining experience. Join our BookBite Club now!</p>
            </div>
          </div>
          <div>
            <Button className="bg-white hover:bg-gray-100 text-tableease-dark font-medium px-6 py-2 rounded-md">
              Register
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
