// Admin Restaurant Management JavaScript

// Show add restaurant modal
function showAddRestaurantModal() {
    const modal = new bootstrap.Modal(document.getElementById('restaurantDetailsModal'));
    const modalTitle = document.getElementById('restaurantDetailsModalLabel');
    const modalContent = document.getElementById('restaurantDetailsContent');
    const editBtn = document.getElementById('editRestaurantBtn');
    
    // Update modal title
    modalTitle.innerHTML = '<i class="fas fa-plus me-2"></i>Add New Restaurant';
    
    // Hide edit button
    editBtn.style.display = 'none';
    
    // Show add restaurant form
    modalContent.innerHTML = generateAddRestaurantHTML();
    
    // Setup form submission
    const form = document.getElementById('addRestaurantForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        submitNewRestaurant();
    };
    
    // Show modal
    modal.show();
}

// Generate add restaurant form HTML
function generateAddRestaurantHTML() {
    return `
        <form id="addRestaurantForm">
            <div class="row">
                <div class="col-md-12">
                    <div class="form-section">
                        <h6 class="form-section-title">Basic Information</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Restaurant Name *</label>
                                    <input type="text" class="form-control" name="name" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Cuisine Type *</label>
                                    <select class="form-select" name="cuisineType" required>
                                        <option value="">Select cuisine type</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Mexican">Mexican</option>
                                        <option value="Indian">Indian</option>
                                        <option value="American">American</option>
                                        <option value="French">French</option>
                                        <option value="Japanese">Japanese</option>
                                        <option value="Mediterranean">Mediterranean</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Price Range *</label>
                                    <select class="form-select" name="priceRange" required>
                                        <option value="">Select price range</option>
                                        <option value="Budget">Budget ($)</option>
                                        <option value="Moderate">Moderate ($$)</option>
                                        <option value="Expensive">Expensive ($$$)</option>
                                        <option value="Fine Dining">Fine Dining ($$$$)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Image URL</label>
                                    <input type="url" class="form-control" name="imageUrl" placeholder="https://example.com/image.jpg">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea class="form-control" name="description" rows="3" placeholder="Brief description of the restaurant"></textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h6 class="form-section-title">Contact & Location</h6>
                        <div class="form-group">
                            <label class="form-label">Address *</label>
                            <input type="text" class="form-control" name="address" required placeholder="Full restaurant address">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone Number *</label>
                            <input type="tel" class="form-control" name="phoneNumber" required placeholder="+1 (555) 123-4567">
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Opening Time *</label>
                                    <input type="time" class="form-control" name="openingTime" value="09:00" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Closing Time *</label>
                                    <input type="time" class="form-control" name="closingTime" value="22:00" required>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h6 class="form-section-title">Business Settings</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Reservation Fee ($)</label>
                                    <input type="number" class="form-control" name="reservationFee" value="0" min="0" step="0.01">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Initial Rating</label>
                                    <input type="number" class="form-control" name="rating" value="4.0" min="0" max="5" step="0.1">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Restaurant Status</label>
                            <div class="mt-2">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" name="isFeatured" value="1">
                                    <label class="form-check-label">Featured Restaurant</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" name="isActive" value="1" checked>
                                    <label class="form-check-label">Active</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h6 class="form-section-title">Initial Tables Setup</h6>
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            You can add tables after creating the restaurant, or create some initial tables now.
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <p class="mb-0">Add initial tables (optional)</p>
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="addInitialTableRow()">
                                <i class="fas fa-plus me-1"></i>Add Table
                            </button>
                        </div>
                        <div id="initialTablesContainer">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Capacity</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="initialTablesTableBody">
                                        <!-- Initial tables will be populated here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="fas fa-times me-1"></i>Cancel
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i>Create Restaurant
                </button>
            </div>
        </form>
    `;
}

// Submit new restaurant
function submitNewRestaurant() {
    const form = document.getElementById('addRestaurantForm');
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Create JSON object from form data
    const restaurantData = {};
    
    // Handle text/number fields
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('initialTables[')) {
            // Skip initial table data for now, we'll handle it separately
            continue;
        } else if (key === 'isFeatured' || key === 'isActive') {
            restaurantData[key] = true; // Checkbox present means true
        } else if (key === 'reservationFee' || key === 'rating') {
            restaurantData[key] = parseFloat(value) || 0;
        } else {
            restaurantData[key] = value;
        }
    }
    
    // Handle checkboxes that aren't checked (they won't be in formData)
    if (!formData.has('isFeatured')) restaurantData.isFeatured = false;
    if (!formData.has('isActive')) restaurantData.isActive = false;
    
    // Handle initial tables data
    const initialTables = [];
    const tableRows = document.querySelectorAll('#initialTablesTableBody tr');
    
    tableRows.forEach(row => {
        const capacityInput = row.querySelector('input[name*="[capacity]"]');
        const availableInput = row.querySelector('input[name*="[available]"]');
        
        if (capacityInput && capacityInput.value) {
            const table = {
                capacity: parseInt(capacityInput.value),
                isAvailable: availableInput ? availableInput.checked : true
            };
            initialTables.push(table);
        }
    });
    
    restaurantData.initialTables = initialTables;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Creating...';
    
    fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            document.getElementById('restaurantDetailsContent').innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    Restaurant created successfully!
                </div>
            `;
            
            // Close modal after delay and reload page
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('restaurantDetailsModal'));
                modal.hide();
                window.location.reload();
            }, 2000);
        } else {
            throw new Error(data.error || 'Failed to create restaurant');
        }
    })
    .catch(error => {
        console.error('Error creating restaurant:', error);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            Error creating restaurant: ${error.message}
        `;
        form.appendChild(errorDiv);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Create Restaurant';
    });
}

// Add initial table row for new restaurant
let initialTableCounter = 0;

function addInitialTableRow() {
    const tableBody = document.getElementById('initialTablesTableBody');
    const row = document.createElement('tr');
    const rowId = `initial-table-row-${++initialTableCounter}`;
    row.id = rowId;
    
    row.innerHTML = `
        <td>
            <input type="number" class="form-control form-control-sm" 
                   name="initialTables[${initialTableCounter}][capacity]" 
                   placeholder="Capacity" 
                   min="1" max="20" required>
        </td>
        <td>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" 
                       name="initialTables[${initialTableCounter}][available]" 
                       checked>
                <label class="form-check-label">Available</label>
            </div>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeInitialTableRow('${rowId}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(row);
}

function removeInitialTableRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}

// View restaurant details in modal
function viewRestaurantDetails(restaurantId) {
    const modal = new bootstrap.Modal(document.getElementById('restaurantDetailsModal'));
    const modalContent = document.getElementById('restaurantDetailsContent');
    const editBtn = document.getElementById('editRestaurantBtn');
    
    // Show loading state
    modalContent.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading restaurant details...</p>
        </div>
    `;
    
    // Show modal
    modal.show();
    
    // Fetch restaurant details
    fetch(`/api/admin/restaurants/${restaurantId}`)
        .then(response => response.json())
        .then(restaurant => {
            if (restaurant.error) {
                throw new Error(restaurant.error);
            }
            
            modalContent.innerHTML = generateRestaurantDetailsHTML(restaurant);
            editBtn.style.display = 'inline-block';
            editBtn.onclick = () => editRestaurant(restaurant);
        })
        .catch(error => {
            console.error('Error loading restaurant details:', error);
            modalContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading restaurant details: ${error.message}
                </div>
            `;
            editBtn.style.display = 'none';
        });
}

// Generate restaurant details HTML
function generateRestaurantDetailsHTML(restaurant) {
    return `
        <div class="row">
            <div class="col-md-4">
                <div class="restaurant-header-image mb-3">
                    <img src="${restaurant.imageUrl || '/img/default-restaurant.jpg'}" 
                         alt="${restaurant.name}" 
                         class="img-fluid rounded"
                         style="width: 100%; height: 200px; object-fit: cover;">
                </div>
            </div>
            <div class="col-md-8">
                <div class="info-card">
                    <h5 class="info-card-title">Restaurant Information</h5>
                    <div class="info-item">
                        <strong>Name:</strong> ${restaurant.name}
                    </div>
                    <div class="info-item">
                        <strong>Cuisine Type:</strong> ${restaurant.cuisineType}
                    </div>
                    <div class="info-item">
                        <strong>Price Range:</strong> ${restaurant.priceRange}
                    </div>
                    <div class="info-item">
                        <strong>Rating:</strong> 
                        <span class="text-warning">
                            ${'★'.repeat(Math.floor(restaurant.rating))}${'☆'.repeat(5 - Math.floor(restaurant.rating))}
                        </span>
                        (${restaurant.rating}/5)
                    </div>
                    <div class="info-item">
                        <strong>Featured:</strong> 
                        <span class="status-badge ${restaurant.isFeatured ? 'active' : 'inactive'}">
                            ${restaurant.isFeatured ? 'Featured' : 'Regular'}
                        </span>
                    </div>
                </div>
                
                <div class="info-card">
                    <h5 class="info-card-title">Contact & Location</h5>
                    <div class="info-item">
                        <strong>Address:</strong> ${restaurant.address}
                    </div>
                    <div class="info-item">
                        <strong>Phone:</strong> ${restaurant.phoneNumber}
                    </div>
                    <div class="info-item">
                        <strong>Hours:</strong> ${restaurant.openingTime} - ${restaurant.closingTime}
                    </div>
                </div>
                
                <div class="info-card">
                    <h5 class="info-card-title">Business Details</h5>
                    <div class="info-item">
                        <strong>Table Count:</strong> ${restaurant.tableCount || 'Not set'}
                    </div>
                    <div class="info-item">
                        <strong>Reservation Fee:</strong> $${restaurant.reservationFee}
                    </div>
                    <div class="info-item">
                        <strong>Status:</strong> 
                        <span class="status-badge ${restaurant.isActive ? 'active' : 'inactive'}">
                            ${restaurant.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
                
                ${restaurant.description ? `
                <div class="info-card">
                    <h5 class="info-card-title">Description</h5>
                    <p>${restaurant.description}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Edit restaurant function
function editRestaurant(restaurant) {
    const modalContent = document.getElementById('restaurantDetailsContent');
    const editBtn = document.getElementById('editRestaurantBtn');
    
    // Hide edit button and show form
    editBtn.style.display = 'none';
    
    modalContent.innerHTML = generateEditRestaurantHTML(restaurant);
    
    // Setup form submission
    const form = document.getElementById('editRestaurantForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        submitRestaurantEdit(restaurant.id);
    };
    
    // Load existing tables
    loadRestaurantTables(restaurant.id);
}

// Generate edit restaurant form HTML
function generateEditRestaurantHTML(restaurant) {
    return `
        <form id="editRestaurantForm">
            <div class="row">
                <div class="col-md-12">
                    <div class="form-section">
                        <h6 class="form-section-title">Basic Information</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Restaurant Name</label>
                                    <input type="text" class="form-control" name="name" value="${restaurant.name}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Cuisine Type</label>
                                    <select class="form-select" name="cuisineType" required>
                                        <option value="Italian" ${restaurant.cuisineType === 'Italian' ? 'selected' : ''}>Italian</option>
                                        <option value="Chinese" ${restaurant.cuisineType === 'Chinese' ? 'selected' : ''}>Chinese</option>
                                        <option value="Mexican" ${restaurant.cuisineType === 'Mexican' ? 'selected' : ''}>Mexican</option>
                                        <option value="Indian" ${restaurant.cuisineType === 'Indian' ? 'selected' : ''}>Indian</option>
                                        <option value="American" ${restaurant.cuisineType === 'American' ? 'selected' : ''}>American</option>
                                        <option value="French" ${restaurant.cuisineType === 'French' ? 'selected' : ''}>French</option>
                                        <option value="Japanese" ${restaurant.cuisineType === 'Japanese' ? 'selected' : ''}>Japanese</option>
                                        <option value="Mediterranean" ${restaurant.cuisineType === 'Mediterranean' ? 'selected' : ''}>Mediterranean</option>
                                        <option value="Other" ${restaurant.cuisineType === 'Other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Price Range</label>
                                    <select class="form-select" name="priceRange" required>
                                        <option value="Budget" ${restaurant.priceRange === 'Budget' ? 'selected' : ''}>Budget ($)</option>
                                        <option value="Moderate" ${restaurant.priceRange === 'Moderate' ? 'selected' : ''}>Moderate ($$)</option>
                                        <option value="Expensive" ${restaurant.priceRange === 'Expensive' ? 'selected' : ''}>Expensive ($$$)</option>
                                        <option value="Fine Dining" ${restaurant.priceRange === 'Fine Dining' ? 'selected' : ''}>Fine Dining ($$$$)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Image URL</label>
                                    <input type="url" class="form-control" name="imageUrl" value="${restaurant.imageUrl || ''}">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <textarea class="form-control" name="description" rows="3">${restaurant.description || ''}</textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h6 class="form-section-title">Contact & Location</h6>
                        <div class="form-group">
                            <label class="form-label">Address</label>
                            <input type="text" class="form-control" name="address" value="${restaurant.address}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" class="form-control" name="phoneNumber" value="${restaurant.phoneNumber}" required>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Opening Time</label>
                                    <input type="time" class="form-control" name="openingTime" value="${restaurant.openingTime}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Closing Time</label>
                                    <input type="time" class="form-control" name="closingTime" value="${restaurant.closingTime}" required>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h6 class="form-section-title">Business Settings</h6>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Reservation Fee ($)</label>
                                    <input type="number" class="form-control" name="reservationFee" value="${restaurant.reservationFee}" min="0" step="0.01" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label class="form-label">Rating</label>
                                    <input type="number" class="form-control" name="rating" value="${restaurant.rating}" min="0" max="5" step="0.1">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Status</label>
                            <div class="mt-2">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" name="isFeatured" value="1" ${restaurant.isFeatured ? 'checked' : ''}>
                                    <label class="form-check-label">Featured Restaurant</label>
                                </div>
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" name="isActive" value="1" ${restaurant.isActive ? 'checked' : ''}>
                                    <label class="form-check-label">Active</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h6 class="form-section-title">Table Management</h6>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <p class="mb-0">Manage individual tables and their capacities</p>
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="addTableRow()">
                                <i class="fas fa-plus me-1"></i>Add Table
                            </button>
                        </div>
                        <div id="tablesContainer">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Table ID</th>
                                            <th>Capacity</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="tablesTableBody">
                                        <!-- Tables will be populated here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-secondary" onclick="viewRestaurantDetails(${restaurant.id})">
                    <i class="fas fa-arrow-left me-1"></i>Back to Details
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save me-1"></i>Save Changes
                </button>
            </div>
        </form>
    `;
}

// Submit restaurant edit
function submitRestaurantEdit(restaurantId) {
    const form = document.getElementById('editRestaurantForm');
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Create JSON object from form data
    const restaurantData = {};
    
    // Handle text/number fields
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('tables[')) {
            // Skip table data for now, we'll handle it separately
            continue;
        } else if (key === 'isFeatured' || key === 'isActive') {
            restaurantData[key] = true; // Checkbox present means true
        } else if (key === 'reservationFee' || key === 'rating') {
            restaurantData[key] = parseFloat(value) || 0;
        } else {
            restaurantData[key] = value;
        }
    }
    
    // Handle checkboxes that aren't checked (they won't be in formData)
    if (!formData.has('isFeatured')) restaurantData.isFeatured = false;
    if (!formData.has('isActive')) restaurantData.isActive = false;
    
    // Handle table data
    const tableOperations = {
        existing: [],
        new: [],
        delete: []
    };
    
    // Get existing table updates
    const existingTableInputs = document.querySelectorAll('input[name^="existingTables"]');
    const existingTables = {};
    
    existingTableInputs.forEach(input => {
        const match = input.name.match(/existingTables\[(\d+)\]\[(\w+)\]/);
        if (match) {
            const tableId = match[1];
            const field = match[2];
            
            if (!existingTables[tableId]) {
                existingTables[tableId] = {};
            }
            existingTables[tableId][field] = input.value;
        }
    });
    
    // Convert to array
    Object.keys(existingTables).forEach(tableId => {
        const table = existingTables[tableId];
        if (table.capacity) {
            tableOperations.existing.push({
                id: parseInt(tableId),
                capacity: parseInt(table.capacity)
            });
        }
    });
    
    // Get new tables
    const newTableInputs = document.querySelectorAll('input[name^="newTables"]');
    const newTables = {};
    
    newTableInputs.forEach(input => {
        const match = input.name.match(/newTables\[(\d+)\]\[(\w+)\]/);
        if (match) {
            const index = match[1];
            const field = match[2];
            
            if (!newTables[index]) {
                newTables[index] = {};
            }
            newTables[index][field] = input.value;
        }
    });
    
    // Convert to array
    Object.keys(newTables).forEach(index => {
        const table = newTables[index];
        if (table.capacity && table.capacity.trim() !== '') {
            tableOperations.new.push({
                capacity: parseInt(table.capacity)
            });
        }
    });
    
    // Get tables to delete
    const deleteInputs = document.querySelectorAll('input[name="deleteTables[]"]');
    deleteInputs.forEach(input => {
        tableOperations.delete.push(parseInt(input.value));
    });
    
    restaurantData.tableOperations = tableOperations;
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';
    
    fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            document.getElementById('restaurantDetailsContent').innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle me-2"></i>
                    Restaurant updated successfully!
                </div>
            `;
            
            // Close modal after delay and reload page
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('restaurantDetailsModal'));
                modal.hide();
                window.location.reload();
            }, 2000);
        } else {
            throw new Error(data.error || 'Failed to update restaurant');
        }
    })
    .catch(error => {
        console.error('Error updating restaurant:', error);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            Error updating restaurant: ${error.message}
        `;
        form.appendChild(errorDiv);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-1"></i>Save Changes';
    });
}

// Toggle restaurant featured status
function toggleFeatured(restaurantId, newFeaturedStatus) {
    const action = newFeaturedStatus ? 'feature' : 'unfeature';
    if (!confirm(`Are you sure you want to ${action} this restaurant?`)) {
        return;
    }
    
    // First get the current restaurant data, then update only the featured status
    fetch(`/api/admin/restaurants/${restaurantId}`)
        .then(response => response.json())
        .then(restaurant => {
            if (restaurant.error) {
                throw new Error(restaurant.error);
            }
            
            // Update only the featured status
            restaurant.isFeatured = newFeaturedStatus;
            
            // Send complete restaurant data with updated featured status
            return fetch(`/api/admin/restaurants/${restaurantId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(restaurant)
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Restaurant ${action}d successfully!`);
                window.location.reload();
            } else {
                throw new Error(data.error || `Failed to ${action} restaurant`);
            }
        })
        .catch(error => {
            console.error(`Error ${action}ing restaurant:`, error);
            alert(`Error ${action}ing restaurant: ` + error.message);
        });
}

// Confirm delete restaurant function
function confirmDeleteRestaurant(restaurantId, restaurantName) {
    if (confirm(`Are you sure you want to delete "${restaurantName}"? This action cannot be undone and will affect all related reservations.`)) {
        // Use fetch API to properly delete the restaurant
        fetch(`/api/admin/restaurants/${restaurantId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Restaurant deleted successfully!');
                window.location.reload();
            } else {
                throw new Error(data.error || 'Failed to delete restaurant');
            }
        })
        .catch(error => {
            console.error('Error deleting restaurant:', error);
            alert('Error deleting restaurant: ' + error.message);
        });
    }
}

// Table management functions
let tableCounter = 0;

function loadRestaurantTables(restaurantId) {
    fetch(`/api/restaurants/${restaurantId}/tables`)
        .then(response => response.json())
        .then(tables => {
            const tableBody = document.getElementById('tablesTableBody');
            tableBody.innerHTML = '';
            
            if (tables && tables.length > 0) {
                tables.forEach(table => {
                    addExistingTableRow(table.id, table.seatCount, table.isAvailable);
                });
            }
            
            // Always add one empty row for adding new tables
            addNewTableRow();
        })
        .catch(error => {
            console.error('Error loading tables:', error);
            // Add one empty row on error
            addNewTableRow();
        });
}

function addExistingTableRow(tableId, capacity, isAvailable) {
    const tableBody = document.getElementById('tablesTableBody');
    const row = document.createElement('tr');
    const rowId = `existing-table-${tableId}`;
    row.id = rowId;
    
    row.innerHTML = `
        <td>
            <strong>Table ${tableId}</strong>
            <input type="hidden" name="existingTables[${tableId}][id]" value="${tableId}">
        </td>
        <td>
            <input type="number" class="form-control form-control-sm" 
                   name="existingTables[${tableId}][capacity]" 
                   value="${capacity}" 
                   placeholder="Capacity" 
                   min="1" max="20" required>
        </td>
        <td>
            <span class="badge ${isAvailable ? 'bg-success' : 'bg-warning'}">
                ${isAvailable ? 'Available' : 'Occupied'}
            </span>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeExistingTable('${rowId}', ${tableId})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(row);
}

function addNewTableRow() {
    const tableBody = document.getElementById('tablesTableBody');
    const row = document.createElement('tr');
    const rowId = `new-table-row-${++tableCounter}`;
    row.id = rowId;
    
    row.innerHTML = `
        <td>
            <em class="text-muted">New Table</em>
        </td>
        <td>
            <input type="number" class="form-control form-control-sm" 
                   name="newTables[${tableCounter}][capacity]" 
                   value="" 
                   placeholder="Enter capacity" 
                   min="1" max="20" required>
        </td>
        <td>
            <span class="badge bg-info">New</span>
        </td>
        <td>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeNewTableRow('${rowId}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(row);
}

function addTableRow() {
    // This function is called by the "Add Table" button
    addNewTableRow();
}

function removeExistingTable(rowId, tableId) {
    if (confirm('Are you sure you want to delete this table? This will affect any existing reservations.')) {
        const row = document.getElementById(rowId);
        if (row) {
            // Mark for deletion by adding a hidden input
            const deleteInput = document.createElement('input');
            deleteInput.type = 'hidden';
            deleteInput.name = `deleteTables[]`;
            deleteInput.value = tableId;
            row.appendChild(deleteInput);
            
            // Hide the row visually
            row.style.display = 'none';
        }
    }
}

function removeNewTableRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        row.remove();
    }
}

// Export restaurants data
function exportRestaurants() {
    // Fetch all restaurants data
    fetch('/api/admin/restaurants')
        .then(response => response.json())
        .then(restaurants => {
            // Create CSV content
            const csvContent = generateRestaurantsCSV(restaurants);
            
            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `restaurants-export-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => {
            console.error('Error exporting restaurants:', error);
            alert('Error exporting restaurants: ' + error.message);
        });
}

// Generate CSV content from restaurants data
function generateRestaurantsCSV(restaurants) {
    const headers = [
        'ID', 'Name', 'Address', 'Phone', 'Cuisine Type', 'Price Range',
        'Rating', 'Featured', 'Active', 'Table Count', 'Reservation Fee',
        'Opening Time', 'Closing Time', 'Description'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    restaurants.forEach(restaurant => {
        const row = [
            restaurant.id,
            `"${restaurant.name || ''}"`,
            `"${restaurant.address || ''}"`,
            `"${restaurant.phoneNumber || ''}"`,
            `"${restaurant.cuisineType || ''}"`,
            `"${restaurant.priceRange || ''}"`,
            restaurant.rating || 0,
            restaurant.isFeatured ? 'Yes' : 'No',
            restaurant.isActive ? 'Yes' : 'No',
            restaurant.tableCount || 0,
            restaurant.reservationFee || 0,
            `"${restaurant.openingTime || ''}"`,
            `"${restaurant.closingTime || ''}"`,
            `"${(restaurant.description || '').replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
}

// Make functions globally available
window.showAddRestaurantModal = showAddRestaurantModal;
window.addInitialTableRow = addInitialTableRow;
window.removeInitialTableRow = removeInitialTableRow;
window.viewRestaurantDetails = viewRestaurantDetails;
window.editRestaurant = editRestaurant;
window.toggleFeatured = toggleFeatured;
window.confirmDeleteRestaurant = confirmDeleteRestaurant;
window.addTableRow = addTableRow;
window.removeExistingTable = removeExistingTable;
window.removeNewTableRow = removeNewTableRow;
window.exportRestaurants = exportRestaurants;
