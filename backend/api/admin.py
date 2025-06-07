from typing import Tuple

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    User,
    OAuthAccount,
    Note,
    UserNote,
    Tag,
    NoteTag,
    NoteBook,
    NoteBookNote,
    UserTag,
    UserNoteBook,
)


class MyUserAdmin(UserAdmin):

    def has_delete_permission(self, request, obj=None):
        return True

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        is_superuser = request.user.is_superuser
        disabled_fields = set()

        if not is_superuser:
            disabled_fields |= {
                "email",
                "username",
                "is_superuser",
                "user_permissions",
            }
        if not is_superuser and obj is not None and obj == request.user:
            disabled_fields |= {
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            }

        for f in disabled_fields:
            if f in form.base_fields:
                form.base_fields[f].disabled = True

        return form

    list_display = ("email", "username", "date_joined")
    search_fields = ("email", "username", "date_joined")
    ordering = ("date_joined",)
    readonly_fields = ["date_joined"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("username",)}),
        ("Permissions", {"fields": ("is_superuser", "groups", "user_permissions")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "password1", "password2"),
            },
        ),
    )


class OAuthAccountAdmin(admin.ModelAdmin):

    list_display = ("OAuthProvider", "user")
    search_fields = ("OAuthProvider", "user__email", "user__username")
    list_filter = ("OAuthProvider",)
    ordering = ("user__email",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "OAuthProvider",
                    "user",
                    "access_token",
                    "refresh_token",
                    "expires_at",
                    "created_at",
                )
            },
        ),
    )


class NoteAdmin(admin.ModelAdmin):

    list_display = ("title", "display_users", "is_shared", "updated_at")
    search_fields = ("title", "content", "users__email", "users__username")
    ordering = ("-updated_at",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "title",
                    "content",
                    "is_shared",
                    "created_at",
                    "updated_at",
                    "schedule_delete_at",
                )
            },
        ),
    )

    readonly_fields = ("created_at", "updated_at")

    def display_users(self, obj: Note) -> str:

        return ", ".join(u.username for u in obj.users.all())

    display_users.short_description = "Users"


class UserNoteAdmin(admin.ModelAdmin):
    list_display = ("note", "user", "role", "shared_from", "shared_at", "display_tags")
    search_fields = ("note__title", "user__email", "shared_from__email")
    ordering = ("-shared_at",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "user",
                    "note",
                    "role",
                    "shared_from",
                    "shared_at",
                    "is_pinned",
                    "is_favorited",
                    "is_archived",
                    "is_trashed",
                    "favorited_at",
                    "archived_at",
                    "trashed_at",
                    "removed_at",
                    "created_at",
                )
            },
        ),
    )

    readonly_fields = (
        "shared_at",
        "archived_at",
        "trashed_at",
        "favorited_at",
        "removed_at",
        "created_at",
    )

    def display_tags(self, obj: Note) -> str:
        return ", ".join(n.title for n in obj.tags.all())

    display_tags.short_description = "Tags"


class TagAdmin(admin.ModelAdmin):

    list_display = ("name", "display_users")
    search_fields = ("name", "users__email", "notes__title")
    ordering = ("name",)

    fieldsets = (
        (None, {"fields": ("name", "created_at", "updated_at", "schedule_delete_at")}),
    )

    readonly_fields = ("created_at", "updated_at")

    def display_users(self, obj: Tag) -> str:
        return ", ".join(u.username for u in obj.users.all())

    display_users.short_description = "Users"


class NoteTagAdmin(admin.ModelAdmin):

    list_display = ("note", "tag", "added_at", "removed_at")
    search_fields = ("note__title", "tag__name")
    ordering = ("-added_at",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "note",
                    "tag",
                    "added_at",
                    "removed_at",
                    "created_at",
                )
            },
        ),
    )

    readonly_fields = ("added_at", "removed_at", "created_at")


class UserTagAdmin(admin.ModelAdmin):

    list_display = ("user", "tag", "created_at")
    search_fields = ("user__email", "tag__name")
    ordering = ("-created_at",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "user",
                    "tag",
                    "created_at",
                )
            },
        ),
    )

    readonly_fields = ("created_at",)


class NoteBookAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "display_users",
        "display_notes",
        "created_at",
        "updated_at",
    )
    search_fields = ("name", "users__email", "notes__title")
    ordering = ("-created_at",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "name",
                    "created_at",
                    "updated_at",
                    "schedule_delete_at",
                )
            },
        ),
    )

    readonly_fields = ("created_at", "updated_at")

    def display_users(self, obj: NoteBook) -> str:
        return ", ".join(u.username for u in obj.users.all())

    display_users.short_description = "Users"

    def display_notes(self, obj: NoteBook) -> str:
        return ", ".join(n.title for n in obj.notes.all())

    display_notes.short_description = "Notes"


class NoteBookNoteAdmin(admin.ModelAdmin):

    list_display = ("note_book", "note", "added_at", "removed_at")
    search_fields = ("note_book__name", "note__title")
    ordering = ("-added_at",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "note_book",
                    "note",
                    "added_at",
                    "removed_at",
                    "created_at",
                )
            },
        ),
    )

    readonly_fields = ("added_at", "removed_at", "created_at")


class UserNoteBookAdmin(admin.ModelAdmin):


    list_display = ("note_book", "user", "role", "shared_from", "shared_at")
    search_fields = ("note_book__name", "user__email", "shared_from__email")
    ordering = ("-shared_at",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "user",
                    "note_book",
                    "role",
                    "shared_from",
                    "shared_at",
                    "is_pinned",
                    "is_favorited",
                    "is_archived",
                    "is_trashed",
                    "favorited_at",
                    "archived_at",
                    "trashed_at",
                    "removed_at",
                    "created_at",
                )
            },
        ),
    )

    readonly_fields = (
        "shared_at",
        "favorited_at",
        "archived_at",
        "trashed_at",
        "removed_at",
        "created_at",
    )


admin.site.register(User, MyUserAdmin)
admin.site.register(OAuthAccount, OAuthAccountAdmin)

admin.site.register(Note, NoteAdmin)
admin.site.register(UserNote, UserNoteAdmin)

admin.site.register(Tag, TagAdmin)
admin.site.register(NoteTag, NoteTagAdmin)
admin.site.register(UserTag, UserTagAdmin)

admin.site.register(NoteBook, NoteBookAdmin)
admin.site.register(NoteBookNote, NoteBookNoteAdmin)
admin.site.register(UserNoteBook, UserNoteBookAdmin)
