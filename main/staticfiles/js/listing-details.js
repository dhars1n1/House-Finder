document.addEventListener('DOMContentLoaded', function() {
    // Sample property images
    const propertyImages = [
        '../../assets/images/property1.jpg',
        '../../assets/images/property2.jpg',
        '../../assets/images/property3.jpg',
        '../../assets/images/property4.jpg',
        '../../assets/images/property5.jpg'
    ];

    let currentImageIndex = 0;

    // Initialize gallery
    function initializeGallery() {
        const mainImage = document.getElementById('mainImage');
        const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
        const prevBtn = document.querySelector('.gallery-nav.prev');
        const nextBtn = document.querySelector('.gallery-nav.next');

        // Create thumbnails
        propertyImages.forEach((src, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = src;
            thumbnail.alt = `Property Image ${index + 1}`;
            thumbnail.className = `gallery-thumbnail ${index === 0 ? 'active' : ''}`;
            thumbnail.addEventListener('click', () => {
                currentImageIndex = index;
                updateGallery();
            });
            thumbnailsContainer.appendChild(thumbnail);
        });

        // Navigation buttons
        prevBtn.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + propertyImages.length) % propertyImages.length;
            updateGallery();
        });

        nextBtn.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % propertyImages.length;
            updateGallery();
        });

        // Initialize main image
        updateGallery();
    }

    // Update gallery
    function updateGallery() {
        const mainImage = document.getElementById('mainImage');
        const thumbnails = document.querySelectorAll('.gallery-thumbnail');

        mainImage.src = propertyImages[currentImageIndex];
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === currentImageIndex);
        });
    }

    // Convert SVG to PNG data URL for map markers
    function svgToDataUrl(svgPath) {
        return new Promise((resolve, reject) => {
            fetch(svgPath)
                .then(response => response.text())
                .then(svgText => {
                    const encoded = window.btoa(svgText);
                    resolve('data:image/svg+xml;base64,' + encoded);
                })
                .catch(reject);
        });
    }

    // Initialize map
    async function initMap() {
        // Sample coordinates for Koramangala, Bangalore
        const propertyLocation = { lat: 12.9279, lng: 77.6271 };
        
        const map = new google.maps.Map(document.getElementById('propertyMap'), {
            zoom: 15,
            center: propertyLocation,
            styles: [
                {
                    "featureType": "poi",
                    "elementType": "labels",
                    "stylers": [{ "visibility": "off" }]
                },
                {
                    "featureType": "transit",
                    "elementType": "labels",
                    "stylers": [{ "visibility": "off" }]
                }
            ]
        });

        // Convert SVG markers to data URLs
        const homeMarker = await svgToDataUrl('../../assets/images/markers/home-marker.svg');
        
        // Add property marker
        const marker = new google.maps.Marker({
            position: propertyLocation,
            map: map,
            title: 'Property Location',
            icon: {
                url: homeMarker,
                scaledSize: new google.maps.Size(40, 40)
            }
        });

        // Add nearby places markers
        const nearbyPlaces = [
            { lat: 12.9289, lng: 77.6281, type: 'subway', name: 'Metro Station' },
            { lat: 12.9269, lng: 77.6261, type: 'shopping', name: 'Supermarket' },
            { lat: 12.9299, lng: 77.6291, type: 'hospital', name: 'Hospital' },
            { lat: 12.9259, lng: 77.6251, type: 'restaurant', name: 'Restaurants' }
        ];

        // Create markers for nearby places
        for (const place of nearbyPlaces) {
            const markerUrl = await svgToDataUrl(`../../assets/images/markers/${place.type}-marker.svg`);
            new google.maps.Marker({
                position: { lat: place.lat, lng: place.lng },
                map: map,
                title: place.name,
                icon: {
                    url: markerUrl,
                    scaledSize: new google.maps.Size(32, 32)
                }
            });
        }

        // Add info windows for nearby places
        nearbyPlaces.forEach(place => {
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="map-info-window">
                        <h6>${place.name}</h6>
                        <p>Distance: ${calculateDistance(propertyLocation, place)} km</p>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        });
    }

    // Calculate distance between two points
    function calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLon = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return (R * c).toFixed(1);
    }

    // Initialize date and time pickers
    function initializeDateTimePickers() {
        const visitForm = document.getElementById('visitRequestForm');
        const visitDate = document.getElementById('visitDate');
        const timeSlots = document.querySelectorAll('input[name="timeSlot"]');
        const submitBtn = document.getElementById('submitVisitRequest');
        const visitConfirmation = document.querySelector('.visit-confirmation');
        
        // Initialize flatpickr for date selection
        const datePicker = flatpickr(visitDate, {
            minDate: "today",
            maxDate: new Date().fp_incr(30),
            dateFormat: "Y-m-d",
            disable: [
                function(date) {
                    // Disable weekends
                    return date.getDay() === 0;
                }
            ],
            onChange: function(selectedDates, dateStr) {
                // Enable/disable time slots based on date
                updateTimeSlots(selectedDates[0]);
            }
        });

        // Update time slots based on selected date
        function updateTimeSlots(selectedDate) {
            const today = new Date();
            const isToday = selectedDate.toDateString() === today.toDateString();
            const currentHour = today.getHours();

            timeSlots.forEach(slot => {
                const slotHour = parseInt(slot.value.split(':')[0]);
                
                if (isToday && slotHour <= currentHour) {
                    slot.disabled = true;
                    slot.checked = false;
                } else {
                    slot.disabled = false;
                }
            });
        }

        // Form submission
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Validate form
            const selectedDate = visitDate.value;
            const selectedTime = document.querySelector('input[name="timeSlot"]:checked');
            const notes = document.querySelector('textarea').value;

            if (!selectedDate || !selectedTime) {
                showToast('Please select both date and time for your visit');
                return;
            }

            // Format time for display
            const timeValue = selectedTime.value;
            const [hours, minutes] = timeValue.split(':');
            const formattedTime = new Date(2025, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            // Update confirmation details
            document.querySelector('.confirmed-date').textContent = new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.querySelector('.confirmed-time').textContent = formattedTime;

            // Show confirmation
            visitForm.querySelector('.mb-3').style.display = 'none';
            visitForm.querySelector('.row').style.display = 'none';
            visitConfirmation.style.display = 'block';
            submitBtn.style.display = 'none';

            // Send notification to owner (mock implementation)
            const visitRequest = {
                date: selectedDate,
                time: timeValue,
                notes: notes,
                property: {
                    id: '123', // Replace with actual property ID
                    title: document.querySelector('.property-title').textContent
                }
            };
            console.log('Visit request sent:', visitRequest);

            // Show success message
            showToast('Visit request sent successfully!');

            // Reset form after 3 seconds
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleVisitModal'));
                modal.hide();
                
                // Reset form state
                setTimeout(() => {
                    visitForm.querySelector('.mb-3').style.display = 'block';
                    visitForm.querySelector('.row').style.display = 'flex';
                    visitConfirmation.style.display = 'none';
                    submitBtn.style.display = 'block';
                    visitForm.reset();
                }, 500);
            }, 3000);
        });
    }

    // Initialize chatbot
    function initializeChatbot() {
        const chatbotToggle = document.querySelector('.chatbot-toggle');
        const chatbotContainer = document.querySelector('.chatbot-container');
        const chatbotClose = document.querySelector('.chatbot-header .btn-close');
        const chatInput = document.querySelector('.chatbot-input input');
        const sendBtn = document.querySelector('.send-btn');
        const messagesContainer = document.querySelector('.chatbot-messages');

        // Toggle chatbot
        chatbotToggle.addEventListener('click', () => {
            chatbotContainer.classList.add('active');
        });

        chatbotClose.addEventListener('click', () => {
            chatbotContainer.classList.remove('active');
        });

        // Send message
        function sendMessage(message) {
            if (!message.trim()) return;

            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'message user';
            userMessage.innerHTML = `
                <div class="message-content">
                    <p>${message}</p>
                </div>
            `;
            messagesContainer.appendChild(userMessage);

            // Clear input
            chatInput.value = '';

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Simulate bot response
            setTimeout(() => {
                const botMessage = document.createElement('div');
                botMessage.className = 'message bot';
                botMessage.innerHTML = `
                    <div class="message-content">
                        <p>Thanks for your message! I'll help you with information about this property. What would you like to know?</p>
                    </div>
                `;
                messagesContainer.appendChild(botMessage);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 1000);
        }

        sendBtn.addEventListener('click', () => {
            sendMessage(chatInput.value);
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage(chatInput.value);
            }
        });
    }

    // Handle quick action buttons
    function initializeQuickActions() {
        const saveListingBtn = document.getElementById('saveListingBtn');
        const interestedBtn = document.getElementById('interestedBtn');
        const messageOwnerBtn = document.getElementById('messageOwnerBtn');
        const scheduleVisitBtn = document.getElementById('scheduleVisitBtn');
        const reportListingBtn = document.getElementById('reportListingBtn');

        // Save listing
        saveListingBtn.addEventListener('click', function() {
            const isSaved = this.classList.contains('btn-success');
            this.classList.toggle('btn-success');
            this.classList.toggle('btn-outline-success');
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fas');
            icon.classList.toggle('far');
            
            // Show feedback
            showToast(isSaved ? 'Removed from saved listings' : 'Added to saved listings');
        });

        // Express interest
        interestedBtn.addEventListener('click', function() {
            showToast('Interest expressed! The owner will be notified.');
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-check"></i> Interest Expressed';
        });

        // Message owner
        messageOwnerBtn.addEventListener('click', function() {
            window.location.href = 'messages.html?owner=123';
        });

        // Schedule visit
        const visitModal = new bootstrap.Modal(document.getElementById('scheduleVisitModal'));
        scheduleVisitBtn.addEventListener('click', () => visitModal.show());

        // Report listing
        const reportModal = new bootstrap.Modal(document.getElementById('reportListingModal'));
        reportListingBtn.addEventListener('click', () => reportModal.show());

        // Handle report submission
        document.getElementById('submitReport').addEventListener('click', function() {
            // Add your report submission logic here
            reportModal.hide();
            showToast('Report submitted successfully!');
        });
    }

    // Handle owner profile
    function initializeOwnerProfile() {
        const viewProfileBtn = document.querySelector('.view-profile-btn');
        
        viewProfileBtn.addEventListener('click', () => {
            // Navigate to owner profile page
            window.location.href = 'owner-profile.html?id=123';
        });
    }

    // Toast notification
    function showToast(message) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '11';

        const toastElement = document.createElement('div');
        toastElement.className = 'toast';
        toastElement.innerHTML = `
            <div class="toast-body">
                ${message}
            </div>
        `;

        toastContainer.appendChild(toastElement);
        document.body.appendChild(toastContainer);

        const toast = new bootstrap.Toast(toastElement, {
            delay: 3000
        });
        toast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toastContainer);
        });
    }

    // Initialize everything
    function initialize() {
        initializeGallery();
        initializeDateTimePickers();
        initializeQuickActions();
        initializeChatbot();
        initializeOwnerProfile();
        
        // Initialize map after Google Maps API is loaded
        if (typeof google !== 'undefined') {
            initMap();
        }
    }

    // Call initialize when DOM is loaded
    initialize();
});
