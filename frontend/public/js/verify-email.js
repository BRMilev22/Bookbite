document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    console.log('Verification token:', token);
    
    if (!token) {
        showError('No verification token provided in URL');
        return;
    }
    
    // Call the verification API
    fetch(`http://192.168.0.116:8080/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        .then(response => {
            console.log('API response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('API response data:', data);
            if (data.success) {
                showSuccess('Email verified successfully! You can now log in.');
            } else {
                showError(data.message || 'Verification failed');
            }
        })
        .catch(error => {
            console.error('Verification error:', error);
            showError('An error occurred during verification. Please try again.');
        });
});

function showSuccess(message) {
    const statusDiv = document.getElementById('verification-status');
    const messageDiv = document.getElementById('verification-message');
    const linkDiv = document.getElementById('verification-link');
    
    statusDiv.innerHTML = `
        <i class="fas fa-check-circle text-success" style="font-size: 3rem;"></i>
        <h4 class="mt-3 text-success">Email Verified!</h4>
    `;
    messageDiv.innerHTML = `<p class="text-muted">${message}</p>`;
    linkDiv.innerHTML = `
        <a href="/login" class="btn btn-primary">
            <i class="fas fa-sign-in-alt me-1"></i>Login Now
        </a>
    `;
}

function showError(message) {
    const statusDiv = document.getElementById('verification-status');
    const messageDiv = document.getElementById('verification-message');
    const linkDiv = document.getElementById('verification-link');
    
    statusDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
        <h4 class="mt-3 text-danger">Verification Failed</h4>
    `;
    messageDiv.innerHTML = `<p class="text-muted">${message}</p>`;
    linkDiv.innerHTML = `
        <a href="/login" class="btn btn-secondary">Return to Login</a>
    `;
}
