from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q, Min, Max
from django.utils import timezone
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.generic import View
from django.contrib import messages
from .models import Property, Conversation, Message, SavedListing, Thread
import json

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
        'unread_messages_count': Message.objects.filter(
            recipient=request.user,
            read_at__isnull=True
        ).count() if request.user.is_authenticated else 0
    }
    return render(request, 'seeker/dashboard.html', context)

def listings_view(request):
    query_params = request.GET
    location = query_params.get('location', '')
    min_price = query_params.get('min_price', '')
    max_price = query_params.get('max_price', '')
    property_types = query_params.getlist('property_type')
    sort_by = query_params.get('sort', '-created_at')  # Default sort by newest
    
    # Start with all properties
    properties = Property.objects.all()
    
    # Enhanced location search
    if location:
        properties = properties.filter(
            Q(address__icontains=location) |
            Q(city__icontains=location) |
            Q(state__icontains=location) |
            Q(zip_code__icontains=location)
        )
    
    # Price filtering with error handling
    try:
        if min_price:
            properties = properties.filter(price__gte=float(min_price))
        if max_price:
            properties = properties.filter(price__lte=float(max_price))
    except ValueError:
        # Handle invalid price inputs gracefully
        pass
    
    # Property type filtering
    if property_types:
        properties = properties.filter(property_type__in=property_types)
    
    # Sorting
    valid_sort_fields = {
        'price_asc': 'price',
        'price_desc': '-price',
        'date_desc': '-created_at',
        'date_asc': 'created_at',
        'beds_desc': '-bedrooms',
        'beds_asc': 'bedrooms',
        'area_desc': '-area',
        'area_asc': 'area'
    }
    sort_field = valid_sort_fields.get(sort_by, '-created_at')
    properties = properties.order_by(sort_field)
    
    # Pagination with error handling
    try:
        items_per_page = int(request.GET.get('items_per_page', 6))  # Allow customizable items per page
        items_per_page = min(max(1, items_per_page), 24)  # Limit between 1 and 24 items
    except ValueError:
        items_per_page = 6
    
    paginator = Paginator(properties, items_per_page)
    page_number = request.GET.get('page', 1)
    try:
        properties_page = paginator.get_page(page_number)
    except:
        properties_page = paginator.get_page(1)
    
    # Enhance property types with counts
    property_type_choices = [
        {'value': 'apartment', 'label': 'Apartment', 'count': properties.filter(property_type='apartment').count()},
        {'value': 'house', 'label': 'House', 'count': properties.filter(property_type='house').count()},
        {'value': 'condo', 'label': 'Condo', 'count': properties.filter(property_type='condo').count()},
    ]
    
    # Get unique cities for filters
    cities = Property.objects.values_list('city', flat=True).distinct()
    
    # Get min and max prices for price range filter
    price_range = Property.objects.aggregate(
        min_price=Min('price'),
        max_price=Max('price')
    )
    
    # Get min and max bedrooms for bedroom filter
    bedroom_range = Property.objects.aggregate(
        min_bedrooms=Min('bedrooms'),
        max_bedrooms=Max('bedrooms')
    )
    
    # Prepare map data
    map_data = [{
        'id': prop.id,
        'title': prop.title,
        'lat': float(prop.latitude) if prop.latitude else None,
        'lng': float(prop.longitude) if prop.longitude else None,
        'price': float(prop.price),
        'bedrooms': prop.bedrooms,
        'bathrooms': float(prop.bathrooms),
        'property_type': prop.property_type,
        'reference_code': prop.reference_code,
    } for prop in properties if prop.latitude and prop.longitude]
    
    # Build context with additional data
    context = {
        'properties': properties_page,
        'property_types': property_type_choices,
        'cities': cities,
        'price_range': price_range,
        'bedroom_range': bedroom_range,
        'map_data': map_data,
        # Add active filters to maintain state
        'active_filters': {
            'location': location,
            'min_price': min_price,
            'max_price': max_price,
            'selected_types': property_types,
            'sort': sort_by,
            'items_per_page': items_per_page,
        },
        # Add sorting options
        'sort_options': [
            {'value': 'price_asc', 'label': 'Price (Low to High)'},
            {'value': 'price_desc', 'label': 'Price (High to Low)'},
            {'value': 'date_desc', 'label': 'Newest First'},
            {'value': 'date_asc', 'label': 'Oldest First'},
            {'value': 'beds_desc', 'label': 'Most Bedrooms'},
            {'value': 'beds_asc', 'label': 'Least Bedrooms'},
            {'value': 'area_desc', 'label': 'Largest Area'},
            {'value': 'area_asc', 'label': 'Smallest Area'},
        ],
        # Add pagination info
        'pagination': {
            'total_items': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': properties_page.number,
            'has_previous': properties_page.has_previous(),
            'has_next': properties_page.has_next(),
            'page_range': list(paginator.page_range),
        }
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

def listing_detail(request, reference_code):
    listing = get_object_or_404(Property, reference_code=reference_code)
    is_saved = False
    if request.user.is_authenticated:
        is_saved = SavedListing.objects.filter(user=request.user, listing=listing).exists()
    
    context = {
        'listing': listing,
        'is_saved': is_saved
    }
    return render(request, 'seeker/listing-detail.html', context)

@login_required
def save_listing(request, reference_code):
    if request.method == 'POST':
        listing = get_object_or_404(Property, reference_code=reference_code)
        saved_listing, created = SavedListing.objects.get_or_create(
            user=request.user,
            listing=listing
        )
        
        if created:
            messages.success(request, 'Listing saved successfully!')
        else:
            messages.info(request, 'Listing was already saved.')
            
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success'})
        return redirect('listing_detail', reference_code=reference_code)

@login_required
def remove_saved_listing(request, reference_code):
    if request.method == 'POST':
        listing = get_object_or_404(Property, reference_code=reference_code)
        SavedListing.objects.filter(user=request.user, listing=listing).delete()
        messages.success(request, 'Listing removed from saved listings.')
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success'})
        return redirect('listing_detail', reference_code=reference_code)

@login_required
def saved_listings(request):
    # This will get ALL listings saved by the current user
    saved = SavedListing.objects.filter(user=request.user).select_related('listing')
    
    # You can also access saved listings directly through the user
    # user_saved_listings = request.user.saved_listings.all()
    
    context = {
        'saved_listings': saved,
        'total_saved': saved.count(),  # Show total number of saved listings
    }
    return render(request, 'seeker/saved-listings.html', context)

@login_required
def create_thread(request):
    """Create a new community thread."""
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        category = request.POST.get('category')
        
        # Validate the input
        if not all([title, content, category]):
            messages.error(request, 'Please fill in all fields')
            return redirect('community')
        
        # Create the thread
        thread = Thread.objects.create(
            title=title,
            content=content,
            category=category,
            author=request.user
        )
        
        messages.success(request, 'Thread created successfully!')
        return redirect('community')
    
    return redirect('community')

def financial_support(request):
    """View for the financial support page."""
    context = {
        'title': 'Financial Support',
        'description': 'Learn about financial assistance and support options for your home purchase.',
    }
    return render(request, 'seeker/financial-support.html', context)

def community(request):
    """View for the community page."""
    context = {
        'title': 'Community',
        'description': 'Connect with other house seekers and share experiences.',
    }
    return render(request, 'seeker/community.html', context)

def settings_view(request):
    """View for the user settings page."""
    context = {
        'title': 'Settings',
        'description': 'Manage your account settings and preferences.',
    }
    return render(request, 'seeker/settings.html', context)

@method_decorator(login_required, name='dispatch')
class MessagesView(View):
    template_name = 'seeker/messages.html'

    def get(self, request):
        conversations = Conversation.objects.filter(
            Q(participant1=request.user) | Q(participant2=request.user)
        ).order_by('-last_message_time')

        context = {
            'conversations': conversations
        }
        return render(request, self.template_name, context)

@method_decorator(login_required, name='dispatch')
class ConversationView(View):
    def get(self, request, conversation_id):
        # Get conversation and verify user has access
        conversation = get_object_or_404(
            Conversation, 
            id=conversation_id
        )
        if request.user not in [conversation.participant1, conversation.participant2]:
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        # Mark messages as read
        Message.objects.filter(
            conversation=conversation,
            recipient=request.user,
            read_at__isnull=True
        ).update(read_at=timezone.now())

        messages = Message.objects.filter(conversation=conversation).order_by('created_at')
        
        return JsonResponse({
            'messages': [{
                'id': msg.id,
                'content': msg.content,
                'sender_id': msg.sender.id,
                'sender_name': msg.sender.get_full_name(),
                'timestamp': msg.created_at.strftime('%I:%M %p'),
                'is_read': msg.read_at is not None
            } for msg in messages]
        })

    def post(self, request, conversation_id):
        # Get conversation and verify user has access
        conversation = get_object_or_404(
            Conversation, 
            id=conversation_id
        )
        if request.user not in [conversation.participant1, conversation.participant2]:
            return JsonResponse({'error': 'Access denied'}, status=403)
        
        data = json.loads(request.body)
        content = data.get('content', '').strip()
        
        if not content:
            return JsonResponse({'error': 'Message content cannot be empty'}, status=400)

        # Determine recipient
        recipient = conversation.participant2 if conversation.participant1 == request.user else conversation.participant1
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            recipient=recipient,
            content=content
        )

        # Update conversation timestamp
        conversation.last_message_time = message.created_at
        conversation.save()

        return JsonResponse({
            'id': message.id,
            'content': message.content,
            'sender_id': message.sender.id,
            'sender_name': message.sender.get_full_name(),
            'timestamp': message.created_at.strftime('%I:%M %p'),
            'is_read': False
        })

@method_decorator(login_required, name='dispatch')
class SearchConversationsView(View):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        
        if not query:
            return JsonResponse({'conversations': []})

        conversations = Conversation.objects.filter(
            Q(participant1=request.user) | Q(participant2=request.user)
        ).filter(
            Q(participant1__first_name__icontains=query) |
            Q(participant1__last_name__icontains=query) |
            Q(participant2__first_name__icontains=query) |
            Q(participant2__last_name__icontains=query) |
            Q(messages__content__icontains=query)
        ).distinct().order_by('-last_message_time')

        return JsonResponse({
            'conversations': [{
                'id': conv.id,
                'other_user': {
                    'id': (conv.participant2.id 
                          if conv.participant1 == request.user 
                          else conv.participant1.id),
                    'name': (conv.participant2.get_full_name() 
                            if conv.participant1 == request.user 
                            else conv.participant1.get_full_name()),
                },
                'last_message': conv.messages.last().content if conv.messages.exists() else '',
                'last_message_time': conv.last_message_time.strftime('%I:%M %p'),
                'unread_count': conv.messages.filter(
                    recipient=request.user,
                    read_at__isnull=True
                ).count()
            } for conv in conversations]
        })