from django.urls import path
from .views import (
    NotebookDetailView,
    NotebookListCreateView,
    NoteListCreateView,
    NoteDetailView,
    TagListCreateView,
    TagDetailView,
    LoginView,
    RegisterView,
    LogoutView,
)

urlpatterns = [
    path(
        "api/notebooks/", NotebookListCreateView.as_view(), name="notebooks-list-create"
    ),
    path(
        "api/notebooks/<int:pk>/", NotebookDetailView.as_view(), name="notebooks-detail"
    ),
    path("api/notes/", NoteListCreateView.as_view(), name="notes-list-create"),
    path("api/notes/<int:pk>/", NoteDetailView.as_view(), name="notes-detail"),
    path("api/tags/", TagListCreateView.as_view(), name="tags-list-create"),
    path("api/tags/<int:pk>/", TagDetailView.as_view(), name="tags-detail"),
    path("api/login/", LoginView.as_view(), name="api-login"),
    path("api/register/", RegisterView.as_view(), name="api-register"),
    path("api/logout/", LogoutView.as_view(), name="api-logout"),
]
