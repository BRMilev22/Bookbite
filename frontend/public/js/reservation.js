// Reservation page JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get server data from the HTML data attributes
    const serverDataElement = document.getElementById('server-data');
    let serverData = {
        restaurant: {},
        reservationData: [],
        tablesData: []
    };
    
    if (serverDataElement) {
        try {
            const restaurantData = serverDataElement.getAttribute('data-restaurant');
            const reservationData = serverDataElement.getAttribute('data-reservation-data');
            const tablesData = serverDataElement.getAttribute('data-tables-data');
            
            serverData = {
                restaurant: restaurantData ? JSON.parse(restaurantData) : {},
                reservationData: reservationData ? JSON.parse(reservationData) : [],
                tablesData: tablesData ? JSON.parse(tablesData) : []
            };
            
            console.log('🔍 Successfully parsed server data from attributes:', serverData);
        } catch (error) {
            console.error('🚨 Error parsing server data from attributes:', error);
            serverData = {
                restaurant: {},
                reservationData: [],
                tablesData: []
            };
        }
    } else {
        console.error('🚨 No server-data element found');
    }
    
    // Extract data with fallbacks
    const restaurant = serverData.restaurant || {};
    const allRestaurantReservations = serverData.reservationData || [];
    const availableTables = serverData.tablesData || [];
    
    console.log('🔍 Extracted data:');
    console.log('- Restaurant:', restaurant);
    console.log('- Reservations:', allRestaurantReservations);
    console.log('- Available tables:', availableTables);
    console.log('- Tables count:', availableTables.length);
    
    // Form elements
    const form = document.getElementById('reservationForm');
    const dateInput = document.getElementById('date');
    const startTimeSelect = document.getElementById('startTimeSelect');
    const endTimeSelect = document.getElementById('endTimeSelect');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const guestCountInput = document.getElementById('guestCount');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const emailInput = document.getElementById('email');
    const specialRequestsTextarea = document.getElementById('specialRequests');
    const submitBtn = document.getElementById('submitBtn');
    
    // Restaurant hours - ensure we have valid defaults
    const openingTime = (restaurant && restaurant.openingTime) ? restaurant.openingTime : "09:00";
    const closingTime = (restaurant && restaurant.closingTime) ? restaurant.closingTime : "22:00";
    
    // Get pre-selected table from URL or form selection
    const urlParams = new URLSearchParams(window.location.search);
    const preSelectedTableId = urlParams.get('tableId');
    
    console.log('=== RESERVATION PAGE LOADED ===');
    console.log('Current date and time:', new Date().toString());
    console.log('Restaurant hours:', openingTime, 'to', closingTime);
    console.log('All reservations:', allRestaurantReservations);
    console.log('Available tables:', availableTables);
    console.log('Pre-selected table ID (from URL):', preSelectedTableId);
    console.log('Pre-selected table ID type:', typeof preSelectedTableId);
    
    // Debug table IDs to see the data types
    availableTables.forEach(table => {
        console.log(`Table ID: ${table.id} (type: ${typeof table.id})`);
    });
    
    // Find selected table from URL parameter
    const selectedTable = availableTables.find(table => {
        console.log(`Comparing table.id (${table.id}, ${typeof table.id}) with preSelectedTableId (${preSelectedTableId}, ${typeof preSelectedTableId})`);
        return table.id == preSelectedTableId;
    });
    
    console.log('Selected table object:', selectedTable);
    
    // If no table found by URL parameter, check if there's only one table available
    let finalSelectedTable = selectedTable;
    if (!finalSelectedTable && availableTables.length === 1) {
        finalSelectedTable = availableTables[0];
        console.log('No table from URL, using the only available table:', finalSelectedTable);
    }
    
    // Track dynamically selected table from radio buttons
    let dynamicallySelectedTable = null;
    
    // Final check - log what we have
    if (!finalSelectedTable) {
        console.error('ERROR: No table selected! URL param:', preSelectedTableId, 'Available tables:', availableTables);
        // Try to find table by converting types
        const tableByNumberId = availableTables.find(table => table.id === parseInt(preSelectedTableId));
        const tableByStringId = availableTables.find(table => String(table.id) === preSelectedTableId);
        console.log('Trying parseInt match:', tableByNumberId);
        console.log('Trying String match:', tableByStringId);
        finalSelectedTable = tableByNumberId || tableByStringId;
    }
    
    console.log('Final selected table:', finalSelectedTable);
    console.log('Pre-selected table:', preSelectedTableId, selectedTable);
    
    // Selected time slot variables (no longer needed but kept for compatibility)
    let selectedStartTime = null;
    let selectedEndTime = null;
    
    // Helper function to convert time string to minutes
    function timeToMinutes(timeStr) {
        const parts = timeStr.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    
    // Helper function to convert minutes to time string
    function minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
    
    // Generate time slots based on restaurant hours
    function generateTimeSlots() {
        const slots = [];
        const openMin = timeToMinutes(openingTime);
        const closeMin = timeToMinutes(closingTime);
        
        console.log('Generating time slots from', openingTime, 'to', closingTime);
        
        if (openMin >= closeMin) {
            console.log('Invalid hours - using fallback 9AM to 10PM');
            for (let time = 540; time < 1320; time += 30) { // 9AM to 10PM
                slots.push(minutesToTime(time));
            }
        } else {
            for (let time = openMin; time < closeMin; time += 30) {
                slots.push(minutesToTime(time));
            }
        }
        
        console.log('Generated slots:', slots);
        return slots;
    }
    
    // Check if a time slot is available for the selected table
    function isTimeSlotAvailable(startTime, endTime, selectedDate) {
        const currentTable = getCurrentSelectedTable();
        if (!currentTable) {
            console.log('isTimeSlotAvailable: No selected table');
            return false;
        }
        
        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);
        const today = new Date();
        const selectedDateObj = new Date(selectedDate);
        const isToday = selectedDateObj.toDateString() === today.toDateString();
        
        console.log(`Checking availability for ${startTime}-${endTime} on ${selectedDate} for table ${currentTable.id}`);
        console.log(`Is today: ${isToday}, Selected date: ${selectedDate}, Today: ${today.toISOString().split('T')[0]}`);
        
        // Check if time is in the past for today - temporarily relaxed for testing
        if (isToday) {
            const currentMin = today.getHours() * 60 + today.getMinutes();
            console.log(`Current time: ${today.getHours()}:${today.getMinutes()} (${currentMin} minutes), Start time: ${startTime} (${startMin} minutes)`);
            console.log(`Current time check: ${startMin} <= ${currentMin + 30}? ${startMin <= currentMin + 30}`);
            // Temporarily disable past time checking for debugging
            // if (startMin <= currentMin + 30) {
            //     console.log(`Time ${startTime} is in the past (current: ${minutesToTime(currentMin)}) - UNAVAILABLE`);
            //     return false;
            // }
            console.log(`Past time check temporarily disabled for debugging`);
        }
        
        // Check against existing reservations for the specific table
        const relevantReservations = allRestaurantReservations.filter(r => 
            r.date === selectedDate && r.status === 'confirmed' && r.tableId == currentTable.id
        );
        
        console.log(`Found ${relevantReservations.length} relevant reservations for table ${currentTable.id} on ${selectedDate}:`, relevantReservations);
        
        for (const reservation of relevantReservations) {
            const resStart = timeToMinutes(reservation.startTime);
            const resEnd = timeToMinutes(reservation.endTime);
            
            console.log(`Checking conflict with reservation ${reservation.startTime}-${reservation.endTime}`);
            console.log(`Requested: ${startMin}-${endMin}, Existing: ${resStart}-${resEnd}`);
            
            // Two time slots overlap if one starts before the other ends
            if (startMin < resEnd && endMin > resStart) {
                console.log(`Conflict detected with reservation ${reservation.startTime}-${reservation.endTime}`);
                return false;
            }
        }
        
        console.log(`Time slot ${startTime}-${endTime} is available`);
        return true;
    }
    
    // Populate start time dropdown
    function populateStartTimes() {
        console.log('🕐 populateStartTimes called');
        const selectedDate = dateInput.value;
        console.log('📅 Selected date:', selectedDate);
        
        if (!selectedDate) {
            console.log('❌ No date selected');
            startTimeSelect.innerHTML = '<option value="">Select a date first</option>';
            startTimeSelect.disabled = true;
            return;
        }
        
        const currentTable = getCurrentSelectedTable();
        console.log('🪑 Current table from getCurrentSelectedTable():', currentTable);
        
        if (!currentTable) {
            console.log('❌ No table selected yet');
            // If no table selected yet, still show times but note table selection needed
            startTimeSelect.innerHTML = '<option value="">Select a table to see available times</option>';
            startTimeSelect.disabled = true;
            return;
        }
        
        console.log(`✅ Populating times for table ${currentTable.id} on ${selectedDate}`);
        startTimeSelect.innerHTML = '<option value="">Select start time</option>';
        startTimeSelect.disabled = false;
        
        const timeSlots = generateTimeSlots();
        
        timeSlots.forEach(time => {
            // Check if this start time would allow for at least 1 hour reservation
            const oneHourLater = minutesToTime(timeToMinutes(time) + 60);
            const available = isTimeSlotAvailable(time, oneHourLater, selectedDate);
            
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            
            if (!available) {
                option.disabled = true;
                option.textContent += ' (Reserved)';
                option.style.color = '#6c757d';
            }
            
            startTimeSelect.appendChild(option);
        });
    }
    
    // Populate end time dropdown based on selected start time
    function populateEndTimes() {
        const selectedDate = dateInput.value;
        const selectedStartTime = startTimeSelect.value;
        
        if (!selectedStartTime) {
            endTimeSelect.innerHTML = '<option value="">Select start time first</option>';
            endTimeSelect.disabled = true;
            return;
        }
        
        endTimeSelect.innerHTML = '<option value="">Select end time</option>';
        endTimeSelect.disabled = false;
        
        const startMin = timeToMinutes(selectedStartTime);
        const timeSlots = generateTimeSlots();
        
        // Generate possible end times (minimum 1 hour, maximum 3 hours)
        for (let duration = 60; duration <= 180; duration += 30) {
            const endMin = startMin + duration;
            const endTime = minutesToTime(endMin);
            
            // Check if end time is within restaurant hours
            const closeMin = timeToMinutes(closingTime);
            if (endMin > closeMin) break;
            
            // Check if this time slot is available
            const available = isTimeSlotAvailable(selectedStartTime, endTime, selectedDate);
            
            const option = document.createElement('option');
            option.value = endTime;
            
            const hours = Math.floor(duration / 60);
            const mins = duration % 60;
            const durationText = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
            option.textContent = `${endTime} (${durationText})`;
            
            if (!available) {
                option.disabled = true;
                option.textContent += ' - Reserved';
                option.style.color = '#6c757d';
            }
            
            endTimeSelect.appendChild(option);
        }
    }
    
    // Update guest count dropdown based on selected table capacity
    function updateGuestCountOptions() {
        const currentTable = getCurrentSelectedTable();
        const tableCapacity = currentTable ? currentTable.seatCount : 10;
        const currentValue = guestCountInput.value;
        
        guestCountInput.innerHTML = '<option value="">Select guests</option>';
        
        for (let i = 1; i <= tableCapacity; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i} Guest${i > 1 ? 's' : ''}`;
            if (currentValue == i) {
                option.selected = true;
            }
            guestCountInput.appendChild(option);
        }
        
        // Add helper text showing table capacity
        const existingHelper = document.getElementById('guestCountHelper');
        if (existingHelper) existingHelper.remove();
        
        if (currentTable) {
            const helper = document.createElement('div');
            helper.id = 'guestCountHelper';
            helper.className = 'form-text text-muted';
            helper.innerHTML = `<i class="fas fa-info-circle me-1"></i>Maximum ${tableCapacity} guests for Table ${currentTable.id}`;
            guestCountInput.parentNode.appendChild(helper);
        }
    }
    
    // Get currently selected table (either pre-selected or user-selected)
    function getCurrentSelectedTable() {
        if (dynamicallySelectedTable) {
            return dynamicallySelectedTable;
        }
        return finalSelectedTable;
    }
    
    // Helper function to calculate reservation fee based on table capacity
    function calculateReservationFee(seatCount, baseRestaurantFee = 4.0) {
        // Fixed fee calculation based on seat count
        // Small tables (1-2 people): $4
        // Medium tables (3-4 people): $6
        // Large tables (5-6 people): $9
        // Extra large tables (7+ people): $12
        
        let fee = 4.0; // Default for small tables
        
        if (seatCount <= 2) {
            fee = 4.0;
        } else if (seatCount <= 4) {
            fee = 6.0;
        } else if (seatCount <= 6) {
            fee = 9.0;
        } else {
            fee = 12.0;
        }
        
        return fee;
    }
    
    // Update reservation fee display when table is selected
    function updateReservationFeeDisplay() {
        const currentTable = getCurrentSelectedTable();
        const feeDisplayElement = document.querySelector('.reservation-fee-display .text-primary');
        const submitBtnText = document.getElementById('submitBtnText');
        const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
        
        if (!currentTable || !feeDisplayElement) {
            return;
        }
        
        // Calculate fee based on table seat count (no longer using restaurant base fee)
        const calculatedFee = calculateReservationFee(currentTable.seatCount);
        
        // Update fee display
        feeDisplayElement.textContent = `$${calculatedFee.toFixed(2)}`;
        
        // Update hidden field for calculated fee
        const calculatedFeeField = document.getElementById('calculatedFee');
        if (calculatedFeeField) {
            calculatedFeeField.value = calculatedFee.toFixed(2);
        }
        
        // Update submit button text based on payment method
        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (selectedPaymentMethod && submitBtnText) {
            if (selectedPaymentMethod.value === 'card') {
                submitBtnText.innerHTML = `<i class="fas fa-credit-card me-2"></i>Pay $${calculatedFee.toFixed(2)} & Reserve`;
            } else {
                submitBtnText.innerHTML = `<i class="fas fa-calendar-check me-2"></i>Reserve Table (Pay $${calculatedFee.toFixed(2)} at Restaurant)`;
            }
        }
        
        // Update fee description
        const feeDescription = document.querySelector('.reservation-fee-display small');
        if (feeDescription) {
            let description = 'Required to secure your booking';
            if (currentTable.seatCount <= 2) {
                description += ' - Small table ($4)';
            } else if (currentTable.seatCount <= 4) {
                description += ' - Medium table ($6)';
            } else if (currentTable.seatCount <= 6) {
                description += ' - Large table ($9)';
            } else {
                description += ' - Extra large table ($12)';
            }
            feeDescription.textContent = description;
        }
    }
    
    // Debugging - log reservation fee on table select
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio' && e.target.name === 'tableId') {
            setTimeout(() => {
                console.log('Table selected - updating reservation fee display');
                updateReservationFeeDisplay();
            }, 50);
        }
    });
    
    // Event listeners
    dateInput.addEventListener('change', function() {
        populateStartTimes();
        // Reset time selections when date changes
        startTimeSelect.value = '';
        endTimeSelect.innerHTML = '<option value="">Select start time first</option>';
        endTimeSelect.disabled = true;
        startTimeInput.value = '';
        endTimeInput.value = '';
    });
    
    startTimeSelect.addEventListener('change', function() {
        populateEndTimes();
        // Update hidden input
        startTimeInput.value = this.value;
        // Reset end time selection
        endTimeSelect.value = '';
        endTimeInput.value = '';
    });
    
    endTimeSelect.addEventListener('change', function() {
        // Update hidden input
        endTimeInput.value = this.value;
    });
    
    // Table selection event listeners (for when no table is pre-selected)
    document.addEventListener('change', function(e) {
        if (e.target.type === 'radio' && e.target.name === 'tableId') {
            const selectedTableId = parseInt(e.target.value);
            dynamicallySelectedTable = availableTables.find(table => table.id === selectedTableId);
            console.log('Table selected:', dynamicallySelectedTable);
            
            // Update guest count options and refresh time slots
            updateGuestCountOptions();
            updateReservationFeeDisplay();
            if (dateInput.value) {
                populateStartTimes();
            }
        }
    });
    
    // Form validation
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        let isValid = true;
        
        function showError(element, message) {
            element.classList.add('is-invalid');
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = message;
            element.parentNode.appendChild(feedback);
        }
        
        // Clear previous errors
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        document.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
        
        // Validate required fields
        if (!dateInput.value) {
            showError(dateInput, 'Please select a date');
            isValid = false;
        }
        
        if (!startTimeSelect.value) {
            showError(startTimeSelect, 'Please select a start time');
            isValid = false;
        }
        
        if (!endTimeSelect.value) {
            showError(endTimeSelect, 'Please select an end time');
            isValid = false;
        }
        
        if (!guestCountInput.value) {
            showError(guestCountInput, 'Please select number of guests');
            isValid = false;
        }
        
        if (!phoneNumberInput.value.trim()) {
            showError(phoneNumberInput, 'Please enter your phone number');
            isValid = false;
        }
        
        if (!emailInput.value.trim()) {
            showError(emailInput, 'Please enter your email address');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        
        if (isValid) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Reservation...';
            this.submit();
        }
    });
    
    // Initial setup
    if (!dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        console.log('Set default date to today:', today);
    }
    
    // Initialize the page
    console.log('🚀 Initializing page...');
    console.log('📋 Final selected table at init:', finalSelectedTable);
    console.log('📋 Current selected table at init:', getCurrentSelectedTable());
    updateGuestCountOptions();
    updateReservationFeeDisplay();
    populateStartTimes();
    
    // Initialize payment functionality
    initializePaymentHandlers();
});

// Payment functionality
function initializePaymentHandlers() {
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    const cardPaymentDetails = document.getElementById('cardPaymentDetails');
    const cashPaymentNotice = document.getElementById('cashPaymentNotice');
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    
    // Payment method change handler
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const isCardPayment = this.value === 'card';
            const currentFee = document.querySelector('.reservation-fee-display .text-primary').textContent.replace('$', '');
            
            if (isCardPayment) {
                cardPaymentDetails.classList.remove('d-none');
                cashPaymentNotice.classList.add('d-none');
                submitBtnText.innerHTML = '<i class="fas fa-credit-card me-2"></i>Pay $' + currentFee + ' & Reserve';
                
                // Make card fields required
                setCardFieldsRequired(true);
            } else {
                cardPaymentDetails.classList.add('d-none');
                cashPaymentNotice.classList.remove('d-none');
                submitBtnText.innerHTML = '<i class="fas fa-calendar-check me-2"></i>Reserve Table (Pay $' + currentFee + ' at Restaurant)';
                
                // Make card fields not required
                setCardFieldsRequired(false);
            }
        });
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
            if (formattedValue !== e.target.value) {
                e.target.value = formattedValue;
            }
        });
    }
    
    // Expiry date formatting
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cardCvvInput = document.getElementById('cardCvv');
    if (cardCvvInput) {
        cardCvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // ZIP code formatting (Bulgarian format - 4 digits)
    const billingZipInput = document.getElementById('billingZip');
    if (billingZipInput) {
        billingZipInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            // Limit to 4 digits for Bulgarian postal codes
            if (value.length > 4) {
                value = value.substring(0, 4);
            }
            e.target.value = value;
        });
    }
    
    // Form validation enhancement
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
            
            if (selectedPaymentMethod && selectedPaymentMethod.value === 'card') {
                if (!validateCardPayment()) {
                    e.preventDefault();
                    return false;
                }
            }
        });
    }
}

function setCardFieldsRequired(required) {
    const cardFields = ['cardNumber', 'cardholderName', 'cardExpiry', 'cardCvv', 'billingZip'];
    
    cardFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (required) {
                field.setAttribute('required', 'required');
            } else {
                field.removeAttribute('required');
            }
        }
    });
}

function validateCardPayment() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardholderName = document.getElementById('cardholderName').value.trim();
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;
    const billingZip = document.getElementById('billingZip').value;
    
    // Basic validation
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        showPaymentError('Please enter a valid card number');
        return false;
    }
    
    if (!cardholderName) {
        showPaymentError('Please enter the cardholder name');
        return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        showPaymentError('Please enter a valid expiry date (MM/YY)');
        return false;
    }
    
    if (cardCvv.length < 3 || cardCvv.length > 4) {
        showPaymentError('Please enter a valid CVV');
        return false;
    }
    
    if (!/^\d{4}$/.test(billingZip)) {
        showPaymentError('Please enter a valid Bulgarian postal code (4 digits)');
        return false;
    }
    
    // Check expiry date
    const [month, year] = cardExpiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        showPaymentError('Card has expired');
        return false;
    }
    
    return true;
}

function showPaymentError(message) {
    // Remove any existing error alerts
    const existingAlert = document.querySelector('.payment-error-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create new error alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger payment-error-alert mt-3';
    alertDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;
    
    // Insert before submit button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.parentNode.insertBefore(alertDiv, submitBtn);
    
    // Scroll to error
    alertDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}
