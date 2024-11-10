from django.urls import path

from . import views
from .views import DashboardPageView, SearchResultsView, UpdateNoteView

urlpatterns = [
    path("register/", views.UserRegistrationView.as_view(), name="register"),
    path("login/", views.UserLoginView.as_view(), name="login"),
    path("create_note/", views.NoteView.as_view(), name="create_note"),
    path('edit_note/<int:pk>/', UpdateNoteView.as_view(), name='edit_note'),
    path('delete_note/<int:pk>/', views.DeleteNoteView.as_view(), name='delete_note'),
    path("search/", SearchResultsView.as_view(), name="search_results"),
    path("", DashboardPageView.as_view(), name="dashboard"),
]
