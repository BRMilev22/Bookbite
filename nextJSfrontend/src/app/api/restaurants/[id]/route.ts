import { NextResponse } from 'next/server';

// Endpoint: GET /api/restaurants/[id]
// Description: Fetch details for a specific restaurant
export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;
    
    // Backend API URL (assuming running locally)
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';
    const response = await fetch(`${backendUrl}/api/restaurants/${restaurantId}`);
    
    if (!response.ok) {
      // If restaurant is not found, return 404
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Restaurant not found' },
          { status: 404 }
        );
      }
      
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
    }
    
    const restaurant = await response.json();
    return NextResponse.json(restaurant);
  } catch (error) {
    console.error(`Error fetching restaurant ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant details' },
      { status: 500 }
    );
  }
} 