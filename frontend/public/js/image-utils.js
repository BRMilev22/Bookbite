// Utility functions for handling images
function getUnsplashUrl(baseSize, keywords, name) {
    // Clean and encode the restaurant name
    const cleanName = encodeURIComponent(name.replace(/[^\w\s]/gi, ''));
    // Create a more targeted query that works reliably
    const baseKeywords = keywords ? keywords : 'restaurant,food';
    // Add variety with a random number to prevent caching issues
    const randomSeed = Math.floor(Math.random() * 1000);
    
    return `https://source.unsplash.com/${baseSize}/?${baseKeywords},${cleanName}&sig=${randomSeed}`;
}

// Initialize all restaurant images on the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Find all restaurant card images
    const restaurantImages = document.querySelectorAll('.restaurant-image');
    restaurantImages.forEach(img => {
        // Check if the image has a database URL first
        const databaseUrl = img.dataset.imageUrl;
        
        if (databaseUrl && databaseUrl !== "") {
            img.src = databaseUrl;
        } else {
            // Fallback to Unsplash if no database URL
            const restaurantName = img.dataset.name || img.alt || 'restaurant';
            const size = img.dataset.size || '600x400';
            const keywords = img.dataset.keywords || 'restaurant,food';
            
            img.src = getUnsplashUrl(size, keywords, restaurantName);
        }
        
        // Add error handling with multiple fallback options
        img.onerror = function() {
            // Use one of our curated fallback images based on a simple hash of the restaurant name
            const fallbackImages = [
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&h=400&fit=crop'
            ];
            
            const restaurantName = img.dataset.name || img.alt || 'restaurant';
            // Simple hash function to get a consistent image for each restaurant
            const nameHash = restaurantName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const fallbackIndex = nameHash % fallbackImages.length;
            
            this.src = fallbackImages[fallbackIndex];
            console.log('Image failed to load for: ' + restaurantName + ', using fallback image #' + (fallbackIndex + 1));
        };
    });
});
