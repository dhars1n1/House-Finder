document.addEventListener('DOMContentLoaded', function() {
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Check for saved dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    darkModeToggle.checked = darkMode;
    if (darkMode) body.classList.add('dark-mode');

    darkModeToggle.addEventListener('change', function() {
        body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', this.checked);
    });

    // Font Size Adjustment
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    const resetFontBtn = document.getElementById('resetFontBtn');
    
    let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 100;
    document.documentElement.style.fontSize = `${currentFontSize}%`;

    increaseFontBtn.addEventListener('click', () => {
        if (currentFontSize < 150) {
            currentFontSize += 10;
            updateFontSize();
        }
    });

    decreaseFontBtn.addEventListener('click', () => {
        if (currentFontSize > 70) {
            currentFontSize -= 10;
            updateFontSize();
        }
    });

    resetFontBtn.addEventListener('click', () => {
        currentFontSize = 100;
        updateFontSize();
    });

    function updateFontSize() {
        document.documentElement.style.fontSize = `${currentFontSize}%`;
        localStorage.setItem('fontSize', currentFontSize);
    }

    // Language Selection
    const languageSelect = document.getElementById('languageSelect');
    
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('language') || 'en';
    languageSelect.value = savedLanguage;

    languageSelect.addEventListener('change', function() {
        localStorage.setItem('language', this.value);
        // Here you would typically trigger a page reload or language change
    });

    // Delete Account Confirmation
    const deleteConfirmInput = document.getElementById('deleteConfirmInput');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    deleteConfirmInput.addEventListener('input', function() {
        confirmDeleteBtn.disabled = this.value !== 'DELETE';
    });

    confirmDeleteBtn.addEventListener('click', function() {
        if (deleteConfirmInput.value === 'DELETE') {
            // Here you would typically make an API call to delete the account
            alert('Account deletion request submitted');
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'));
            modal.hide();
        }
    });

    // Change Password Form
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    changePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Here you would typically make an API call to change the password
        alert('Password changed successfully');
        const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
        modal.hide();
        this.reset();
    });

    // Support Form
    const supportForm = document.getElementById('supportForm');
    
    supportForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Here you would typically make an API call to submit the support request
        alert('Support request submitted successfully');
        const modal = bootstrap.Modal.getInstance(document.getElementById('contactSupportModal'));
        modal.hide();
        this.reset();
    });

    // Download Data
    const downloadDataBtn = document.getElementById('downloadDataBtn');
    
    downloadDataBtn.addEventListener('click', function() {
        // Here you would typically make an API call to request the user's data
        alert('Your data export request has been submitted. You will receive an email when it\'s ready.');
    });

    // Save Notification Preferences
    const notificationToggles = document.querySelectorAll('[id$="NotifToggle"]');
    
    notificationToggles.forEach(toggle => {
        // Load saved preference
        const prefName = toggle.id.replace('Toggle', '');
        toggle.checked = localStorage.getItem(prefName) !== 'false';

        toggle.addEventListener('change', function() {
            localStorage.setItem(prefName, this.checked);
            // Here you would typically make an API call to update notification preferences
        });
    });

    // Two-Factor Authentication
    const twoFactorToggle = document.getElementById('twoFactorToggle');
    
    twoFactorToggle.addEventListener('change', function() {
        if (this.checked) {
            // Here you would typically redirect to 2FA setup page or show setup modal
            alert('Redirecting to Two-Factor Authentication setup...');
            this.checked = false; // Reset until setup is complete
        }
    });
});
