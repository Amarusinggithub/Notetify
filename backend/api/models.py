from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager, PermissionsMixin
from django.db import models


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
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    password = models.CharField(max_length=128, null=True)
    avatar = models.TextField(null=True, blank=True)
    email = models.EmailField(unique=True, max_length=254)
    is_active = models.BooleanField(
        default=True,
    )
    email_verified_at = models.DateTimeField(null=True, blank=True)
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


class OAuthAccount(models.Model):
    class OAuthProviders(models.TextChoices):
        GOOGLE = "GOOGLE", "google"
        GITHUB = "GITHUB", "github"
        FACEBOOK = "FACEBOOK", "facebook"

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="OAuth_accounts",
    )
    OAuthProvider = models.CharField(
        max_length=20,
        choices=OAuthProviders.choices,
    )
    access_token = models.CharField(max_length=200, blank=True, null=True)
    refresh_token = models.CharField(max_length=200, blank=True, null=True)
    expires_at = models.DateTimeField(
        auto_now=True,
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )


class Tag(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    users = models.ManyToManyField(User, through="UserTag")
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )
    schedule_delete_at = models.DateTimeField(
        auto_now=True,
        null=True,
    )

    def __str__(self):
        return self.name


class Note(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=500)
    content = models.TextField()
    users = models.ManyToManyField(
        User, through="UserNote", through_fields=("note", "user")
    )
    is_shared = models.BooleanField(default=False)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )
    schedule_delete_at = models.DateTimeField(
        auto_now=True,
        null=True,
    )

    def __str__(self):
        return self.title


class Notebook(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    users = models.ManyToManyField(
        User, through="UserNotebook", through_fields=("notebook", "user")
    )
    notes = models.ManyToManyField(Note, through="NotebooKNote")
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )
    schedule_delete_at = models.DateTimeField(
        auto_now=True,
        null=True,
    )


class NotebookNote(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE)
    notebook = models.ForeignKey(Notebook(), on_delete=models.CASCADE)
    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    added_at = models.DateTimeField(
        auto_now_add=True,
    )
    removed_at = models.DateTimeField(
        auto_now=True,
        null=True,
    )

    class Meta:
        unique_together = (("note", "notebook"),)


class UserTag(models.Model):
    id = models.AutoField(primary_key=True)
    tag = models.ForeignKey(
        Tag,
        related_name="tag",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_tags",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    # role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.OWNER)
    class Meta:
        unique_together = (("user", "tag"),)


class UserNotebook(models.Model):
    id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.OWNER)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="User_Notebooks",
    )
    notebook = models.ForeignKey(
        Notebook,
        on_delete=models.CASCADE,
    )
    is_pinned = models.BooleanField(default=False)
    is_favorited = models.BooleanField(default=False)
    is_trashed = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    shared_from = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
    )
    shared_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    archived_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    trashed_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    favorited_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    removed_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        unique_together = (("user", "notebook"),)


class UserNote(models.Model):
    id = models.AutoField(primary_key=True)
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.OWNER)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_notes",
    )
    tags = models.ManyToManyField(Tag, through="NoteTag")

    note = models.ForeignKey(Note, on_delete=models.CASCADE)
    is_pinned = models.BooleanField(default=False)
    is_favorited = models.BooleanField(default=False)
    is_trashed = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    shared_from = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
    )
    shared_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    archived_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    trashed_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    favorited_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    removed_at = models.DateTimeField(
        auto_now_add=True,
        null=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        unique_together = (("user", "note"),)


class NoteTag(models.Model):
    note = models.ForeignKey(UserNote(), on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    id = models.AutoField(primary_key=True)
    added_at = models.DateTimeField(
        auto_now_add=True,
    )
    removed_at = models.DateTimeField(
        auto_now=True,
        null=True,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        unique_together = (("note", "tag"),)
