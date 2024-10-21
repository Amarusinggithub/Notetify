from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager, PermissionsMixin
from django.db import models


class MyUserManager(UserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True,)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)


    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    EMAIL_FIELD =  'email'



    objects = MyUserManager()

    def __str__(self):
        return self.email


class Task(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=500)
    content = models.CharField(max_length=500)
    status = models.CharField(max_length=2, choices=[
        ('P', 'Pending'),
        ('IP', 'In Progress'),
        ('C', 'Completed'),
        ('O', 'On Hold')
    ], default='P')
    priority = models.CharField(max_length=1, choices=[
        ('L', 'Low'),
        ('M', 'Medium'),
        ('H', 'High')
    ], default='M')
    description = models.TextField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()}) - Priority: {self.get_priority_display()}"