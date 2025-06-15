// Admin Edit Reservation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin edit reservation page loaded');
    
    const form = document.getElementById('editReservationForm');
    const dateInput = document.getElementById('date');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const guestCountSelect = document.getElementById('guestCount');
    const tableSelect = document.getElementById('tableId');
    const statusSelect = document.getElementById('status');

    // Form validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const errors = [];

        // Clear previous error states
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        document.querySelectorAll('.invalid-feedback').forEach(el => el.remove());

        // Validate date
        if (!dateInput.value) {
            showError(dateInput, 'Please select a date');
            errors.push('Date is required');
            isValid = false;
        } else {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showError(dateInput, 'Date cannot be in the past');
                errors.push('Date cannot be in the past');
                isValid = false;
            }
        }

        // Validate time
        if (!startTimeInput.value) {
            showError(startTimeInput, 'Please select a start time');
            errors.push('Start time is required');
            isValid = false;
        }
        
        if (!endTimeInput.value) {
            showError(endTimeInput, 'Please select an end time');
            errors.push('End time is required');
            isValid = false;
        }

        // Validate time order
        if (startTimeInput.value && endTimeInput.value) {
            const startTime = timeToMinutes(startTimeInput.value);
            const endTime = timeToMinutes(endTimeInput.value);
            
            if (endTime <= startTime) {
                showError(endTimeInput, 'End time must be after start time');
                errors.push('End time must be after start time');
                isValid = false;
            }
            
            // Minimum 30 minutes reservation
            if (endTime - startTime < 30) {
                showError(endTimeInput, 'Reservation must be at least 30 minutes');
                errors.push('Reservation must be at least 30 minutes');
                isValid = false;
            }
        }

        // Validate guest count vs table capacity
        if (guestCountSelect.value && tableSelect.value) {
            const selectedTable = Array.from(tableSelect.options)
                .find(option => option.value === tableSelect.value);
            
            if (selectedTable) {
                const tableCapacity = parseInt(selectedTable.textContent.match(/\((\d+) seats\)/)[1]);
                const guestCount = parseInt(guestCountSelect.value);
                
                if (guestCount > tableCapacity) {
                    showError(guestCountSelect, `Table can only accommodate ${tableCapacity} guests`);
                    errors.push(`Table capacity exceeded`);
                    isValid = false;
                }
            }
        }

        if (isValid) {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
            
            // Submit the form
            form.submit();
        } else {
            // Show error summary
            showErrorSummary(errors);
        }
    });

    // Time change handlers
    startTimeInput.addEventListener('change', function() {
        if (this.value && !endTimeInput.value) {
            // Auto-set end time to 2 hours later
            const startMinutes = timeToMinutes(this.value);
            const endMinutes = startMinutes + 120; // 2 hours
            endTimeInput.value = minutesToTime(endMinutes);
        }
    });

    // Table change handler
    tableSelect.addEventListener('change', function() {
        updateGuestCountMax();
    });

    // Guest count change handler
    guestCountSelect.addEventListener('change', function() {
        validateGuestCountVsTable();
    });

    // Status change handler with confirmation
    statusSelect.addEventListener('change', function() {
        const newStatus = this.value;
        const originalStatus = this.dataset.originalValue || this.querySelector('option[selected]')?.value;
        
        if (newStatus === 'cancelled' && originalStatus !== 'cancelled') {
            if (!confirm('Are you sure you want to cancel this reservation? This action may trigger notification emails.')) {
                this.value = originalStatus;
                return;
            }
        }
        
        if (newStatus === 'completed' && originalStatus !== 'completed') {
            if (!confirm('Mark this reservation as completed? This indicates the customer has dined.')) {
                this.value = originalStatus;
                return;
            }
        }
    });

    // Helper functions
    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    function minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    function showError(element, message) {
        element.classList.add('is-invalid');
        const feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        feedback.textContent = message;
        element.parentNode.appendChild(feedback);
    }

    function showErrorSummary(errors) {
        // Remove existing error summary
        const existingSummary = document.querySelector('.error-summary');
        if (existingSummary) {
            existingSummary.remove();
        }

        // Create error summary
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger error-summary mt-3';
        errorDiv.innerHTML = `
            <h6><i class="fas fa-exclamation-triangle me-2"></i>Please fix the following errors:</h6>
            <ul class="mb-0">
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        
        form.insertBefore(errorDiv, form.firstChild);
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function updateGuestCountMax() {
        const selectedOption = tableSelect.options[tableSelect.selectedIndex];
        if (selectedOption) {
            const capacity = parseInt(selectedOption.textContent.match(/\((\d+) seats\)/)[1]);
            
            // Update guest count options
            const currentValue = guestCountSelect.value;
            guestCountSelect.innerHTML = '';
            
            for (let i = 1; i <= Math.min(10, capacity); i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i} Guest${i > 1 ? 's' : ''}`;
                if (i.toString() === currentValue && i <= capacity) {
                    option.selected = true;
                }
                guestCountSelect.appendChild(option);
            }
            
            // If current guest count exceeds new table capacity, reset it
            if (parseInt(currentValue) > capacity) {
                guestCountSelect.value = capacity;
            }
        }
    }

    function validateGuestCountVsTable() {
        const selectedTable = tableSelect.options[tableSelect.selectedIndex];
        const guestCount = parseInt(guestCountSelect.value);
        
        if (selectedTable && guestCount) {
            const capacity = parseInt(selectedTable.textContent.match(/\((\d+) seats\)/)[1]);
            
            // Clear previous validation
            guestCountSelect.classList.remove('is-invalid');
            const existingFeedback = guestCountSelect.parentNode.querySelector('.invalid-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }
            
            if (guestCount > capacity) {
                showError(guestCountSelect, `Table ${tableSelect.value} can only accommodate ${capacity} guests`);
            }
        }
    }

    // Initialize
    updateGuestCountMax();
    
    // Store original status value for change detection
    statusSelect.dataset.originalValue = statusSelect.value;

    console.log('Admin edit reservation form initialized');
});
