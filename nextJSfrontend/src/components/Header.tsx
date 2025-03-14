'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <svg 
                className="h-8 w-8 text-blue-600" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm3,11H13v2a1,1,0,0,1-2,0V13H9a1,1,0,0,1,0-2h2V9a1,1,0,0,1,2,0v2h2a1,1,0,0,1,0,2Z" />
              </svg>
              <span className="text-xl font-bold text-gray-900">BookBite</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/" className="text-base font-medium text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/reservations" className="text-base font-medium text-gray-700 hover:text-gray-900">
              Reservations
            </Link>
            <Link href="/tables" className="text-base font-medium text-gray-700 hover:text-gray-900">
              Tables
            </Link>
            <Link href="/about" className="text-base font-medium text-gray-700 hover:text-gray-900">
              About
            </Link>
            <Link href="/reservations/new" className="ml-2 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 pb-5 border-t border-gray-200">
            <div className="space-y-1 px-2 pt-2 pb-3 grid grid-cols-1 gap-3">
              <Link href="/" className="text-base font-medium text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md hover:bg-gray-50">
                Home
              </Link>
              <Link href="/reservations" className="text-base font-medium text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md hover:bg-gray-50">
                Reservations
              </Link>
              <Link href="/tables" className="text-base font-medium text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md hover:bg-gray-50">
                Tables
              </Link>
              <Link href="/about" className="text-base font-medium text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md hover:bg-gray-50">
                About
              </Link>
              <Link href="/reservations/new" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 w-full">
                Book Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
} 