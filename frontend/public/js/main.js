// Main JavaScript for BookBite Frontend

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Initialize Unsplash images
    initUnsplashImages();
    
    // Auto close alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const alertInstance = bootstrap.Alert.getInstance(alert);
            if (alertInstance) {
                alertInstance.close();
            }
        });
    }, 5000);
    
    // Add animation class to page content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('animate-fade-in');
    }
    
    // Initialize reservation search functionality
    initReservationSearch();
    
    // Initialize reservation gallery filters
    initGalleryFilters();
    
    // Initialize star rating system
    initStarRating();
    
    // Reservation form validation is handled within the form's own script section
});

// Initialize reservation search functionality
function initReservationSearch() {
    const searchInputs = [
        { input: document.getElementById('searchUpcoming'), container: 'upcoming' },
        { input: document.getElementById('searchPast'), container: 'past' },
        { input: document.getElementById('searchCancelled'), container: 'cancelled' }
    ];
    
    searchInputs.forEach(({ input, container }) => {
        if (input) {
            input.addEventListener('keyup', function() {
                const searchTerm = this.value.toLowerCase();
                const tabContent = document.getElementById(container);
                if (!tabContent) return;
                
                const reservationItems = tabContent.querySelectorAll('.reservation-item');
                
                reservationItems.forEach(item => {
                    const restaurantName = item.querySelector('.card-title').textContent.toLowerCase();
                    const dateText = item.querySelector('.reservation-card-tag') ? 
                        item.querySelector('.reservation-card-tag').textContent.toLowerCase() : '';
                    const addressText = item.querySelector('.text-truncate') ? 
                        item.querySelector('.text-truncate').textContent.toLowerCase() : '';
                    
                    if (restaurantName.includes(searchTerm) || 
                        dateText.includes(searchTerm) || 
                        addressText.includes(searchTerm)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                // Show/hide empty state message
                const visibleItems = [...reservationItems].filter(item => item.style.display !== 'none');
                const emptyState = tabContent.querySelector('.empty-state-search');
                
                if (visibleItems.length === 0 && searchTerm !== '') {
                    // Create empty state if it doesn't exist
                    if (!emptyState) {
                        const noResultsDiv = document.createElement('div');
                        noResultsDiv.className = 'empty-state empty-state-search text-center py-4';
                        noResultsDiv.innerHTML = `
                            <div class="empty-state-icon mb-3">
                                <i class="fas fa-search text-muted"></i>
                            </div>
                            <h5>No results found</h5>
                            <p class="text-muted">No reservations match your search "${searchTerm}"</p>
                        `;
                        
                        const reservationCards = tabContent.querySelector('.reservation-cards');
                        if (reservationCards) {
                            reservationCards.appendChild(noResultsDiv);
                        }
                    }
                } else if (emptyState) {
                    emptyState.remove();
                }
            });
        }
    });
    
    // Load more functionality
    const loadMoreBtns = [
        { btn: document.getElementById('loadMoreUpcoming'), container: 'upcoming' },
        { btn: document.getElementById('loadMorePast'), container: 'past' }
    ];
    
    loadMoreBtns.forEach(({ btn, container }) => {
        if (btn) {
            let visibleItems = 6; // Initial number of visible items
            
            btn.addEventListener('click', function() {
                const tabContent = document.getElementById(container);
                if (!tabContent) return;
                
                const reservationItems = tabContent.querySelectorAll('.reservation-item');
                const totalItems = reservationItems.length;
                
                // Show next batch of items
                for (let i = visibleItems; i < visibleItems + 6 && i < totalItems; i++) {
                    reservationItems[i].style.display = '';
                }
                
                // Update visible count
                visibleItems += 6;
                
                // Hide button if all items are visible
                if (visibleItems >= totalItems) {
                    btn.style.display = 'none';
                }
            });
            
            // Hide items beyond initial count on load
            const tabContent = document.getElementById(container);
            if (tabContent) {
                const reservationItems = tabContent.querySelectorAll('.reservation-item');
                
                reservationItems.forEach((item, index) => {
                    if (index >= visibleItems) {
                        item.style.display = 'none';
                    }
                });
            }
        }
    });
}

// Initialize gallery filters for restaurant detail page
function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.gallery-filter button');
    if (!filterButtons.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            const galleryItems = document.querySelectorAll('.gallery-item');
            
            galleryItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                } else if (item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Initialize star rating system
function initStarRating() {
    const ratingStarsContainers = document.querySelectorAll('.rating-stars');
    
    ratingStarsContainers.forEach(container => {
        const stars = container.querySelectorAll('i');
        let selectedRating = 0;
        
        // Function to update stars display
        const updateStars = (rating) => {
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.remove('far');
                    star.classList.add('fas');
                } else {
                    star.classList.remove('fas');
                    star.classList.add('far');
                }
            });
        };
        
        // Star click event
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                updateStars(selectedRating);
                
                // Get restaurant ID
                const restaurantId = container.getAttribute('data-restaurant');
                
                // Here you would typically save the rating via AJAX
                console.log(`Rating ${selectedRating} stars for restaurant ${restaurantId}`);
                
                // Show feedback message
                const feedbackMsg = document.createElement('div');
                feedbackMsg.className = 'small text-success mt-1';
                feedbackMsg.textContent = 'Thanks for your rating!';
                
                // Remove any existing message
                const existingMsg = container.nextElementSibling;
                if (existingMsg && existingMsg.classList.contains('text-success')) {
                    existingMsg.remove();
                }
                
                container.after(feedbackMsg);
            });
            
            // Hover effects
            star.addEventListener('mouseover', () => {
                updateStars(index + 1);
            });
            
            star.addEventListener('mouseout', () => {
                updateStars(selectedRating);
            });
        });
    });
}

// Initialize Unsplash background images and parallax effects
function initUnsplashImages() {
    const parallaxContainers = document.querySelectorAll('.parallax-container, .unsplash-background');
    
    parallaxContainers.forEach(container => {
        const restaurantName = container.dataset.name || 'restaurant';
        const size = container.dataset.size || '1600x900';
        const keywords = container.dataset.keywords || 'restaurant,interior';
        const databaseUrl = container.dataset.imageUrl;
        
        // Set the background image - use DB image URL if available, otherwise use Unsplash
        if (databaseUrl && databaseUrl !== "") {
            container.style.backgroundImage = `url('${databaseUrl}')`;
        } else {
            // Create a URL for Unsplash with proper encoding of restaurant name
            const cleanName = encodeURIComponent(restaurantName.replace(/[^\w\s]/gi, ''));
            const randomSeed = Math.floor(Math.random() * 1000);
            const unsplashUrl = `https://source.unsplash.com/${size}/?${keywords},${cleanName}&sig=${randomSeed}`;
            container.style.backgroundImage = `url('${unsplashUrl}')`;
        }
        
        // Add error handling for background image loading with multiple fallback options
        const img = new Image();
        img.onerror = function() {
            // Use one of our curated fallback images based on a simple hash of the restaurant name
            const fallbackImages = [
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop',
                'https://images.unsplash.com/photo-1622115837997-90c89ae689f9?w=1600&h=900&fit=crop',
                'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1600&h=900&fit=crop',
                'https://images.unsplash.com/photo-1604328471151-b52226907017?w=1600&h=900&fit=crop',
                'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1600&h=900&fit=crop'
            ];
            
            // Simple hash function to get a consistent image for each restaurant
            const nameHash = restaurantName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const fallbackIndex = nameHash % fallbackImages.length;
            
            container.style.backgroundImage = `url("${fallbackImages[fallbackIndex]}")`;
            console.log('Background image failed to load for: ' + restaurantName + ', using fallback image #' + (fallbackIndex + 1));
        };
        
        // Trigger the load with the source - for main URL or Unsplash URL based on which one was set
        img.src = container.style.backgroundImage.replace(/url\(['"](.+)['"]\)/, '$1');
        
        // Add parallax effect for containers with parallax class
        if (container.classList.contains('parallax-container')) {
            // Add scroll event listener for parallax effect
            window.addEventListener('scroll', function() {
                const scrolled = window.pageYOffset;
                const yPos = -(scrolled * 0.3);
                container.style.backgroundPosition = `center ${yPos}px`;
            });
        }
    });
}
