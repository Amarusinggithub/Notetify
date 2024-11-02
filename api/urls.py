from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("home/", views.home_view, name="home"),
    path("users/", views.create_user, name="create-user"),
    path("notes/", views.get_notes, name="get-notes"),  # GET method
    path("notes/add/", views.add_note, name="add-note"),  # POST method
    path("notes/<int:pk>/", views.delete_note, name="delete-note"),
    path('create_note/', views.create_note_view, name='create_note'),
    # DELETE method
]
