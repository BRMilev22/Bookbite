// Admin User Management JavaScript

// Change user role function
function changeUserRole(userId, roleId) {
    if (!confirm('Are you sure you want to change this user\'s role?')) {
        return;
    }
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/admin/users/${userId}/promote`;
    
    const roleInput = document.createElement('input');
    roleInput.type = 'hidden';
    roleInput.name = 'roleId';
    roleInput.value = roleId;
    
    form.appendChild(roleInput);
    document.body.appendChild(form);
    form.submit();
}

// Toggle user status function
async function toggleUserStatus(userId, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/users/${userId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                isActive: !currentStatus
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            location.reload();
        } else {
            alert('Failed to update user status: ' + result.message);
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        alert('An error occurred while updating user status');
    }
}

// Confirm delete user function
function confirmDeleteUser(userId, username) {
    if (confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/users/${userId}/delete`;
        
        document.body.appendChild(form);
        form.submit();
    }
}

// Make functions globally available
window.changeUserRole = changeUserRole;
window.toggleUserStatus = toggleUserStatus;
window.confirmDeleteUser = confirmDeleteUser;
