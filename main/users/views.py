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
        last_name = request.POST.get("last_name", "")  # Default to empty string if not provided
        user_type = request.POST.get("user_type")  # 'seeker' or 'owner'

        # Create the custom user instance with all necessary fields
        user = CustomUser.objects.create_user(
            email=email,
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            user_type=user_type,
        )

        # Optionally, log the user in after successful signup
        login(request, user)

        return redirect("login")  # Redirect to login after signup

    return render(request, "users/signup.html")