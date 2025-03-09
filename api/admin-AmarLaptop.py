from typing import Set

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, Note, Tag,UserNote


class MyUserAdmin(UserAdmin):

    def has_delete_permission(self, request, obj=None):
        return False

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        is_superuser = request.user.is_superuser
        disabled_fields = set()

        if not is_superuser:
            disabled_fields |= {
                'email',
                'username',
                'is_superuser',
                'user_permissions',
            }

        if (
            not is_superuser
            and obj is not None
            and obj == request.user
        ):
            disabled_fields |= {
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            }

        for f in disabled_fields:
            if f in form.base_fields:
                form.base_fields[f].disabled = True

        return form

    list_display = ('email', 'username', 'date_joined')
    search_fields = ('email', 'username', 'date_joined')
    ordering = ('date_joined',)

    readonly_fields = [
        'date_joined',
    ]
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username',)}),
        ('Permissions', {'fields': ('is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )


class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'display_users')
    search_fields = ('title', 'content')
    list_filter = ()
    ordering = ()
    

    fieldsets = (
        (None, {'fields': ('title', 'content', 'users', )}),
    )

    def display_users(self, obj):
        """ Custom method to display users in list view """
        return ", ".join([user.username for user in obj.users.all()])

    display_users.short_description = 'Users'
    
    
    
    
class UserNoteAdmin(admin.ModelAdmin):
    list_display = ('note', 'user')
    search_fields = ('tag', 'user')
    list_filter = ()
    ordering = ()
    

    fieldsets = (
        (None, {'fields': ('user', "is_favorited", "is_pinned", "is_archived", "is_trashed", "tags","note")}),
    )


class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_users')
    search_fields = ('name',)
    list_filter = ()
    ordering = ()

    fieldsets = (
        (None, {'fields': ('name',  'users')}),
    )

    def display_users(self, obj):
        """Custom method to display users in list view"""
        return ", ".join([user.username for user in obj.users.all()])

    display_users.short_description = 'Users'


admin.site.register(User, MyUserAdmin)
admin.site.register(Note, NoteAdmin)
admin.site.register(UserNote, UserNoteAdmin)

admin.site.register(Tag, TagAdmin)
