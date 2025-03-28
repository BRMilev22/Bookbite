'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

// Unsplash restaurant images - must match EXACTLY with the arrays in other files
const restaurantImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
];

interface RestaurantImageProps {
  restaurantId: number;
  initialImageUrl?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}

export default function RestaurantImage({
  restaurantId,
  initialImageUrl,
  width,
  height,
  className = '',
  priority = false,
  alt = 'Restaurant',
}: RestaurantImageProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [loading, setLoading] = useState<boolean>(!initialImageUrl);
  const [error, setError] = useState<boolean>(false);

  // Helper function to get fallback image URL
  const getFallbackImageUrl = (id: number): string => {
    const imageIndex = id % restaurantImages.length;
    return restaurantImages[imageIndex];
  };

  // Function to check if image URL is valid
  const isValidImageUrl = (url: string): boolean => {
    return (
      url && 
      url.startsWith('http') && 
      !url.includes('placeholder.com') && 
      url !== 'placeholder'
    );
  };

  useEffect(() => {
    // If we already have a valid image URL from props, don't fetch a new one
    if (initialImageUrl && isValidImageUrl(initialImageUrl)) {
      setImageUrl(initialImageUrl);
      setLoading(false);
      return;
    }

    // Fetch the image URL from the backend
    const fetchImage = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}/image`);
        if (!response.ok) {
          throw new Error('Failed to fetch restaurant image');
        }
        
        const data = await response.json();
        
        // Check if the returned image URL is valid
        if (data.imageUrl && isValidImageUrl(data.imageUrl)) {
          setImageUrl(data.imageUrl);
        } else {
          // Use a fallback image based on restaurant ID
          setImageUrl(getFallbackImageUrl(restaurantId));
        }
      } catch (err) {
        setError(true);
        // Use a fallback image based on restaurant ID
        setImageUrl(getFallbackImageUrl(restaurantId));
      } finally {
        setLoading(false);
      }
    };
    
    fetchImage();
  }, [restaurantId, initialImageUrl]);

  if (loading) {
    return (
      <div 
        className={`animate-pulse bg-gray-300 ${className}`} 
        style={{ width: `${width}px`, height: `${height}px` }}
        role="img"
        aria-label="Loading restaurant image"
      />
    );
  }

  // If there's an error or no image URL, use fallback
  const src = (error || !imageUrl) ? getFallbackImageUrl(restaurantId) : imageUrl;

  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      className={className}
      priority={priority}
      onError={() => {
        setError(true);
        setImageUrl(getFallbackImageUrl(restaurantId));
      }}
    />
  );
} 