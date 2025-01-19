from typing import Set

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, Note


class MyUserAdmin(UserAdmin):

    def has_delete_permission(self, request, obj=None):
        return False
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        is_superuser = request.user.is_superuser
        disabled_fields = set()  # type: Set[str]

        if not is_superuser:
            disabled_fields |= {
                'email',
                'username',
                'is_superuser',
                'user_permissions',
            }

        # Prevent non-superusers from editing their own permissions
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


    # Customize the display of the user fields here
    list_display = ('email', 'username', 'date_joined')
    search_fields = ('email', 'username', 'date_joined')
    ordering = ('date_joined',)  # Order by most recent users first


    readonly_fields = [
        'date_joined',
    ]
    # Set up the fieldsets to control the layout of the user admin page
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username',)}),
        ('Permissions', {'fields': ('is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username','password1', 'password2'),
        }),
    )


class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'user',)
    search_fields = ('title', 'content', 'user__username')
    list_filter = ()
    ordering = ()

  

    fieldsets = (
        (None, {'fields': ('title', 'content', 'user', "is_favorited", "is_pinned", "is_archived", "is_trashed")}),

    )


admin.site.register(User, MyUserAdmin)
admin.site.register(Note, NoteAdmin)
