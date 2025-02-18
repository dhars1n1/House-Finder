from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Property  # Assuming a Property model exists

# Sample data to populate the template
FEATURES = [
    {'icon': 'fa-map-marked-alt', 'title': 'Find Affordable Homes', 'description': 'Explore budget-friendly housing options with sustainability in mind.', 'link': '#', 'link_text': 'Learn More'},
    {'icon': 'fa-hand-holding-usd', 'title': 'Financial Assistance', 'description': 'Discover financial support schemes to ease your home purchase.', 'link': '#', 'link_text': 'Explore'},
    {'icon': 'fa-leaf', 'title': 'Eco-Friendly Living', 'description': 'Learn about sustainable features that save costs and energy.', 'link': '#', 'link_text': 'Read More'},
]

PERSONALIZED_SECTIONS = [
    {'title': 'Recommended for You', 'view_all_link': '#', 'listings': [
        {'name': 'Greenwood Apartments', 'description': 'Spacious and eco-friendly.', 'image': 'path/to/image1.jpg'},
        {'name': 'Solar Haven', 'description': 'Equipped with solar panels.', 'image': 'path/to/image2.jpg'},
    ]},
]

COMMUNITY_UPDATES = [
    {'icon': 'fa-users', 'title': 'New Community Event', 'description': 'Join our webinar on sustainable housing.', 'timestamp': '2 hours ago'},
    {'icon': 'fa-comment', 'title': 'Discussion Forum', 'description': 'New discussions on affordable housing.', 'timestamp': '1 day ago'},
]

@login_required
def seeker_dashboard(request):
    context = {
        'user': request.user,
        'message_count': 3,  # Replace with actual message count logic
        'notification_count': 5,  # Replace with actual notification count logic
        'features': FEATURES,
        'personalized_sections': PERSONALIZED_SECTIONS,
        'community_updates': COMMUNITY_UPDATES,
    }
    return render(request, 'seeker/dashboard.html', context)

from django.shortcuts import render
from django.core.paginator import Paginator
from .models import Property

def listings_view(request):
    query_params = request.GET
    location = query_params.get('location', '')
    min_price = query_params.get('min_price', '')
    max_price = query_params.get('max_price', '')
    property_types = query_params.getlist('property_type')
    
    properties = Property.objects.all()
    
    if location:
        properties = properties.filter(address__icontains=location)
    
    if min_price:
        properties = properties.filter(price__gte=min_price)
    
    if max_price:
        properties = properties.filter(price__lte=max_price)
    
    if property_types:
        properties = properties.filter(property_type__in=property_types)
    
    paginator = Paginator(properties, 6)  # 6 properties per page
    page_number = request.GET.get('page')
    properties_page = paginator.get_page(page_number)
    
    context = {
        'properties': properties_page,
        'property_types': [
            {'value': 'apartment', 'label': 'Apartment'},
            {'value': 'house', 'label': 'House'},
            {'value': 'condo', 'label': 'Condo'},
        ],
    }
    return render(request, 'seeker/listings.html', context)



def listing_details(request, property_id):
    """
    View to display details of a specific property.
    """
    property = get_object_or_404(Property, id=property_id)
    
    # Example additional context data (modify as per your model fields)
    context = {
        'property': property,
        'message_count': request.user.messages.count() if request.user.is_authenticated else 0,
        'notification_count': request.user.notifications.count() if request.user.is_authenticated else 0,
        'report_reasons': [
            {'value': 'fraud', 'label': 'Fraud or Scam'},
            {'value': 'misleading', 'label': 'Misleading Information'},
            {'value': 'illegal', 'label': 'Illegal Listing'},
        ],
        'google_maps_api_key': 'YOUR_GOOGLE_MAPS_API_KEY',
        'year': 2024,  # Or use datetime.datetime.now().year
    }
    
    return render(request, 'seeker/listing-details.html', context)