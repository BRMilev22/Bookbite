/**
 * API Debugging Utility for BookBite
 * 
 * This script helps to debug API calls by logging them to the console
 * and displaying any errors in a user-friendly way.
 */

// Create a debug panel in the bottom corner of the screen
function createDebugPanel() {
    // Only create if in development mode or if ?debug=true is in the URL
    const isDebug = window.location.search.includes('debug=true');
    if (!isDebug) return;
    
    const panel = document.createElement('div');
    panel.id = 'api-debug-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 300px;
        max-height: 200px;
        overflow-y: auto;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 5px;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        display: none;
    `;
    
    const header = document.createElement('div');
    header.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <strong>API Debug</strong>
            <span class="toggle-panel" style="cursor: pointer;">[-]</span>
        </div>
    `;
    
    const content = document.createElement('div');
    content.id = 'api-debug-content';
    
    panel.appendChild(header);
    panel.appendChild(content);
    document.body.appendChild(panel);
    
    // Toggle visibility when clicking on the toggle button
    header.querySelector('.toggle-panel').addEventListener('click', function() {
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            this.textContent = '[-]';
        } else {
            panel.style.display = 'none';
            this.textContent = '[+]';
        }
    });
    
    // Show panel on startup
    panel.style.display = 'block';
    
    // Log info to console
    console.log('%c🐛 API Debug Mode Enabled', 'color: green; font-weight: bold; font-size: 14px;');
}

// Log an API request to the debug panel
function logApiRequest(method, url, data = null) {
    const panel = document.getElementById('api-debug-content');
    if (!panel) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    const requestElement = document.createElement('div');
    requestElement.id = `request-${requestId}`;
    requestElement.innerHTML = `
        <div style="margin-bottom: 5px; border-bottom: 1px solid #444; padding-bottom: 3px;">
            <span style="color: #aaa;">${timestamp}</span>
            <span style="color: #82aaff;">${method}</span>
            <span style="color: #c3e88d;">${url}</span>
            <span class="status" style="float: right; color: #ffcb6b;">PENDING</span>
        </div>
    `;
    
    panel.appendChild(requestElement);
    panel.scrollTop = panel.scrollHeight;
    
    // Log to console
    console.group(`🌐 API Request: ${method} ${url}`);
    if (data) console.log('Request Data:', data);
    console.groupEnd();
    
    return requestId;
}

// Update an API request with response info
function updateApiResponse(requestId, status, data = null) {
    const requestElement = document.getElementById(`request-${requestId}`);
    if (!requestElement) return;
    
    const statusElement = requestElement.querySelector('.status');
    if (statusElement) {
        if (status >= 200 && status < 300) {
            statusElement.style.color = '#c3e88d'; // Green for success
            statusElement.textContent = status;
        } else {
            statusElement.style.color = '#f07178'; // Red for error
            statusElement.textContent = `ERROR ${status}`;
        }
    }
    
    // Log to console
    console.group(`🔄 API Response: ${status}`);
    if (data) console.log('Response Data:', data);
    console.groupEnd();
}

// Log an API error
function logApiError(requestId, error) {
    const requestElement = document.getElementById(`request-${requestId}`);
    if (!requestElement) return;
    
    const statusElement = requestElement.querySelector('.status');
    if (statusElement) {
        statusElement.style.color = '#f07178'; // Red for error
        statusElement.textContent = 'FAILED';
    }
    
    // Log to console
    console.group('%c❌ API Error', 'color: red');
    console.error(error);
    console.groupEnd();
}

// Override the fetch function to log API calls
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // Only intercept API calls
    if (url.includes('/api/')) {
        const method = options.method || 'GET';
        const requestId = logApiRequest(method, url, options.body);
        
        return originalFetch(url, options)
            .then(response => {
                // Clone the response to read its body without consuming it
                const clonedResponse = response.clone();
                
                // Try to parse JSON
                clonedResponse.json().then(data => {
                    updateApiResponse(requestId, response.status, data);
                }).catch(() => {
                    // If not JSON, just update with status
                    updateApiResponse(requestId, response.status);
                });
                
                return response;
            })
            .catch(error => {
                logApiError(requestId, error);
                throw error;
            });
    }
    
    // For non-API calls, just use the original fetch
    return originalFetch(url, options);
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    createDebugPanel();
});
