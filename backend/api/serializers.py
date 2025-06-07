from rest_framework import serializers
from api.models import Note, NoteBook, OAuthAccount, User, Tag, UserNote, UserNoteBook, UserTag


class NoteSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )

    class Meta:
        model = Note
        fields = "__all__"

    def update(self, instance, validated_data):
        users = validated_data.pop("users", None)
        instance = super().update(instance, validated_data)
        if users is not None:
            instance.users.set(users)
        return instance

    def to_representation(self, obj):
        representation = super().to_representation(obj)
        return representation

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class UserNoteSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        default=serializers.CurrentUserDefault(),
        required=False,
    )
    note = NoteSerializer(read_only=True)
    note_data = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = UserNote
        fields = "__all__"

    def create(self, validated_data):
        note_data = validated_data.pop("note_data", {})
        tags = validated_data.pop("tags", [])

        note = Note.objects.create(
            title=note_data.get("title", ""), content=note_data.get("content", "")
        )
        note.users.add(self.context["request"].user)

        if not validated_data.get("user"):
            validated_data["user"] = self.context["request"].user

        user_note = UserNote.objects.create(note=note, **validated_data)

        user_note.tags.set(tags)

        return user_note

    def to_representation(self, obj):
        representation = super().to_representation(obj)
        return representation

    def update(self, instance, validated_data):
        note_data = validated_data.pop("note_data", None)
        if note_data:
            note = instance.note
            if "title" in note_data:
                note.title = note_data["title"]
            if "content" in note_data:
                note.content = note_data["content"]
            if "users" in note_data:
                user_ids = note_data.pop("users")
                note.users.set(user_ids)
            note.save()

        return super().update(instance, validated_data)

    def validate(self, data):
        is_pinned = data.get("is_pinned", False)
        is_favorited = data.get("is_favorited", False)
        is_trashed = data.get("is_trashed", False)
        is_archived = data.get("is_archived", False)

        if is_pinned and is_archived:
            raise serializers.ValidationError(
                "A note cannot be pinned and archived at the same time."
            )

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
        fields = "__all__"

    def create(self, validated_data):
        tag = Tag.objects.create(**validated_data)
        tag.users.add(self.context["request"].user)
        return tag

    def to_representation(self, obj):
        representation = super().to_representation(obj)
        return representation

    def update(self, instance, validated_data):
        users = validated_data.pop("users", None)
        instance = super().update(instance, validated_data)

        if users:
            instance.users.set(users)
        return instance


class UserTagSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        default=serializers.CurrentUserDefault(),
        required=False,
    )
    tag_serilizer = TagSerializer(read_only=True)
    tag_data = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = UserTag
        fields = "__all__"

    def create(self, validated_data):

        tag = Tag.objects.create(
            title=validated_data.get("title", ""),
        )
        tag.users.add(self.context["request"].user)

        if not validated_data.get("user"):
            validated_data["user"] = self.context["request"].user

        user_tag = UserTag.objects.create(tag=tag, **validated_data)
        return user_tag

    def to_representation(self, obj):
        representation = super().to_representation(obj)
        return representation

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_user):
        user = User.objects.create_user(**validated_user)
        return user

    def to_representation(self, obj):
        representation = super().to_representation(obj)
        return representation

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class NoteBookSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )

    class Meta:
        model = Note
        fields = "__all__"

    def update(self, instance, validated_data):
        users = validated_data.pop("users", None)
        instance = super().update(instance, validated_data)
        if users is not None:
            instance.users.set(users)
        return instance


class UserNoteBookSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        default=serializers.CurrentUserDefault(),
        required=False,
    )
    note_book_serializer = NoteBookSerializer(read_only=True)
    note_book_data = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = UserNoteBook
        fields = "__all__"

    def create(self, validated_data):
        note_book_data = validated_data.pop("title", {})

        note_book = NoteBook.objects.create(
            title=note_book_data.get("title", "")
        )
        note_book.users.add(self.context["request"].user)

        if not validated_data.get("user"):
            validated_data["user"] = self.context["request"].user

        user_note_book = UserNoteBook.objects.create(note_book=note_book, **validated_data)

        return user_note_book

    def to_representation(self, obj):
        representation = super().to_representation(obj)
        return representation

    def validate(self, data):
        is_pinned = data.get("is_pinned", False)
        is_favorited = data.get("is_favorited", False)
        is_trashed = data.get("is_trashed", False)
        is_archived = data.get("is_archived", False)

        if is_pinned and is_archived:
            raise serializers.ValidationError(
                "A note cannot be pinned and archived at the same time."
            )

        if is_trashed and is_pinned:
            raise serializers.ValidationError("A trashed note cannot be pinned.")

        if is_trashed and is_archived:
            raise serializers.ValidationError("A trashed note cannot be archived.")

        if is_trashed and is_favorited:
            raise serializers.ValidationError("A trashed note cannot be favorited.")

        if is_archived and is_favorited:
            raise serializers.ValidationError("An archived note cannot be favorited.")

        return data


class OAuthAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = OAuthAccount
        fields = "__all__"


    def to_representation(self, obj):
        representation = super().to_representation(obj)
        return representation

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)
