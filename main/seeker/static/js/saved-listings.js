document.addEventListener('DOMContentLoaded', function() {
    // Handle removing saved listings
    document.querySelectorAll('.remove-saved').forEach(button => {
        button.addEventListener('click', async function() {
            const listingId = this.dataset.listingId;
            
            try {
                const response = await fetch(`/seeker/remove-saved-listing/${listingId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    // Remove the card from the UI
                    const card = this.closest('.col');
                    card.remove();

                    // Check if there are any listings left
                    const remainingListings = document.querySelectorAll('.col');
                    if (remainingListings.length === 0) {
                        // Show the empty state
                        const mainContent = document.querySelector('main');
                        mainContent.innerHTML = `
                            <div class="text-center py-5">
                                <i class="fas fa-heart-broken fa-4x mb-3 text-muted"></i>
                                <h3>No Saved Listings Yet</h3>
                                <p class="text-muted">Start exploring properties and save your favorites!</p>
                                <a href="/seeker/dashboard/" class="btn btn-primary mt-3">
                                    <i class="fas fa-search"></i> Explore Properties
                                </a>
                            </div>
                        `;
                    }
                } else {
                    throw new Error('Failed to remove listing');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to remove the listing. Please try again.');
            }
        });
    });

    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
