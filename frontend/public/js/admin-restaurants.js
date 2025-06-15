// Admin Restaurant Management JavaScript

// Toggle restaurant featured status
function toggleFeatured(restaurantId, newFeaturedStatus) {
    const action = newFeaturedStatus ? 'feature' : 'unfeature';
    if (!confirm(`Are you sure you want to ${action} this restaurant?`)) {
        return;
    }
    
    // Note: This function expects a backend route for toggling featured status
    // For now, we'll use a form submission approach since the route may not exist yet
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/admin/restaurants/${restaurantId}/featured`;
    
    const featuredInput = document.createElement('input');
    featuredInput.type = 'hidden';
    featuredInput.name = 'isFeatured';
    featuredInput.value = newFeaturedStatus;
    
    form.appendChild(featuredInput);
    document.body.appendChild(form);
    form.submit();
}

// Confirm delete restaurant function
function confirmDeleteRestaurant(restaurantId, restaurantName) {
    if (confirm(`Are you sure you want to delete "${restaurantName}"? This action cannot be undone and will affect all related reservations.`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/restaurants/${restaurantId}`;
        
        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = 'DELETE';
        
        form.appendChild(methodInput);
        document.body.appendChild(form);
        form.submit();
    }
}

// Make functions globally available
window.toggleFeatured = toggleFeatured;
window.confirmDeleteRestaurant = confirmDeleteRestaurant;
