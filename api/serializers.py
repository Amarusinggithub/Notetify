
from rest_framework import serializers

from api.models import Task, User


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            'user', 'title', 'content','description' ,'status', 'priority',
            'due_date', 'date_created', 'last_updated', 'is_completed'
        )



class UserSerializer (serializers.ModelSerializer):
    class Meta:
        model=User
        fields=("id","email","username","password",)
        extra_kwargs = {"password":{"write_only":True}}

    def create(self,validated_user):
            user=User.objects.create_user(**validated_user)
            return user