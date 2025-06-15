// Admin Form Validation JavaScript

// Bootstrap form validation
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Fetch all forms with the needs-validation class
        var forms = document.querySelectorAll('.needs-validation');
        
        // Loop over them and prevent submission
        Array.prototype.slice.call(forms).forEach(function(form) {
            form.addEventListener('submit', function(event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                
                form.classList.add('was-validated');
            }, false);
        });
    });
})();

// Image preview functionality
function setupImagePreview() {
    const imageUrlInput = document.getElementById('imageUrl');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', function() {
            const url = this.value;
            const existingPreview = document.getElementById('newImagePreview');
            
            if (existingPreview) {
                existingPreview.remove();
            }
            
            if (url) {
                const previewContainer = document.createElement('div');
                previewContainer.id = 'newImagePreview';
                previewContainer.className = 'mb-3';
                previewContainer.innerHTML = `
                    <label class="form-label">New Image Preview</label>
                    <div>
                        <img src="${url}" alt="New image preview" 
                             style="max-width: 300px; max-height: 200px; object-fit: cover; border-radius: 8px;"
                             onerror="this.parentElement.parentElement.style.display='none';">
                    </div>
                `;
                
                this.closest('.mb-3').insertAdjacentElement('afterend', previewContainer);
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupImagePreview();
});
