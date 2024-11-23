
from rest_framework import serializers

from api.models import Note, User


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = (
            'id', 'user', 'title', 'content', "is_favorite", "is_pinned", "in_recycleBin"
            , 'date_created', 'last_updated'
        )



class UserSerializer (serializers.ModelSerializer):
    class Meta:
        model=User
        fields = (
        "id", "email", "username", "password", "profile_picture", "is_active", "last_login", "date_joined", "")
        extra_kwargs = {"password":{"write_only":True}}

    def create(self,validated_user):
            user=User.objects.create_user(**validated_user)
            return user