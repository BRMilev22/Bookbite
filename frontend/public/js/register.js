// Registration form validation and password strength checking

document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('registerForm');
    
    // Password requirement elements
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqLower = document.getElementById('req-lower');
    const reqDigit = document.getElementById('req-digit');
    const reqSpecial = document.getElementById('req-special');
    const passwordMatchFeedback = document.getElementById('password-match-feedback');
    
    let passwordValid = false;
    let passwordsMatch = false;
    
    function checkPasswordRequirements() {
        const password = passwordInput.value;
        let allValid = true;
        
        // Length check
        if (password.length >= 8) {
            reqLength.className = 'text-success';
            reqLength.innerHTML = '✓ At least 8 characters';
        } else {
            reqLength.className = 'text-danger';
            reqLength.innerHTML = 'At least 8 characters';
            allValid = false;
        }
        
        // Uppercase check
        if (/[A-Z]/.test(password)) {
            reqUpper.className = 'text-success';
            reqUpper.innerHTML = '✓ One uppercase letter';
        } else {
            reqUpper.className = 'text-danger';
            reqUpper.innerHTML = 'One uppercase letter';
            allValid = false;
        }
        
        // Lowercase check
        if (/[a-z]/.test(password)) {
            reqLower.className = 'text-success';
            reqLower.innerHTML = '✓ One lowercase letter';
        } else {
            reqLower.className = 'text-danger';
            reqLower.innerHTML = 'One lowercase letter';
            allValid = false;
        }
        
        // Digit check
        if (/[0-9]/.test(password)) {
            reqDigit.className = 'text-success';
            reqDigit.innerHTML = '✓ One number';
        } else {
            reqDigit.className = 'text-danger';
            reqDigit.innerHTML = 'One number';
            allValid = false;
        }
        
        // Special character check
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            reqSpecial.className = 'text-success';
            reqSpecial.innerHTML = '✓ One special character (!@#$%^&*)';
        } else {
            reqSpecial.className = 'text-danger';
            reqSpecial.innerHTML = 'One special character (!@#$%^&*)';
            allValid = false;
        }
        
        passwordValid = allValid;
        updateSubmitButton();
    }
    
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword === '') {
            passwordMatchFeedback.innerHTML = '';
            passwordsMatch = false;
        } else if (password === confirmPassword) {
            passwordMatchFeedback.innerHTML = '<span class="text-success">✓ Passwords match</span>';
            passwordsMatch = true;
        } else {
            passwordMatchFeedback.innerHTML = '<span class="text-danger">Passwords do not match</span>';
            passwordsMatch = false;
        }
        
        updateSubmitButton();
    }
    
    function updateSubmitButton() {
        submitBtn.disabled = !(passwordValid && passwordsMatch);
    }
    
    // Event listeners
    passwordInput.addEventListener('input', checkPasswordRequirements);
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    passwordInput.addEventListener('input', checkPasswordMatch); // Also check match when main password changes
    
    // Form submission
    form.addEventListener('submit', function(e) {
        if (!passwordValid || !passwordsMatch) {
            e.preventDefault();
            alert('Please fix the password requirements before submitting.');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    });
});
