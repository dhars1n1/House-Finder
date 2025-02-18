from django.urls import path
from .views import seeker_dashboard,listings_view,listing_details
from . import views

urlpatterns = [
    path('seekerdashboard/', views.seeker_dashboard, name='dashboard'),  # Maps the dashboard to the root of the app
    path('listings/', views.listings_view, name='listings'),
    path('listings/', views.listing_details, name='listing_details'),

]
