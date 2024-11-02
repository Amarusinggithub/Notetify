from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("home/", views.home_view, name="home"),
    path("create_note/", views.create_note_view, name="create_note"),
    path('edit_note/<int:id>/', views.edit_note_view, name='edit_note'),
    path('delete_note/<int:id>/', views.delete_note, name='delete_note'),

]
