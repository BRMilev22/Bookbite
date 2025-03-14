'use client';

import { useState, useEffect } from 'react';
import { getTables, RestaurantTable } from '@/lib/api';

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoading(true);
        const data = await getTables();
        setTables(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tables:', err);
        setError('Failed to load tables. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Our Restaurant Tables</h1>
      
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <div 
              key={table.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Table #{table.tableNumber}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    table.capacity <= 2 ? 'bg-blue-100 text-blue-800' : 
                    table.capacity <= 4 ? 'bg-green-100 text-green-800' : 
                    table.capacity <= 6 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {table.capacity} {table.capacity === 1 ? 'Person' : 'People'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span>{table.location}</span>
                </div>
                <div className="mt-4">
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
                    onClick={() => window.location.href = `/reservations/new?tableId=${table.id}`}
                  >
                    Reserve This Table
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && !error && tables.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">No tables available at the moment.</p>
        </div>
      )}
    </div>
  );
} 