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
    class Meta:
        model = UserNote
        fields = '__all__'
        
        note=NoteSerializer()
        
    def create(self, validated_data):
        note_data = validated_data.pop('note')
        note = Note.objects.create(**note_data)
        note.users.add(self.context['request'].user)
        user_note = UserNote.objects.create(
            note=note,
            user=self.context['request'].user,
            **validated_data
        )
        return user_note
    
    
    def to_representation(self, obj):
        self.fields['note'] = NoteSerializer()
        return super(UserNoteSerializer, self).to_representation(obj)

    def update(self, instance, validated_data):
        note_data = validated_data.pop('note', None)
        if note_data:
            note_serializer = NoteSerializer(instance=instance.note, data=note_data, partial=True)
            if note_serializer.is_valid(raise_exception=True):
                note_serializer.save()
        return super().update(instance, validated_data)

    def validate(self, data):
        if data.get('is_pinned') and data.get('is_archived'):
            raise serializers.ValidationError("A note cannot be pinned and archived at the same time.")

        if data.get('is_trashed') and data.get('is_pinned'):
            raise serializers.ValidationError("A trashed note cannot be pinned.")

        if data.get('is_trashed') and data.get('is_archived'):
            raise serializers.ValidationError("A trashed note cannot be archived.")

        if data.get('is_trashed') and data.get('is_favorited'):
            raise serializers.ValidationError("A trashed note cannot be favorited.")

        if data.get('is_archived') and data.get('is_favorited'):
            raise serializers.ValidationError("An archived note cannot be favorited.")

        if data.get('is_archived') and data.get('is_pinned') and data.get('is_favorited'):
            raise serializers.ValidationError("An archived note cannot be both pinned and favorited.")
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
