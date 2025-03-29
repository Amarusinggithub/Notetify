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
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True,)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to="avatars/", null=True, blank=True)

    REQUIRED_FIELDS = []
    USERNAME_FIELD = "username"

    objects = MyUserManager()

    def __str__(self):
        return self.email
    
    
class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL,related_name="tags")
    def __str__(self):
        return self.name

class Note(models.Model):
    id = models.AutoField(primary_key=True)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="notes")
    title = models.CharField(max_length=500)
    content = models.TextField()
    def __str__(self):
        return self.title
    
    
class UserNote(models.Model):
    # NEW FOR THE ROLES
    class Roles(models.TextChoices):
        OWNER = "OWNER", "Owner"
        EDITOR = "EDITOR", "Editor"
        MEMBER = "MEMBER", "Member"

    role = models.CharField(
        max_length=20, choices=Roles.choices, default=Roles.OWNER
    )
    id = models.AutoField(primary_key=True)
    user= models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="User_notes")
    tags = models.ManyToManyField(Tag, related_name="User_tags",blank=True)
    note=models.OneToOneField(Note, on_delete=models.CASCADE)
    is_pinned = models.BooleanField(default=False)
    is_favorited = models.BooleanField(default=False)
    is_trashed = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    