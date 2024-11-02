from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from rest_framework import status
from rest_framework.response import Response

from api.forms import RegistrationForm, LoginForm, NoteForm
from api.models import Note, User
from api.serializers import UserSerializer


def register_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)  # Corrected to request.POST
        if form.is_valid():
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password']
            )
            messages.success(request, f"Welcome, {user.username}!")
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = RegistrationForm()
    return render(request, 'register.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {username}!")
                return redirect('home')
            else:
                messages.error(request, 'Invalid login credentials.')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})


@login_required(login_url="login")
def delete_note(request, id):
    try:
        note = Note.objects.get(id=id, user=request.user)
    except Note.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    note.delete()
    notes = Note.objects.filter(user=request.user)
    user = UserSerializer(request.user)
    context = {"notes": notes, "user": user.data}
    return render(request, "dashboard.html", context)


@login_required(login_url="login")
def home_view(request):
    notes = Note.objects.filter(user=request.user)
    user = UserSerializer(request.user)
    context = {"notes": notes, "user": user.data}
    return render(request, "dashboard.html", context)


@login_required(login_url="login")
def create_note_view(request):
    if request.method == 'POST':
        form = NoteForm(request.POST)
        if form.is_valid():
            note = form.save(commit=False)
            note.user = request.user  # Associate the note with the logged-in user
            note.save()
            return redirect('home')  # Redirect to the dashboard after saving
    else:
        form = NoteForm()  # Create a new form instance for GET requests

    return render(request, 'create_note.html', {'form': form})  # Render the form for GET requests


@login_required(login_url="login")
def edit_note_view(request, id):
    note = get_object_or_404(Note, id=id, user=request.user)

    if request.method == 'POST':
        form = NoteForm(request.POST, instance=note)
        if form.is_valid():
            form.save()
            return redirect("home")  # Redirect to the home view after saving
    else:
        form = NoteForm(instance=note)  # Populate the form with existing note data for GET requests

    return render(request, 'create_note.html', {'form': form})  # Render the form for GET requests
