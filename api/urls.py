from django.urls import path

from . import views

urlpatterns = [
    path("api/tags/", views.TagView.as_view(), name="tags"),
    path("api/tags/delete_tag/<int:pk>/", views.TagView.as_view(), name="delete-tag"),
    path("api/tags/edit_tag/<int:pk>/", views.TagView.as_view(), name="edit-tag"),
    path("api/tags/create_tag/", views.TagView.as_view(), name="create-tag"),

    path("api/notes/", views.NoteView.as_view(), name="notes"),
    path("api/notes/create_note/", views.NoteView.as_view(), name="create-note"),
    path("api/notes/edit_note/<int:pk>/", views.NoteView.as_view(), name="edit-note"),
    path("api/notes/delete_note/<int:pk>/", views.NoteView.as_view(), name="delete-note"),

    path("api/login/", views.LoginView.as_view(), name="api-login"),
    path("api/register/", views.RegisterView.as_view(), name="api-register"),
    path("api/logout/", views.LogoutView.as_view(), name="api-logout"),
    path("csrf/", views.get_csrf_token, name="csrf-token"),
    
    
    path('home/', views.HomeView.as_view(), name ='home')

]

