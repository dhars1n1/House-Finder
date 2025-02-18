from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings
import uuid
from django.urls import reverse

class Property(models.Model):
    PROPERTY_TYPE_CHOICES = [
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('condo', 'Condo'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
        ('pending', 'Pending'),
        ('rented', 'Rented'),
    ]

    # Basic Information
    title = models.CharField(max_length=200, default="New Property Listing")
    description = models.TextField(default="A wonderful property available for sale/rent.")
    price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES, default='apartment')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')

    # Property Features
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, default=1.0)
    area = models.PositiveIntegerField(help_text="Area in square feet", default=500)
    furnished = models.BooleanField(default=False)
    parking = models.PositiveIntegerField(default=0, help_text="Number of parking spaces")

    # Location
    address = models.CharField(max_length=255, default="123 Main Street")
    city = models.CharField(max_length=100, default="Default City")
    state = models.CharField(max_length=100, default="Default State")
    zip_code = models.CharField(max_length=10, default="12345")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, default=0.000000)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, default=0.000000)

    # Media
    image = models.ImageField(
        upload_to='properties/',
        null=True,
        blank=True,
        default='properties/default_property.jpg'
    )
    video_url = models.URLField(
        max_length=200,
        blank=True,
        null=True,
        default=None
    )
    virtual_tour_url = models.URLField(
        max_length=200,
        blank=True,
        null=True,
        default=None
    )

    # Timestamps and User Relations
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_properties',
        default=1  # Assumes admin user has ID 1
    )
    favorited_by = models.ManyToManyField(
        User,
        related_name='favorite_properties',
        blank=True
    )

    # Additional Features
    amenities = models.ManyToManyField('PropertyAmenity', blank=True)
    featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Properties"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['property_type']),
            models.Index(fields=['status']),
            models.Index(fields=['price']),
            models.Index(fields=['city']),
        ]

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('property-detail', kwargs={'pk': self.pk})

class PropertyAmenity(models.Model):
    name = models.CharField(max_length=100, default="Basic Amenity")
    icon = models.CharField(max_length=50, blank=True, default="fas fa-star")
    
    class Meta:
        verbose_name_plural = "Property Amenities"
        
    def __str__(self):
        return self.name

class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property,
        related_name='images',
        on_delete=models.CASCADE
    )
    image = models.ImageField(
        upload_to='properties/gallery/',
        default='properties/default_gallery.jpg'
    )
    is_primary = models.BooleanField(default=False)
    caption = models.CharField(max_length=200, blank=True, default="Property Image")
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        
    def __str__(self):
        return f"Image for {self.property.title}"

class PropertyView(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='property_views'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    ip_address = models.GenericIPAddressField(default="0.0.0.0")
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['property', 'user', 'ip_address']
        
    def __str__(self):
        return f"View of {self.property.title} on {self.timestamp}"

class SavedSearch(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, default="My Saved Search")
    filters = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Saved Searches"
        
    def __str__(self):
        return f"{self.user.username}'s search: {self.name}"

class Listing(models.Model):
    # Reference Code
    reference_code = models.CharField(max_length=10, unique=True, editable=False)
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Property Details
    PROPERTY_TYPE_CHOICES = [
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('villa', 'Villa'),
        ('condo', 'Condo'),
    ]
    
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    bedrooms = models.PositiveIntegerField()
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1)
    area = models.PositiveIntegerField(help_text="Area in square feet")
    
    # Location
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    
    # Status
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('sold', 'Sold'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Owner
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    
    def save(self, *args, **kwargs):
        if not self.reference_code:
            # Generate reference code: KDL (Kudil) + Year + 5 random chars
            year = str(timezone.now().year)[2:]  # Get last 2 digits of year
            random_chars = str(uuid.uuid4())[:5].upper()
            self.reference_code = f'KDL{year}{random_chars}'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.reference_code} - {self.title}"

class SavedListing(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_listings')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'listing']  # Prevent duplicate saves
        ordering = ['-saved_at']
    
    def __str__(self):
        return f"{self.user.username} saved {self.listing.reference_code}"

class Conversation(models.Model):
    participant1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_as_participant1')
    participant2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_as_participant2')
    last_message_time = models.DateTimeField(auto_now=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

class Thread(models.Model):
    """Model for community forum threads."""
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=50)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_threads', blank=True)
    views = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('thread_detail', args=[str(self.id)])