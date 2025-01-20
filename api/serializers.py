
from rest_framework import serializers

from api.models import Note, User,Tag


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = (
            'id', 'user', 'title', 'content', "is_favorited", "is_pinned", "is_trashed", "is_archived","tags",)
 

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name","color", "user",)



class UserSerializer (serializers.ModelSerializer):
    class Meta:
        model=User
        fields = (
            "id", "email", "username", "password", "profile_picture", "is_active", "last_login", "date_joined",)
        extra_kwargs = {"password":{"write_only":True}}

    def create(self,validated_user):
            user=User.objects.create_user(**validated_user)
            return user