from rest_framework import serializers
from api.models import Note, User, Tag,UserNote


class NoteSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )
    class Meta:
        model = Note
        fields = '__all__'
        
    def update(self, instance, validated_data):
        users = validated_data.pop('users', None)
        instance = super().update(instance, validated_data)
        if users is not None:
            instance.users.set(users)
        return instance


class UserNoteSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        default=serializers.CurrentUserDefault(), 
        required=False
    )
    note = NoteSerializer(read_only=True)
    note_data = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = UserNote
        fields = [
            'id', 'user', 'note', 'note_data', 'is_pinned',
            'is_favorited', 'is_trashed', 'is_archived', 'role', 'tags'
        ]

    def create(self, validated_data):
        note_data = validated_data.pop('note_data', {})
        tags = validated_data.pop('tags', [])

        note = Note.objects.create(
            title=note_data.get('title', ''),
            content=note_data.get('content', '')
        )
        note.users.add(self.context['request'].user)

        if not validated_data.get('user'):
            validated_data['user'] = self.context['request'].user


        user_note = UserNote.objects.create(note=note, **validated_data)
        
        user_note.tags.set(tags)
    
        return user_note
    
    def to_representation(self, obj):
        representation = super().to_representation(obj)
        return representation

    def update(self, instance, validated_data):
        note_data = validated_data.pop('note_data', None)
        if note_data:
            note = instance.note
            if 'title' in note_data:
                note.title = note_data['title']
            if 'content' in note_data:
                note.content = note_data['content']
            if 'users' in note_data:
                user_ids = note_data.pop('users')
                note.users.set(user_ids)
            note.save()
            
        return super().update(instance, validated_data)

    def validate(self, data):
        is_pinned = data.get('is_pinned', False)
        is_favorited = data.get('is_favorited', False)
        is_trashed = data.get('is_trashed', False) 
        is_archived = data.get('is_archived', False)
        
        if is_pinned and is_archived:
            raise serializers.ValidationError("A note cannot be pinned and archived at the same time.")

        if is_trashed and is_pinned:
            raise serializers.ValidationError("A trashed note cannot be pinned.")

        if is_trashed and is_archived:
            raise serializers.ValidationError("A trashed note cannot be archived.")

        if is_trashed and is_favorited:
            raise serializers.ValidationError("A trashed note cannot be favorited.")

        if is_archived and is_favorited:
            raise serializers.ValidationError("An archived note cannot be favorited.")

        return data

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        exclude = ['users']

    def create(self, validated_data):
        users = validated_data.pop('users', [])
        tag = Tag.objects.create(**validated_data)

        request = self.context.get('request', None)
        if request and hasattr(request, "user"):
            tag.users.add(request.user)
        return tag

    def update(self, instance, validated_data):
        users = validated_data.pop('users', None)
        instance = super().update(instance, validated_data)

        if users:
            instance.users.set(users)
        return instance


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_user):
        user = User.objects.create_user(**validated_user)
        return user
