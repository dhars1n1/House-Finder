// Initialize map and variables
let map;
let markers = [];
let markerCluster;
const defaultLocation = [20.5937, 78.9629]; // India coordinates
let currentListings = [];
let currentPage = 1;
const listingsPerPage = 9;

// Initialize price range slider
let priceSlider;

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializePriceSlider();
    setupEventListeners();
    loadListings();
    initializeGooglePlacesAutocomplete();
});

function initializeMap() {
    map = L.map('propertyMap').setView(defaultLocation, 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
    }).addTo(map);

    // Initialize marker cluster group
    markerCluster = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    map.addLayer(markerCluster);
}

function initializePriceSlider() {
    const slider = document.getElementById('priceRangeSlider');
    if (!slider) return;

    noUiSlider.create(slider, {
        start: [0, 1000000],
        connect: true,
        range: {
            'min': 0,
            'max': 1000000
        },
        format: {
            to: value => Math.round(value),
            from: value => Math.round(value)
        }
    });

    // Link with input fields
    const minInput = document.getElementById('minPrice');
    const maxInput = document.getElementById('maxPrice');

    slider.noUiSlider.on('update', (values, handle) => {
        const value = values[handle];
        if (handle === 0) {
            minInput.value = value;
        } else {
            maxInput.value = value;
        }
    });

    // Update slider when inputs change
    minInput.addEventListener('change', function() {
        slider.noUiSlider.set([this.value, null]);
    });

    maxInput.addEventListener('change', function() {
        slider.noUiSlider.set([null, this.value]);
    });
}

function initializeGooglePlacesAutocomplete() {
    const input = document.getElementById('locationSearch');
    const options = {
        componentRestrictions: { country: 'in' },
        types: ['(cities)']
    };
    
    const autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            map.setView([lat, lng], 12);
            applyFilters();
        }
    });
}

function setupEventListeners() {
    // Filter form submission
    document.getElementById('filterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });

    // View toggle
    document.querySelectorAll('.view-toggle button').forEach(button => {
        button.addEventListener('click', function() {
            const view = this.dataset.view;
            toggleView(view);
        });
    });

    // Sort options change
    document.getElementById('sortOptions').addEventListener('change', function() {
        sortListings(this.value);
    });

    // Clear filters
    document.querySelector('[onclick="clearFilters()"]').addEventListener('click', clearFilters);
}

function toggleView(view) {
    const mapView = document.getElementById('mapView');
    const gridView = document.getElementById('gridView');
    const buttons = document.querySelectorAll('.view-toggle button');

    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');

    if (view === 'map') {
        mapView.style.display = 'block';
        gridView.style.display = 'none';
        map.invalidateSize();
    } else {
        mapView.style.display = 'none';
        gridView.style.display = 'block';
    }
}

async function loadListings(page = 1) {
    showLoading();
    try {
        // Replace with actual API call
        const response = await fetch('/api/listings?' + new URLSearchParams({
            page: page,
            limit: listingsPerPage,
            ...getFilterParams()
        }));
        
        const data = await response.json();
        currentListings = data.listings;
        
        displayListings(currentListings);
        updatePagination(data.total, page);
        addMapMarkers(currentListings);
        updateTotalResults(data.total);
        
    } catch (error) {
        console.error('Error loading listings:', error);
        // Show error message to user
    } finally {
        hideLoading();
    }
}

function getFilterParams() {
    return {
        location: document.getElementById('locationSearch').value,
        propertyTypes: getCheckedValues('type'),
        priceMin: document.getElementById('minPrice').value,
        priceMax: document.getElementById('maxPrice').value,
        sustainability: getCheckedValues('feature'),
        availability: document.getElementById('availability').value,
        status: document.querySelector('input[name="propertyStatus"]:checked').value,
        sort: document.getElementById('sortOptions').value
    };
}

function displayListings(listings) {
    const container = document.getElementById('listingsContainer');
    
    if (listings.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h3>No properties found</h3>
                <p class="text-muted">Try adjusting your filters to see more results</p>
            </div>
        `;
        return;
    }

    container.innerHTML = listings.map(listing => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="property-card">
                <div class="position-relative">
                    <img src="${listing.image}" alt="${listing.title}" class="property-image">
                    <span class="property-status status-${listing.status}">
                        ${listing.status === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                    <button class="btn-favorite ${listing.isFavorite ? 'active' : ''}" 
                            onclick="toggleFavorite(${listing.id}, this)">
                        <i class="fa${listing.isFavorite ? 's' : 'r'} fa-heart"></i>
                    </button>
                </div>
                <div class="property-details">
                    <h3 class="property-title">${listing.title}</h3>
                    <p class="property-location">
                        <i class="fas fa-map-marker-alt"></i> ${listing.location}
                    </p>
                    <div class="property-features">
                        <span class="feature-item">
                            <i class="fas fa-bed"></i> ${listing.features.beds} Beds
                        </span>
                        <span class="feature-item">
                            <i class="fas fa-bath"></i> ${listing.features.baths} Baths
                        </span>
                        <span class="feature-item">
                            <i class="fas fa-vector-square"></i> ${listing.features.area}
                        </span>
                    </div>
                    <div class="sustainability-features">
                        ${listing.sustainability.map(feature => `
                            <span class="sustainability-badge">
                                <i class="fas fa-leaf"></i> ${feature}
                            </span>
                        `).join('')}
                    </div>
                    <div class="property-price">
                        ${listing.price.toLocaleString('en-IN')}${listing.status === 'rent' ? '/month' : ''}
                    </div>
                    <div class="property-actions">
                        <a href="/property/${listing.id}" class="btn btn-primary">
                            View Details
                        </a>
                        <button class="btn btn-outline-primary" onclick="contactOwner(${listing.id})">
                            Contact Owner
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function addMapMarkers(listings) {
    markerCluster.clearLayers();
    markers = listings.map(listing => {
        const marker = L.marker(listing.coordinates)
            .bindPopup(`
                <div class="map-popup">
                    <img src="${listing.image}" alt="${listing.title}" class="popup-image">
                    <h5>${listing.title}</h5>
                    <p class="location">${listing.location}</p>
                    <p class="price">${listing.price.toLocaleString('en-IN')}${listing.status === 'rent' ? '/month' : ''}</p>
                    <a href="/property/${listing.id}" class="btn btn-primary btn-sm w-100">View Details</a>
                </div>
            `);
        markerCluster.addLayer(marker);
        return marker;
    });

    // Fit bounds if there are markers
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function updatePagination(total, currentPage) {
    const totalPages = Math.ceil(total / listingsPerPage);
    const pagination = document.getElementById('pagination');
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadListings(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="loadListings(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }

    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadListings(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    pagination.innerHTML = paginationHTML;
}

function updateTotalResults(total) {
    const resultCount = document.querySelector('.result-count');
    resultCount.textContent = total;
}

function clearFilters() {
    document.getElementById('filterForm').reset();
    if (priceSlider) {
        priceSlider.noUiSlider.reset();
    }
    applyFilters();
}

function applyFilters() {
    currentPage = 1;
    loadListings(currentPage);
}

function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Utility Functions
function getCheckedValues(prefix) {
    return Array.from(document.querySelectorAll(`input[id^="${prefix}"]:checked`))
        .map(input => input.value);
}

async function toggleFavorite(id, button) {
    try {
        // Replace with actual API call
        const response = await fetch(`/api/favorites/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            button.classList.toggle('active');
            const icon = button.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

function contactOwner(id) {
    // Implement contact owner functionality
    console.log('Contacting owner for property:', id);
}
