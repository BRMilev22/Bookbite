/**
 * Reviews functionality for BookBite
 */

// Display error in the reviews container
function displayReviewError(message) {
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer) {
        reviewsContainer.classList.remove('loading');
        reviewsContainer.innerHTML = `
            <div class="alert alert-warning text-center" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-primary" onclick="loadReviewsForRestaurant()">
                        <i class="fas fa-sync-alt me-1"></i> Try Again
                    </button>
                </div>
            </div>
        `;
    }
}

// Initialize review components
function initReviewSystem() {
    console.log('Initializing review system...');
    console.log('About to call loadReviewsForRestaurant()');
    loadReviewsForRestaurant();
    setupReviewForm();
}

// Load reviews for the current restaurant
function loadReviewsForRestaurant() {
    const restaurantId = document.getElementById('restaurant-id')?.value;
    console.log('Restaurant ID found:', restaurantId);
    if (!restaurantId) {
        console.error('Could not find restaurant ID element');
        displayReviewError("Could not find restaurant ID");
        return;
    }
    
    // Show loading state
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer) {
        reviewsContainer.classList.add('loading');
        reviewsContainer.innerHTML = `
            <div class="text-center p-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading reviews...</span>
                </div>
                <p class="mt-3">Loading reviews...</p>
            </div>
        `;
    }

    console.log('Making fetch request to:', `/restaurants/${restaurantId}/reviews`);
    fetch(`/restaurants/${restaurantId}/reviews`)
        .then(response => {
            console.log('Reviews API response status:', response.status);
            console.log('Reviews API response ok:', response.ok);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(reviews => {
            console.log('Reviews data received:', reviews);
            console.log('Calling displayReviews with:', reviews);
            displayReviews(reviews);
            updateAverageRating(reviews);
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
            displayReviewError("Could not load reviews. Please try again later.");
        });
        
    // Check if user is logged in and has already reviewed this restaurant
    const userId = document.getElementById('user-id')?.value;
    if (userId) {
        fetch(`/api/users/me/restaurants/${restaurantId}/review`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return null;
            })
            .then(review => {
                if (review) {
                    populateExistingReview(review);
                }
            })
            .catch(error => {
                console.error('Error checking existing review:', error);
            });
    }
}

// Display reviews in the reviews section
function displayReviews(reviews) {
    console.log('=== displayReviews called ===');
    console.log('Reviews data:', reviews);
    console.log('Reviews length:', reviews.length);
    
    const reviewsContainer = document.getElementById('reviews-container');
    console.log('Reviews container found:', reviewsContainer);
    
    if (!reviewsContainer) {
        console.error('Reviews container not found!');
        return;
    }
    
    // Clear loading spinner if present
    reviewsContainer.classList.remove('loading');
    
    if (reviews.length === 0) {
        console.log('No reviews found, setting placeholder');
        reviewsContainer.innerHTML = '<div class="text-center p-4"><p>No reviews yet. Be the first to review!</p></div>';
        return;
    }
    
    console.log('Building reviews HTML for', reviews.length, 'reviews');
    const reviewsHtml = reviews.map(review => {
        const stars = generateStarRating(review.rating);
        return `
            <div class="card mb-3 review-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                        <div class="review-stars">${stars}</div>
                        <small class="text-muted">User #${review.userId}</small>
                    </div>
                    <p class="card-text">${review.comment}</p>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('Setting reviews HTML, length:', reviewsHtml.length);
    reviewsContainer.innerHTML = reviewsHtml;
    console.log('Reviews HTML set, container content:', reviewsContainer.innerHTML.substring(0, 100));
    
    // Update the review count
    const reviewCount = document.getElementById('review-count');
    if (reviewCount) {
        reviewCount.textContent = `${reviews.length} reviews`;
        console.log('Review count updated to:', reviews.length);
    } else {
        console.log('Review count element not found');
    }
    
    console.log('=== displayReviews completed ===');
}

// Update the average rating display
function updateAverageRating(reviews) {
    if (reviews.length === 0) return;
    
    // Calculate average rating
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    const average = sum / reviews.length;
    const averageRounded = Math.round(average * 10) / 10; // Round to 1 decimal place
    
    console.log('Updating average rating to:', averageRounded, 'from', reviews.length, 'reviews');
    
    // Update the rating display in the header
    const ratingBadge = document.querySelector('.badge.bg-warning.text-dark');
    if (ratingBadge) {
        ratingBadge.innerHTML = `<i class="fas fa-star me-1"></i> ${averageRounded}`;
        console.log('Updated header rating badge');
    }
    
    // Update the social card rating
    const socialRatingDisplay = document.querySelector('.review-summary .display-4');
    if (socialRatingDisplay) {
        socialRatingDisplay.textContent = averageRounded;
        console.log('Updated social card rating');
    }
    
    // Update the social card stars
    const socialStarsContainer = document.querySelector('.review-summary .stars');
    if (socialStarsContainer) {
        socialStarsContainer.innerHTML = generateStarRating(averageRounded);
        console.log('Updated social card stars');
    }
    
    // Update the social card review count
    const socialReviewCount = document.querySelector('.review-summary small.text-muted');
    if (socialReviewCount) {
        socialReviewCount.textContent = `Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
        console.log('Updated social card review count');
    }
    
    // Update the reviews section average rating
    const reviewSectionRating = document.querySelector('.review-average strong');
    if (reviewSectionRating) {
        reviewSectionRating.textContent = `${averageRounded}/5`;
        console.log('Updated review section rating');
    }
}

// Generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            // Full star
            stars += '<i class="fas fa-star text-warning"></i>';
        } else if (i <= Math.ceil(rating) && rating % 1 !== 0) {
            // Half star for decimal ratings
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        } else {
            // Empty star
            stars += '<i class="far fa-star text-warning"></i>';
        }
    }
    return stars;
}

// Set up the review submission form
function setupReviewForm() {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;
    
    const starInputs = document.querySelectorAll('.review-stars-input i');
    const ratingInput = document.getElementById('review-rating');
    
    // Set up star rating input
    starInputs.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            ratingInput.value = rating;
            
            // Update star display
            starInputs.forEach((s, i) => {
                if (i < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        // Hover effects
        star.addEventListener('mouseenter', () => {
            const rating = index + 1;
            starInputs.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('hovered');
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            starInputs.forEach(s => {
                s.classList.remove('hovered');
            });
        });
    });
    
    // Form submission
    reviewForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const restaurantId = document.getElementById('restaurant-id').value;
        const rating = document.getElementById('review-rating').value;
        const comment = document.getElementById('review-comment').value;
        const reviewId = document.getElementById('review-id')?.value;
        
        if (!rating) {
            showReviewError('Please select a rating');
            return;
        }
        
        const reviewData = {
            rating: parseInt(rating),
            comment: comment
        };
        
        if (reviewId) {
            // Update existing review
            updateReview(reviewId, reviewData);
        } else {
            // Submit new review
            submitNewReview(restaurantId, reviewData);
        }
    });
}

// Submit a new review
function submitNewReview(restaurantId, reviewData) {
    fetch(`/restaurants/${restaurantId}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showReviewSuccess('Your review has been submitted');
                // Reset form instead of reloading
                resetReviewForm();
                // Reload reviews to show the new one
                setTimeout(() => {
                    loadReviewsForRestaurant();
                }, 500);
            } else {
                showReviewError(data.message || 'Error submitting review');
            }
        })
        .catch(error => {
            showReviewError('Error submitting review');
            console.error('Error:', error);
        });
}

// Update an existing review
function updateReview(reviewId, reviewData) {
    fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showReviewSuccess('Your review has been updated');
                // Reload reviews to show the updated one
                setTimeout(() => {
                    loadReviewsForRestaurant();
                }, 500);
            } else {
                showReviewError(data.message || 'Error updating review');
            }
        })
        .catch(error => {
            showReviewError('Error updating review');
            console.error('Error:', error);
        });
}

// Delete a review
function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete your review?')) {
        return;
    }
    
    fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showReviewSuccess('Your review has been deleted');
                // Reset form and reload reviews
                resetReviewForm();
                setTimeout(() => {
                    loadReviewsForRestaurant();
                }, 500);
            } else {
                showReviewError(data.message || 'Error deleting review');
            }
        })
        .catch(error => {
            showReviewError('Error deleting review');
            console.error('Error:', error);
        });
}

// Populate the review form with existing review data
function populateExistingReview(review) {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;
    
    // Add review ID to the form
    const reviewIdInput = document.getElementById('review-id') || document.createElement('input');
    reviewIdInput.type = 'hidden';
    reviewIdInput.id = 'review-id';
    reviewIdInput.name = 'reviewId';
    reviewIdInput.value = review.id;
    if (!document.getElementById('review-id')) {
        reviewForm.appendChild(reviewIdInput);
    }
    
    // Set rating
    const ratingInput = document.getElementById('review-rating');
    ratingInput.value = review.rating;
    
    // Update star display
    const starInputs = document.querySelectorAll('.review-stars-input i');
    starInputs.forEach((star, index) => {
        if (index < review.rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
    
    // Set comment
    const commentInput = document.getElementById('review-comment');
    commentInput.value = review.comment;
    
    // Change submit button text
    const submitButton = reviewForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Update Review';
    }
    
    // Remove any existing delete buttons first
    const existingDeleteButtons = document.querySelectorAll('.review-form-footer .btn-outline-danger');
    existingDeleteButtons.forEach(button => button.remove());
    
    // Add delete button
    const formFooter = document.querySelector('.review-form-footer');
    if (formFooter) {
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-outline-danger ms-2';
        deleteButton.textContent = 'Delete Review';
        deleteButton.onclick = () => deleteReview(review.id);
        formFooter.appendChild(deleteButton);
    }
}

// Reset the review form to its initial state
function resetReviewForm() {
    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;
    
    // Clear rating
    const ratingInput = document.getElementById('review-rating');
    if (ratingInput) {
        ratingInput.value = '';
    }
    
    // Reset stars to empty
    const starInputs = document.querySelectorAll('.review-stars-input i');
    starInputs.forEach(star => {
        star.classList.remove('fas');
        star.classList.add('far');
    });
    
    // Clear comment
    const commentInput = document.getElementById('review-comment');
    if (commentInput) {
        commentInput.value = '';
    }
    
    // Remove review ID input if it exists
    const reviewIdInput = document.getElementById('review-id');
    if (reviewIdInput) {
        reviewIdInput.remove();
    }
    
    // Reset submit button text
    const submitButton = reviewForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.textContent = 'Submit Review';
    }
    
    // Remove delete button if it exists
    const deleteButton = document.querySelector('.review-form-footer .btn-outline-danger');
    if (deleteButton) {
        deleteButton.remove();
    }
}

// Show review submission error
function showReviewError(message) {
    const errorAlert = document.getElementById('review-error');
    if (errorAlert) {
        errorAlert.textContent = message;
        errorAlert.classList.remove('d-none');
        setTimeout(() => {
            errorAlert.classList.add('d-none');
        }, 3000);
    }
}

// Show review submission success
function showReviewSuccess(message) {
    const successAlert = document.getElementById('review-success');
    if (successAlert) {
        successAlert.textContent = message;
        successAlert.classList.remove('d-none');
        setTimeout(() => {
            successAlert.classList.add('d-none');
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - initializing review system');
    console.log('Restaurant ID element:', document.getElementById('restaurant-id'));
    console.log('Reviews container element:', document.getElementById('reviews-container'));
    
    // Single initialization
    if (document.getElementById('restaurant-id') && document.getElementById('reviews-container')) {
        console.log('Elements found, triggering initialization');
        initReviewSystem();
    } else {
        // If elements not found immediately, wait a bit
        setTimeout(() => {
            console.log('Delayed initialization attempt');
            if (document.getElementById('restaurant-id') && document.getElementById('reviews-container')) {
                initReviewSystem();
            } else {
                console.error('Required elements not found for review system');
            }
        }, 500);
    }
    
    // Manual trigger for debugging (only if needed)
    window.manualLoadReviews = function() {
        console.log('Manual review loading triggered');
        loadReviewsForRestaurant();
    };
});
