from django.contrib.auth import logout, login, authenticate
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken

from api.models import Note, User,Tag,UserNote
from api.serializers import NoteSerializer, UserSerializer,TagSerializer,UserNoteSerializer



def get_token_for_user(user):
    refresh=RefreshToken.for_user(user)
    return {
        'refresh_token':str(refresh),
        'access_token':str(refresh.access_token),
    }

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')
        if not email or not username or not password:
            raise ValidationError("All fields are required")
        user = User.objects.create_user(username=username, email=email, password=password)
        serializer = UserSerializer(user, context={"request": request})
        tokens=get_token_for_user(user)
        return Response({"userData": serializer.data, "message": "User registered successfully", "access_token": tokens['access_token'],
            "refresh_token": tokens['refresh_token']},
                        status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        data = request.data
        email = data.get('email', None)
        password = data.get('password', None)
        if not email or not password:
            return Response({"error": "email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(email=email, password=password)
        if user is not None:
            if user.is_active:
                serializer = UserSerializer(user, context={"request": request})
                tokens=get_token_for_user(user)
                return Response({"userData": serializer.data, "message": "Login successful","access_token": tokens['access_token'],
            "refresh_token": tokens['refresh_token']}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Account is inactive"}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"error": " This is a Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Expect the client to send the refresh token in the request
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # This invalidates the refresh token
            return Response({"status": "OK, goodbye"}, status=status.HTTP_200_OK)
        except Exception as e:
            # Handle any errors during token blacklisting
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)

class TagView(APIView):
    permission_classes = [IsAuthenticated]

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
        tag = get_object_or_404(Tag, pk=pk ,users=request.user)
        tag.delete()
        return Response({"message": "Tag deleted successfully"}, status=status.HTTP_204_NO_CONTENT)  

    def put(self, request, pk):
        tag = get_object_or_404(Tag, pk=pk, users=request.user)
        serializer = TagSerializer(tag, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NoteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get (self,request):
        notes = UserNote.objects.filter(user=request.user)
        serializer = UserNoteSerializer(notes, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self,request):
        serializer = UserNoteSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self,request, pk):
        note = get_object_or_404(UserNote, user=request.user, pk=pk)
        note.delete()
        return Response({"message": "Note deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    def put(self,request, pk):
        note = get_object_or_404(UserNote, user=request.user,pk=pk)
        serializer = UserNoteSerializer(note, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)