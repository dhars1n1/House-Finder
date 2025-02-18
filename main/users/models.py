from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

class Profile(models.Model):
    USER_TYPE_CHOICES = [
        ('seeker', 'House Seeker'),
        ('owner', 'House Owner'),
    ]
    
    # Keep existing fields
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        null=True  # Allow null temporarily for migration
    )
    username = models.CharField(max_length=150, blank=True, default="")
    email = models.EmailField(max_length=254, blank=True, default="")
    first_name = models.CharField(max_length=150, blank=True, default="")
    last_name = models.CharField(max_length=150, blank=True, default="")
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='seeker'
    )
    
    # Add new fields
    phone_number = models.CharField(max_length=15, blank=True, default="")
    address = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    zip_code = models.CharField(max_length=10, blank=True, default="")
    bio = models.TextField(max_length=500, blank=True, default="")
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        null=True,
        blank=True,
        default='profile_pics/default.jpg'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.username}'s Profile" if self.username else f"Profile {self.id}"

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'

