from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import redirect, get_object_or_404
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView, ListView, DeleteView, UpdateView

from api.forms import RegistrationForm, LoginForm, NoteForm
from api.models import Note, User
from api.serializers import UserSerializer


class UserRegistrationView(TemplateView):
    template_name = 'register.html'

    def post(self, request, *args, **kwargs):
        form = RegistrationForm(request.POST)  # Corrected to request.POST
        if form.is_valid():
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                email=form.cleaned_data['email'],
                password=form.cleaned_data['password']
            )
            messages.success(self, f"Welcome, {user.username}!")
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Please correct the errors below.')

    def get(self, request, *args, **kwargs):
        form = RegistrationForm()
        return self.render_to_response({'form': form})


class UserLoginView(TemplateView):
    template_name = 'login.html'

    def post(self, request, *args, **kwargs):

        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {username}!")
                return redirect('dashboard')
            else:
                messages.error(request, 'Invalid login credentials.')

    def get(self, request, *args, **kwargs):
        form = LoginForm()
        return self.render_to_response({'form': form})


@method_decorator(login_required(login_url="login"), name="dispatch")
class NoteView(TemplateView):
    template_name = "create_note.html"

    def get(self, request, *args, **kwargs):
        form = NoteForm()
        return self.render_to_response({'form': form})

    def post(self, request, *args, **kwargs):
        form = NoteForm(request.POST)
        if form.is_valid():
            note = form.save(commit=False)
            note.user = request.user
            note.save()
            messages.success(request, "Note created successfully.")
            return redirect('dashboard')


@method_decorator(login_required(login_url="login"), name="dispatch")
class DashboardPageView(TemplateView):
    template_name = 'dashboard.html'

    def get(self, request, *args, **kwargs):
        context = self.get_context_data()
        return self.render_to_response(context)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['notes'] = self.get_user_notes()
        context['user'] = self.get_user_data()
        return context

    def get_user_notes(self):
        return Note.objects.filter(user=self.request.user)

    def get_user_data(self):
        return UserSerializer(self.request.user).data


@method_decorator(login_required(login_url="login"), name="dispatch")
class DeleteNoteView(DeleteView):
    template_name = "dashboard.html"
    model = Note
    success_url = reverse_lazy("dashboard")

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)


@method_decorator(login_required(login_url="login"), name="dispatch")
class UpdateNoteView(UpdateView):
    template_name = "edit_note.html"
    model = Note
    form_class = NoteForm
    success_url = reverse_lazy("dashboard")

    def get_object(self, queryset=None):
        return get_object_or_404(Note, pk=self.kwargs['pk'], user=self.request.user)

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)


class SearchResultsView(ListView):
    model = Note
    template_name = 'dashboard.html'

    def get_queryset(self):
        query = self.request.GET.get("q")
        query_notes = Note.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query), user=self.request.user
        )
        # new
        return query_notes
