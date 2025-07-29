from datetime import datetime, timezone
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import User, UserNote, UserNotebook, UserTag
from api.serializers import (
    UserNotebookSerializer,
    UserSerializer,
    UserNoteSerializer,
    UserTagSerializer,
)
from django.conf import settings
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


def set_auth_cookies(response, tokens):
    response.set_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE"],
        value=tokens["access"],
        expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
        secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
        httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
    )
    response.set_cookie(
        key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
        value=tokens["refresh"],
        expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
        secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
        httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
        samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        last_name = request.data.get("last_name")
        first_name = request.data.get("first_name")
        password = request.data.get("password")

        if not email or not first_name or not last_name or not password:
            raise ValidationError("All fields are required")

        user = User.objects.create_user(
            last_name=last_name, first_name=first_name, email=email, password=password
        )

        user = authenticate(email=email, password=password)
        if user is not None and user.is_active:
            serializer = UserSerializer(user, context={"request": request})
            tokens = get_tokens_for_user(user)

            response = Response(serializer.data, status=status.HTTP_201_CREATED)

            set_auth_cookies(response, tokens)
            return response

        else:
            return Response(
                {"error": "Account creation failed or account not active"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(email=email, password=password)
        if user is not None and user.is_active:
            serializer = UserSerializer(user, context={"request": request})
            tokens = get_tokens_for_user(user)

            response = Response(serializer.data, status=status.HTTP_200_OK)

            set_auth_cookies(response, tokens)

            return response

        else:
            return Response(
                {"error": "Invalid credentials or inactive account"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])

        if not refresh_token:
            return Response(
                {"error": "Refresh token not found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            response = Response(
                {"message": "Successfully logged out"}, status=status.HTTP_200_OK
            )
            response.delete_cookie(
                settings.SIMPLE_JWT["AUTH_COOKIE"],
            )
            response.delete_cookie(
                settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
            )

            return response

        except Exception as e:
            return Response(
                {"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST
            )


# Your existing views remain the same
CACHE_TTL = 60 * 60 * 2  # 2 hours


class TagListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserTagSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["tag__id", "created_at"]
    search_fields = ["tag__name"]
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        return UserTag.objects.filter(user=self.request.user)
    # @method_decorator(
    #     cache_page(CACHE_TTL, key_prefix=lambda req: f"tags_user_{req.user.pk}")
    # )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save()


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserTagSerializer

    def get_object(self):
        return get_object_or_404(UserTag, user=self.request.user, pk=self.kwargs["pk"])

    def perform_update(self, serializer):
        serializer.save()


class NoteListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserNoteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        "is_pinned",
        "is_favorite",
        "is_trashed",
        "tags__id",
        "created_at",
    ]
    search_fields = ["note__title"]
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        return UserNote.objects.filter(user=self.request.user)
    # @method_decorator(
    #    cache_page(CACHE_TTL, key_prefix=lambda req: f"notes_user_{req.user.pk}")
    # )
    def list(self, request, *args, **kwargs):

        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserNoteSerializer

    def get_object(self):
        return get_object_or_404(UserNote, user=self.request.user, pk=self.kwargs["pk"])

    def perform_update(self, serializer):
        serializer.save()


class NotebookListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserNotebookSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = [
        "is_pinned",
        "is_favorite",
        "is_trashed",
        "notes__id",
        "created_at",
    ]
    search_fields = ["note_book__name"]
    pagination_class = LimitOffsetPagination

    def get_queryset(self):
        return UserNotebook.objects.filter(user=self.request.user)
    # @method_decorator(
    #    cache_page(CACHE_TTL, key_prefix=lambda req: f"notes_user_{req.user.pk}")
    # )
    def list(self, request, *args, **kwargs):

        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotebookDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserNotebookSerializer

    def get_object(self):
        return get_object_or_404(
            UserNotebook, user=self.request.user, pk=self.kwargs["pk"]
        )

    def perform_update(self, serializer):
        serializer.save()
