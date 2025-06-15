// Admin Dashboard JavaScript

// View reservation details function
async function viewReservationDetails(reservationId) {
    console.log('viewReservationDetails called with ID:', reservationId);
    
    const modal = new bootstrap.Modal(document.getElementById('reservationDetailsModal'));
    const contentDiv = document.getElementById('reservationDetailsContent');
    const editBtn = document.getElementById('editReservationBtn');
    
    console.log('Modal elements found:', {
        modal: !!modal,
        contentDiv: !!contentDiv,
        editBtn: !!editBtn
    });
    
    // Show loading state
    contentDiv.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading reservation details...</p>
        </div>
    `;
    
    modal.show();
    
    try {
        // Fetch reservation details
        const response = await fetch(`/api/admin/reservations/${reservationId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch reservation details');
        }
        
        const reservation = await response.json();
        
        // Display reservation details
        contentDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h6 class="card-title text-primary">
                                <i class="fas fa-user me-2"></i>Customer Information
                            </h6>
                            <div class="mb-2">
                                <strong>Name:</strong> ${reservation.customerName || 'N/A'}
                            </div>
                            <div class="mb-2">
                                <strong>Email:</strong> ${reservation.email || 'N/A'}
                            </div>
                            <div class="mb-2">
                                <strong>Phone:</strong> ${reservation.phoneNumber || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h6 class="card-title text-success">
                                <i class="fas fa-utensils me-2"></i>Restaurant Information
                            </h6>
                            <div class="mb-2">
                                <strong>Restaurant:</strong> ${reservation.restaurantName || 'Unknown Restaurant'}
                            </div>
                            <div class="mb-2">
                                <strong>Table:</strong> Table ${reservation.tableId}
                            </div>
                            <div class="mb-2">
                                <strong>Guests:</strong> ${reservation.guestCount} people
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-3">
                <div class="col-md-6">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h6 class="card-title text-info">
                                <i class="fas fa-calendar-alt me-2"></i>Booking Details
                            </h6>
                            <div class="mb-2">
                                <strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString()}
                            </div>
                            <div class="mb-2">
                                <strong>Time:</strong> ${reservation.startTime} - ${reservation.endTime}
                            </div>
                            <div class="mb-2">
                                <strong>Status:</strong> 
                                <span class="badge bg-${reservation.status === 'confirmed' ? 'success' : reservation.status === 'cancelled' ? 'danger' : 'warning'}">
                                    ${reservation.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h6 class="card-title text-warning">
                                <i class="fas fa-credit-card me-2"></i>Payment Information
                            </h6>
                            <div class="mb-2">
                                <strong>Total Amount:</strong> $${(reservation.totalAmount || 0).toFixed(2)}
                            </div>
                            <div class="mb-2">
                                <strong>Payment Status:</strong> 
                                <span class="badge bg-${reservation.paymentStatus === 'paid' ? 'success' : reservation.paymentStatus === 'pending' ? 'warning' : 'secondary'}">
                                    ${reservation.paymentStatus || 'N/A'}
                                </span>
                            </div>
                            <div class="mb-2">
                                <strong>Payment Method:</strong> ${reservation.paymentMethod || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${reservation.specialRequests ? `
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="card border-0 bg-light">
                            <div class="card-body">
                                <h6 class="card-title text-secondary">
                                    <i class="fas fa-comment-alt me-2"></i>Special Requests
                                </h6>
                                <p class="mb-0">${reservation.specialRequests}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
        `;
        
        // Show edit button
        editBtn.style.display = 'inline-block';
        editBtn.onclick = () => editReservation(reservationId);
        
    } catch (error) {
        console.error('Error fetching reservation details:', error);
        contentDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Failed to load reservation details. Please try again.
            </div>
        `;
    }
}

// Edit reservation function
async function editReservation(reservationId) {
    try {
        // Fetch reservation details
        const response = await fetch(`/api/admin/reservations/${reservationId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch reservation details');
        }
        
        const reservation = await response.json();
        
        // Show edit modal
        showEditReservationModal(reservation);
        
    } catch (error) {
        console.error('Error fetching reservation for edit:', error);
        alert('Failed to load reservation details for editing');
    }
}

// Show edit reservation modal
function showEditReservationModal(reservation) {
    // Create modal HTML
    const modalHtml = `
        <div class="modal fade" id="editReservationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-edit me-2"></i>Edit Reservation #${reservation.id}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="editReservationForm">
                        <div class="modal-body">
                            <div class="row g-3">
                                <!-- Basic Info -->
                                <div class="col-md-6">
                                    <div class="card border-0 bg-light">
                                        <div class="card-body">
                                            <h6 class="card-title text-primary mb-3">
                                                <i class="fas fa-calendar-alt me-2"></i>Reservation Details
                                            </h6>
                                            
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Date</label>
                                                <input type="date" class="form-control" name="date" 
                                                       value="${reservation.date}" required>
                                            </div>
                                            
                                            <div class="row">
                                                <div class="col-6">
                                                    <div class="mb-3">
                                                        <label class="form-label fw-bold">Start Time</label>
                                                        <input type="time" class="form-control" name="startTime" 
                                                               value="${reservation.startTime}" required>
                                                    </div>
                                                </div>
                                                <div class="col-6">
                                                    <div class="mb-3">
                                                        <label class="form-label fw-bold">End Time</label>
                                                        <input type="time" class="form-control" name="endTime" 
                                                               value="${reservation.endTime}" required>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="row">
                                                <div class="col-6">
                                                    <div class="mb-3">
                                                        <label class="form-label fw-bold">Table ID</label>
                                                        <input type="number" class="form-control" name="tableId" 
                                                               value="${reservation.tableId}" required>
                                                    </div>
                                                </div>
                                                <div class="col-6">
                                                    <div class="mb-3">
                                                        <label class="form-label fw-bold">Guests</label>
                                                        <select class="form-control" name="guestCount" required>
                                                            ${Array.from({length: 12}, (_, i) => i + 1).map(num => 
                                                                `<option value="${num}" ${num == reservation.guestCount ? 'selected' : ''}>${num} Guest${num > 1 ? 's' : ''}</option>`
                                                            ).join('')}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Status</label>
                                                <select class="form-control" name="status" required>
                                                    <option value="pending" ${reservation.status === 'pending' ? 'selected' : ''}>Pending</option>
                                                    <option value="confirmed" ${reservation.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                                                    <option value="cancelled" ${reservation.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                                    <option value="completed" ${reservation.status === 'completed' ? 'selected' : ''}>Completed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Customer & Payment Info -->
                                <div class="col-md-6">
                                    <div class="card border-0 bg-light">
                                        <div class="card-body">
                                            <h6 class="card-title text-success mb-3">
                                                <i class="fas fa-user me-2"></i>Customer Information
                                            </h6>
                                            
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Email Address</label>
                                                <input type="email" class="form-control" name="email" 
                                                       value="${reservation.email || ''}" required>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Phone Number</label>
                                                <input type="tel" class="form-control" name="phoneNumber" 
                                                       value="${reservation.phoneNumber || ''}">
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Special Requests</label>
                                                <textarea class="form-control" name="specialRequests" rows="3" 
                                                          placeholder="Any special requirements...">${reservation.specialRequests || ''}</textarea>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Payment Information -->
                                    <div class="card border-0 bg-light mt-3">
                                        <div class="card-body">
                                            <h6 class="card-title text-warning mb-3">
                                                <i class="fas fa-credit-card me-2"></i>Payment Information
                                            </h6>
                                            
                                            <div class="row">
                                                <div class="col-6">
                                                    <div class="mb-3">
                                                        <label class="form-label fw-bold">Total Amount</label>
                                                        <div class="input-group">
                                                            <span class="input-group-text">$</span>
                                                            <input type="number" step="0.01" class="form-control" name="totalAmount" 
                                                                   value="${(reservation.totalAmount || 0).toFixed(2)}" required>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-6">
                                                    <div class="mb-3">
                                                        <label class="form-label fw-bold">Payment Method</label>
                                                        <select class="form-control" name="paymentMethod" required>
                                                            <option value="cash" ${reservation.paymentMethod === 'cash' ? 'selected' : ''}>Cash</option>
                                                            <option value="card" ${reservation.paymentMethod === 'card' ? 'selected' : ''}>Card</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <label class="form-label fw-bold">Payment Status</label>
                                                <select class="form-control" name="paymentStatus" required>
                                                    <option value="pending" ${reservation.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                                                    <option value="paid" ${reservation.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
                                                    <option value="refunded" ${reservation.paymentStatus === 'refunded' ? 'selected' : ''}>Refunded</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Summary Info -->
                            <div class="row mt-3">
                                <div class="col-12">
                                    <div class="alert alert-info">
                                        <div class="row text-center">
                                            <div class="col-md-3">
                                                <strong>Restaurant:</strong><br>
                                                <span class="text-primary">${reservation.restaurantName || 'Unknown'}</span>
                                            </div>
                                            <div class="col-md-3">
                                                <strong>Customer:</strong><br>
                                                <span class="text-success">${reservation.customerName || 'Unknown'}</span>
                                            </div>
                                            <div class="col-md-3">
                                                <strong>Total Amount:</strong><br>
                                                <span class="text-warning">$${(reservation.totalAmount || 0).toFixed(2)}</span>
                                            </div>
                                            <div class="col-md-3">
                                                <strong>Payment Status:</strong><br>
                                                <span class="badge bg-${reservation.paymentStatus === 'paid' ? 'success' : 'warning'}">${reservation.paymentStatus || 'pending'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-2"></i>Update Reservation
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('editReservationModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editReservationModal'));
    modal.show();
    
    // Handle form submission
    document.getElementById('editReservationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
        
        try {
            // Convert FormData to JSON
            const updateData = {};
            for (let [key, value] of formData.entries()) {
                if (key === 'guestCount' || key === 'tableId') {
                    updateData[key] = parseInt(value, 10);
                } else if (key === 'totalAmount') {
                    updateData[key] = parseFloat(value);
                } else {
                    updateData[key] = value;
                }
            }
            
            // Send PUT request to API endpoint
            const response = await fetch(`/api/admin/reservations/${reservation.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            if (response.ok) {
                modal.hide();
                // Reload page to show updated data
                window.location.reload();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update reservation');
            }
        } catch (error) {
            console.error('Error updating reservation:', error);
            alert('Failed to update reservation: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// Make functions globally available
window.viewReservationDetails = viewReservationDetails;
window.editReservation = editReservation;

// Debug: Test if functions are properly loaded
console.log('Admin dashboard functions loaded:', {
    viewReservationDetails: typeof window.viewReservationDetails,
    editReservation: typeof window.editReservation
});
