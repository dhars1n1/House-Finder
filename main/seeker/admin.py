from django.contrib import admin
from .models import Listing, SavedListing

# Register your models here.

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('reference_code', 'title', 'property_type', 'price', 'bedrooms', 'status', 'created_at')
    list_filter = ('property_type', 'status', 'city')
    search_fields = ('reference_code', 'title', 'address', 'city')
    readonly_fields = ('reference_code',)
    ordering = ('-created_at',)

@admin.register(SavedListing)
class SavedListingAdmin(admin.ModelAdmin):
    list_display = ('user', 'listing', 'saved_at')
    list_filter = ('saved_at',)
    search_fields = ('user__username', 'listing__reference_code')
