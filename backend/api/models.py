from turtle import update
from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager, PermissionsMixin
from django.db import models
from channels_yroom.models import YDocUpdate


class Roles(models.TextChoices):
    OWNER = "OWNER", "owner"
    EDITOR = "EDITOR", "editor"
    MEMBER = "MEMBER", "member"


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
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150)
    avatar = models.TextField(null=True, blank=True)

    email = models.EmailField(unique=True, max_length=254)
    email_verified_at = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )
    REQUIRED_FIELDS = []
    USERNAME_FIELD = "email"

    objects = MyUserManager()

    def __str__(self):
        return self.email


class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.name


class NoteBook(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )


class UserNoteBook(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="User"
    )
    note_book = models.ForeignKey(
        NoteBook,
        on_delete=models.CASCADE,
        related_name="Note_Book",
    )


class SharedNoteBook(models.Model):
    id = models.AutoField(primary_key=True)
    shared_to = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="shared_to")
    note_book = models.ForeignKey(NoteBook, on_delete=models.CASCADE)
    permision = models.CharField(
        max_length=20, choices=Roles.choices, default=Roles.Editor
    )
    shared_from = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shared_from"
    )
    shared_at = models.DateTimeField(
        auto_now_add=True,
    )


class UserTag(models.Model):
    id = models.AutoField(primary_key=True)
    tag = models.ForeignKey(Tag, related_name="tag", blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="User"
    )


class Note(models.Model):
    id = models.AutoField(primary_key=True)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="notes")
    title = models.CharField(max_length=500)
    content = models.TextField()
    is_shared = models.BooleanField(default=False)
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # ydoc = models.OneToOneField(
    #    YDocUpdate, on_delete=models.CASCADE, related_name="note"
    # )
    def __str__(self):
        return self.title


class NoteTag(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag)
    id = models.AutoField(primary_key=True)


class UserNote(models.Model):
    id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.OWNER)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="User"
    )
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
    is_pinned = models.BooleanField(default=False)
    is_favorited = models.BooleanField(default=False)
    is_trashed = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)


class SharedNote(models.Model):
    id = models.AutoField(primary_key=True)
    shared_to = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="shared_to")
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
    permision = models.CharField(
        max_length=20, choices=Roles.choices, default=Roles.Editor
    )
    shared_from = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shared_from"
    )
    shared_at = models.DateTimeField(
        auto_now_add=True,
    )
