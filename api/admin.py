from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Task
from typing import Set



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
    list_display = ('email','username', 'first_name', 'last_name', 'is_staff','date_joined')
    search_fields = ('email','username', 'roles','date_joined')
    ordering = ('date_joined',)  # Order by most recent users first


    readonly_fields = [
        'date_joined',
    ]
    # Set up the fieldsets to control the layout of the user admin page
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name','username')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username','password1', 'password2'),
        }),
    )



class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'priority', 'due_date', 'is_completed')
    search_fields = ('title', 'content', 'user__username', 'status', 'priority')
    list_filter = ('status', 'priority', 'is_completed', 'due_date')
    ordering = ('-date_created',)

    readonly_fields = [
        'date_created',
        'last_updated','user'
    ]
    fieldsets = (
        (None, {'fields': ('title', 'content', 'description', 'user')}),
        ('Status & Priority', {'fields': ('status', 'priority', 'is_completed')}),
        ('Important Dates', {'fields': ('due_date', 'date_created', 'last_updated')}),
    )





# Register your User model with the custom UserAdmin
admin.site.register(User, MyUserAdmin)
admin.site.register(Task)