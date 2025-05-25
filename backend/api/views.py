from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import User, Tag, UserNote
from api.serializers import UserSerializer, TagSerializer, UserNoteSerializer
from django.conf import settings
from rest_framework.decorators import api_view

from django.views.decorators.vary import vary_on_cookie

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

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
        username = request.data.get("username")
        password = request.data.get("password")
        response = Response()
        if not email or not username or not password:
            raise ValidationError("All fields are required")
        user = User.objects.create_user(
            username=username, email=email, password=password
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


class TagView(APIView):
    permission_classes = [IsAuthenticated]

    #@method_decorator(cache_page(60 * 60 * 2, key_prefix="tags"))
    def get(self, request):
        tags = Tag.objects.filter(users=request.user)
        serializer = TagSerializer(tags, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TagSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        tag = get_object_or_404(Tag, pk=pk, users=request.user)
        tag.delete()
        return Response(
            {"message": "Tag deleted successfully"}, status=status.HTTP_204_NO_CONTENT
        )

    def put(self, request, pk):
        tag = get_object_or_404(Tag, pk=pk, users=request.user)
        serializer = TagSerializer(tag, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


CATEGORY_FIELD_MAP = {
        "favorite":  "is_favorited",
        "pinned":    "is_pinned",
        "trashed":   "is_trashed",
        "archived":  "is_archived",
        }


@api_view(["GET"])
# @method_decorator(cache_page(60 * 60 * 2, key_prefix="notes"))

def get_archive(request):
    if request.method == "GET":
        notes = UserNote.objects.filter(user=request.user)
        category = request.query_params.get("category")

        if category:
            key=category.lower()
            field = CATEGORY_FIELD_MAP.get(key)
            if not field:
                return Response(
                    {"detail": f"Unknown category '{category}'."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            notes = notes.filter(**{field: True})
        serializer = UserNoteSerializer(notes, many=True,context={"request": request})  
        return Response(serializer.data) 


@api_view(["GET"])
# @method_decorator(cache_page(60 * 60 * 2, key_prefix="notes"))

def get_favorite(request):
    if request.method == "GET":
        notes = UserNote.objects.filter(user=request.user)
        category = request.query_params.get("category")

        if category:
            key = category.lower()
            field = CATEGORY_FIELD_MAP.get(key)
            if not field:
                return Response(
                    {"detail": f"Unknown category '{category}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            notes = notes.filter(**{field: True})
        serializer = UserNoteSerializer(notes, many=True, context={"request": request})
        return Response(serializer.data)


@api_view(["GET"])
# @method_decorator(cache_page(60 * 60 * 2, key_prefix="notes"))

def get_trashed(request):
    if request.method == "GET":
        notes = UserNote.objects.filter(user=request.user)
        category = request.query_params.get("category")

        if category:
            key = category.lower()
            field = CATEGORY_FIELD_MAP.get(key)
            if not field:
                return Response(
                    {"detail": f"Unknown category '{category}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            notes = notes.filter(**{field: True})
        serializer = UserNoteSerializer(notes, many=True, context={"request": request})
        return Response(serializer.data)


@api_view(["GET"])
# @method_decorator(cache_page(60 * 60 * 2, key_prefix="notes"))

def get_pinned(request):
    if request.method == "GET":
        notes = UserNote.objects.filter(user=request.user)
        category = request.query_params.get("category")

        if category:
            key = category.lower()
            field = CATEGORY_FIELD_MAP.get(key)
            if not field:
                return Response(
                    {"detail": f"Unknown category '{category}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            notes = notes.filter(**{field: True})
        serializer = UserNoteSerializer(notes, many=True, context={"request": request})
        return Response(serializer.data)


class NoteView(APIView):
    permission_classes = [IsAuthenticated]

    # @method_decorator(cache_page(60 * 60 * 2, key_prefix="notes"))
    def get(self, request):
        notes = UserNote.objects.filter(user=request.user)
        serializer = UserNoteSerializer(notes, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UserNoteSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        note = get_object_or_404(UserNote, user=request.user, pk=pk)
        note.delete()
        return Response(
            {"message": "Note deleted successfully"}, status=status.HTTP_204_NO_CONTENT
        )

    def put(self, request, pk):
        note = get_object_or_404(UserNote, user=request.user, pk=pk)
        serializer = UserNoteSerializer(
            note, data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
