'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@heroui/react";
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // Reload to ensure state is fresh
    window.location.href = '/';
  };
  
  const menuItems = [
    { name: "Table", href: "/table" },
    { name: "Interactive", href: "/interactive" },
    { name: "Book Now", href: "/reservations/new" },
  ];

  // Add admin dashboard menu item if user is admin
  if (isAdmin) {
    menuItems.push({ name: "Admin Dashboard", href: "/admin/dashboard" });
  }

  return (
    <header className="bg-tableease-dark border-b border-tableease-lightgray">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-tableease-primary text-xl font-bold">BookBite</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-10">
            <Link href="/" className="font-medium text-gray-500 hover:text-gray-900 transition duration-300">
              Home
            </Link>
            <Link href="/restaurants" className="font-medium text-gray-500 hover:text-gray-900 transition duration-300">
              Restaurants
            </Link>
            <Link href="/about" className="font-medium text-gray-500 hover:text-gray-900 transition duration-300">
              About
            </Link>
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-tableease-textgray hover:text-white px-3 py-2 text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              as={Link}
              href="/reservations/new"
              className="bg-white hover:bg-gray-100 text-tableease-dark font-medium px-4 py-2 rounded-md text-sm"
            >
              Reserve
            </Button>
            
            {!user ? (
              <>
                <Button
                  as={Link}
                  href="/auth/login"
                  className="bg-tableease-primary hover:bg-tableease-secondary text-tableease-dark font-medium px-4 py-2 rounded-md text-sm"
                >
                  Login
                </Button>
                <Button
                  as={Link}
                  href="/auth/register"
                  className="bg-tableease-secondary hover:bg-tableease-primary text-tableease-dark font-medium px-4 py-2 rounded-md text-sm"
                >
                  Register
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="text-white hover:text-tableease-primary"
                >
                  Hello, {user.firstName}
                </Link>
                <Button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md text-sm"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-tableease-lightgray rounded-md p-2 inline-flex items-center justify-center text-white hover:bg-tableease-darkgray focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden bg-tableease-darkgray border-t border-tableease-lightgray">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="py-3">
              <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition duration-300">
                Home
              </Link>
              <Link href="/restaurants" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition duration-300">
                Restaurants
              </Link>
              <Link href="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition duration-300">
                About
              </Link>
            </div>
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:bg-tableease-lightgray block px-3 py-2 rounded-md text-base font-medium"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 mt-3 px-3 py-2">
              <Button
                as={Link}
                href="/reservations/new"
                className="bg-white hover:bg-gray-100 text-tableease-dark font-medium py-2 rounded-md text-sm w-full text-center"
              >
                Reserve
              </Button>
              
              {!user ? (
                <>
                  <Button
                    as={Link}
                    href="/auth/login"
                    className="bg-tableease-primary hover:bg-tableease-secondary text-tableease-dark font-medium py-2 rounded-md text-sm w-full text-center"
                  >
                    Login
                  </Button>
                  <Button
                    as={Link}
                    href="/auth/register"
                    className="bg-tableease-secondary hover:bg-tableease-primary text-tableease-dark font-medium py-2 rounded-md text-sm w-full text-center"
                  >
                    Register
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className="text-white hover:bg-tableease-lightgray block px-3 py-2 rounded-md text-base font-medium"
                  >
                    My Profile
                  </Link>
                  <Button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-md text-sm w-full text-center"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 