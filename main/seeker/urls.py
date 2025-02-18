from django.urls import path
from .views import seeker_dashboard,listings_view,listing_details
from . import views

urlpatterns = [
    path('seekerdashboard/', views.seeker_dashboard, name='dashboard'),  # Maps the dashboard to the root of the app
    path('listings/', views.listings_view, name='listings'),
    path('listings/', views.listing_details, name='listing_details'),
    path('listing/<str:reference_code>/', views.listing_detail, name='listing_detail'),
    path('listing/<str:reference_code>/save/', views.save_listing, name='save_listing'),
    path('listing/<str:reference_code>/remove/', views.remove_saved_listing, name='remove_saved_listing'),
    path('saved-listings/', views.saved_listings, name='saved_listings'),
    path('financial-support/', views.financial_support, name='financial_support'),
    path('community/', views.community, name='community'),
    path('community/create-thread/', views.create_thread, name='create_thread'),
    path('settings/', views.settings_view, name='settings'),
    path('messages/', views.MessagesView.as_view(), name='messages'),
    path('conversation/<int:conversation_id>/', views.ConversationView.as_view(), name='conversation'),
    path('search-conversations/', views.SearchConversationsView.as_view(), name='search_conversations'),
]
