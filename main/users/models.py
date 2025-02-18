from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, default=None, null=True, blank=True)  
    email = models.EmailField(unique=True, default="default@example.com", null=True, blank=True)  
    username = models.CharField(max_length=150, unique=True, default="default_user")
    first_name = models.CharField(max_length=30, default="FirstName")
    last_name = models.CharField(max_length=30, default="LastName")
    user_type = models.CharField(
        max_length=20,
        default='seeker'
    )

    def __str__(self):
        return self.username
