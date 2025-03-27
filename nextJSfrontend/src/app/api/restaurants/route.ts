import { NextResponse } from 'next/server';

// Endpoint: GET /api/restaurants
// Description: Fetch all restaurants or filter by provided query parameters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    const minRating = searchParams.get('minRating');
    const priceRange = searchParams.get('priceRange');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const partySize = searchParams.get('partySize');
    
    // Build query parameters for backend API
    const backendParams = new URLSearchParams();
    if (location) backendParams.append('location', location);
    if (category) backendParams.append('category', category);
    if (minRating) backendParams.append('minRating', minRating);
    if (priceRange) backendParams.append('priceRange', priceRange);
    if (date) backendParams.append('date', date);
    if (time) backendParams.append('time', time);
    if (partySize) backendParams.append('partySize', partySize);
    
    // Backend API URL (assuming running locally)
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/restaurants?${backendParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }
    
    const restaurants = await response.json();
    return NextResponse.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
} 