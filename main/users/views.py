from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth import login, authenticate
from .models import Profile

def login_view(request):
    if request.method == 'POST':
        # Handle form submission logic here
        return redirect('index')
    return render(request, 'users/login.html')

def signup(request):
    if request.method == "POST":
        email = request.POST.get("email")
        username = request.POST.get("username")
        password = request.POST.get("password")
        first_name = request.POST.get("first_name", "")
        last_name = request.POST.get("last_name", "")
        user_type = request.POST.get("user_type", "seeker")  # Default to seeker if not provided

        # Create the user instance
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            # Update the user's profile with user_type
            profile = user.profile
            profile.user_type = user_type
            profile.save()

            # Log the user in after successful signup
            login(request, user)
            messages.success(request, "Account created successfully!")
            return redirect("login")
        except Exception as e:
            messages.error(request, f"Error creating account: {str(e)}")
            return render(request, "users/signup.html")

    return render(request, "users/signup.html")