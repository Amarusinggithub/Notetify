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
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        last_name = request.data.get("last_name")
        first_name = request.data.get("first_name")
        password = request.data.get("password")
        response = Response()
        if not email or not first_name or not last_name or not password:
            raise ValidationError("All fields are required")
        user = User.objects.create_user(
            last_name=last_name, first_name=first_name, email=email, password=password
        )
        serializer = UserSerializer(user, context={"request": request})
        user = authenticate(email=email, password=password)
        if user is not None:
            if user.is_active:
                serializer = UserSerializer(user, context={"request": request})
                data = get_tokens_for_user(user)
                response.set_cookie(
                    key=settings.SIMPLE_JWT["AUTH_COOKIE"],
                    value=data["access"],
                    expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                    secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                    httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                    samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                )
                response.set_cookie(
                    key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                    value=data["refresh"],
                    expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                    secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                    httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                    samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                )

                response.data = {
                    "Success": "User registered successfully",
                    "data": serializer.data,
                }
                response.status_code = status.HTTP_201_CREATED
                return response
            else:
                return Response(
                    {"No active": "This account is not active!!"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {
                    "Invalid": "Invalid username or password could not authenticate after registration!!"
                },
                status=status.HTTP_404_NOT_FOUND,
            )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        data = request.data
        email = data.get("email", None)
        password = data.get("password", None)
        response = Response()

        if not email or not password:
            return Response(
                {"error": "email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = authenticate(email=email, password=password)
        if user is not None:
            if user.is_active:
                serializer = UserSerializer(user, context={"request": request})
                data = get_tokens_for_user(user)

                response.set_cookie(
                    key=settings.SIMPLE_JWT["AUTH_COOKIE"],
                    value=data["access"],
                    expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                    secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                    httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                    samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                )
                response.set_cookie(
                    key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                    value=data["refresh"],
                    expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                    secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                    httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                    samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                )

                response.data = {
                    "Success": "Login successfully",
                    "data": serializer.data,
                }
                response.status_code = status.HTTP_201_CREATED
                return response
            else:
                return Response(
                    {"No active": "This account is not active!!"},
                    status=status.HTTP_404_NOT_FOUND,
                )
        else:
            return Response(
                {"Invalid": "Invalid username or password!!"},
                status=status.HTTP_404_NOT_FOUND,
            )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"status": "OK, goodbye"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST
            )


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
        "is_favorited",
        "is_trashed",
        "is_archived",
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
        "is_favorited",
        "is_trashed",
        "is_archived",
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
