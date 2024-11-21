from django.contrib.auth import logout, login, authenticate
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Note, User
from api.serializers import NoteSerializer, UserSerializer


def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({"csrfToken": csrf_token})


@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def notes_list(request):
    if request.method == "GET":
        notes = Note.objects.filter(user=request.user)
        serializer = NoteSerializer(notes, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = NoteSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def notes_detail(request, pk):
    note = get_object_or_404(Note, user=request.user, pk=pk)

    if request.method == "DELETE":

        note.delete()
        return Response({"message": "Note deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    elif request.method == "PUT":

        serializer = NoteSerializer(note, data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.is_authenticated:
            print("User:", request.user)  # Logs the authenticated user
            print("Session:", request.session)  # Logs the session details
            print("CSRF Token:", request.headers.get('X-CSRFToken'))  # Logs the CSRF token
            logout(request)
            return Response({'message': 'Logged out successfully'}, status=200)
        else:
            return Response({'error': 'User is not authenticated'}, status=403)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        # Debugging CSRF Token
        print("CSRF Token from Header:", request.headers.get("X-CSRFToken"))
        print("Expected CSRF Token:", get_token(request))
        print("Request data:", request.data)

        data = request.data
        username = data.get('username', None)
        password = data.get('password', None)

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user is not None:
            if user.is_active:

                login(request, user)

                serializer = UserSerializer(user, context={"request": request})
                return Response({"userData": serializer.data, "message": "Login successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Account is inactive"}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)


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

        return Response({"userData": serializer.data, "message": "User registered successfully"},
                        status=status.HTTP_201_CREATED)
