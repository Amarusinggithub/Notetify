from django.urls import path

from . import views

urlpatterns = [

   path("api/notes/", views.notes_list, name="notes"),
   path("api/notes/create_note", views.notes_list, name="create-nate"),
   path("api/notes/edit_note/<int:pk>/", views.notes_detail, name="edit-note"),
   path("api/notes/delete_note/<int:pk>/", views.notes_detail, name="delete-note"),
   path("api/login/", views.LoginView.as_view(), name="api-login"),
   path('api/register/', views.RegisterView.as_view(), name='api-register'),
   path('api/logout/', views.LogoutView.as_view(), name='api-logout'),
   path("csrf/", views.get_csrf_token, name="csrf-token"),
]
