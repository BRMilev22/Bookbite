import { NextResponse } from 'next/server';

// Endpoint: GET /api/restaurants/[id]/tables
// Description: Fetch tables for a specific restaurant with availability information
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    const { searchParams } = new URL(request.url);
    
    // Extract parameters for availability check
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const partySize = searchParams.get('partySize');
    
    // Build query parameters for backend API
    const backendParams = new URLSearchParams();
    if (date) backendParams.append('date', date);
    if (time) backendParams.append('time', time);
    if (partySize) backendParams.append('partySize', partySize);
    
    // Backend API URL (assuming running locally)
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    const response = await fetch(
      `${backendUrl}/api/restaurants/${restaurantId}/tables/availability?${backendParams.toString()}`
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        );
      }
      
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }
    
    const tables = await response.json();
    return NextResponse.json(tables);
  } catch (error) {
    console.error(`Error fetching tables for restaurant ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant tables' },
      { status: 500 }
    );
  }
} 