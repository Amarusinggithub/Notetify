from rest_framework import serializers
from api.models import (
    Note,
    NoteTag,
    Notebook,
    NotebookNote,
    OAuthAccount,
    User,
    Tag,
    UserNote,
    UserNotebook,
    UserTag,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_user):
        user = User.objects.create_user(**validated_user)
        return user


class NoteSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )

    class Meta:
        model = Note
        fields = "__all__"

    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        users = validated_data.pop("users", None)
        instance = super().update(instance, validated_data)
        if users is not None:
            instance.users.set(users)
        return instance


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
            title=note_data.get("title", ""),
            content=note_data.get("content", ""),
        )
        validated_data.setdefault("user", self.context["request"].user)
        user_note = UserNote.objects.create(note=note, **validated_data)
        user_note.tags.set(tags)
        return user_note

    def update(self, instance, validated_data):
        note_data = validated_data.pop("note_data", None)
        if note_data:
            note = instance.note
            for attr in ("title", "content"):
                if attr in note_data:
                    setattr(note, attr, note_data[attr])
            if "users" in note_data:
                note.users.set(note_data.get("users", []))
            note.save()
        return super().update(instance, validated_data)

    def validate(self, data):
        if data.get("is_pinned") and data.get("is_archived"):
            raise serializers.ValidationError(
                "A note cannot be pinned and archived at the same time."
            )
        if data.get("is_trashed") and data.get("is_pinned"):
            raise serializers.ValidationError("A trashed note cannot be pinned.")
        if data.get("is_trashed") and data.get("is_archived"):
            raise serializers.ValidationError("A trashed note cannot be archived.")
        if data.get("is_trashed") and data.get("is_favorited"):
            raise serializers.ValidationError("A trashed note cannot be favorited.")
        if data.get("is_archived") and data.get("is_favorited"):
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

    def update(self, instance, validated_data):
        users = validated_data.pop("users", None)
        instance = super().update(instance, validated_data)
        if users is not None:
            instance.users.set(users)
        return instance


class UserTagSerializer(serializers.ModelSerializer):
    tag = TagSerializer(read_only=True)
    tag_data = serializers.JSONField(write_only=True)

    class Meta:
        model = UserTag
        fields = "__all__"

    def create(self, validated_data):
        user = self.context["request"].user
        tag_data = validated_data.pop("tag_data", {})
        name = tag_data.get("name", "").strip()

        tag = Tag.objects.get_or_create(name=name)
        tag.users.add(user)

        usertag, created = UserTag.objects.get_or_create(
            user=user, tag=tag, defaults={}
        )
        if not created:
            return usertag

            # option B: raise a DRF ValidationError so the client gets a 400
            #raise serializers.ValidationError(f"You already have a tag “{name}”")

        return usertag


class NoteTagSerializer(serializers.ModelSerializer):
    note = serializers.PrimaryKeyRelatedField(queryset=Note.objects.all())
    tag = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all())

    class Meta:
        model = NoteTag
        fields = "__all__"


class NoteBookSerializer(serializers.ModelSerializer):
    users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), many=True, required=False
    )

    class Meta:
        model = Notebook
        fields = "__all__"

    def update(self, instance, validated_data):
        users = validated_data.pop("users", None)
        instance = super().update(instance, validated_data)
        if users is not None:
            instance.users.set(users)
        return instance


class NoteBookNoteSerializer(serializers.ModelSerializer):
    note = serializers.PrimaryKeyRelatedField(queryset=Note.objects.all())
    note_book = serializers.PrimaryKeyRelatedField(queryset=Notebook.objects.all())

    class Meta:
        model = NotebookNote
        fields = "__all__"


class UserNotebookSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        default=serializers.CurrentUserDefault(),
        required=False,
    )
    note_book = NoteBookSerializer(read_only=True)
    note_book_data = serializers.JSONField(write_only=True, required=False)

    class Meta:
        model = UserNotebook
        fields = "__all__"

    def create(self, validated_data):
        book_data = validated_data.pop("note_book_data", {})
        note_book = Notebook.objects.create(name=book_data.get("name", ""))
        note_book.users.add(self.context["request"].user)
        validated_data.setdefault("user", self.context["request"].user)
        return UserNotebook.objects.create(note_book=note_book, **validated_data)

    def validate(self, data):
        if data.get("is_pinned") and data.get("is_archived"):
            raise serializers.ValidationError(
                "A notebook cannot be pinned and archived at the same time."
            )
        if data.get("is_trashed") and data.get("is_pinned"):
            raise serializers.ValidationError("A trashed notebook cannot be pinned.")
        if data.get("is_trashed") and data.get("is_archived"):
            raise serializers.ValidationError("A trashed notebook cannot be archived.")
        if data.get("is_trashed") and data.get("is_favorited"):
            raise serializers.ValidationError("A trashed notebook cannot be favorited.")
        if data.get("is_archived") and data.get("is_favorited"):
            raise serializers.ValidationError(
                "An archived notebook cannot be favorited."
            )
        return data


class OAuthAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = OAuthAccount
        fields = "__all__"

    def create(self, validated_data):
        return super().create(validated_data)
