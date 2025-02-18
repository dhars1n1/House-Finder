// Main application JavaScript file

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('kudil_token');
    if (token) {
        const userType = localStorage.getItem('kudil_user_type');
        redirectToUserDashboard(userType);
    }
}

// Redirect to appropriate dashboard
function redirectToUserDashboard(userType) {
    if (userType === 'seeker') {
        window.location.href = '/pages/home-seeker/dashboard.html';
    } else if (userType === 'owner') {
        window.location.href = '/pages/property-owner/dashboard.html';
    }
}

// Handle language selection
function changeLanguage(lang) {
    localStorage.setItem('kudil_language', lang);
    // Implement language change logic here
}

// Initialize the application
function initApp() {
    // Check authentication status
    checkAuthStatus();
    
    // Set default language if not set
    if (!localStorage.getItem('kudil_language')) {
        localStorage.setItem('kudil_language', 'en');
    }
}

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
