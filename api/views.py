from django.contrib.auth import logout, login, authenticate
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework import status, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.models import Note, User
from api.serializers import NoteSerializer


def index(request):
    csrf_token = get_token(request)
    return JsonResponse({"csrfToken": csrf_token})


@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])  # Ensure only authenticated users can access
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



api_view(["PUT", "DELETE"])


@permission_classes(IsAuthenticated)
def notes_detail(request, pk):
    try:
        note = Note.objects.get(user=request.user, pk=pk, id=pk)
    except Note.DoesNotExist:
        return Response(request, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        note.delete()
        return Response(request, status=status.HTTP_204_NO_CONTENT)
    elif request.method == "PUT":
        noteSerializer = NoteSerializer(note, data=request.data, context={"request": request})
        if noteSerializer.is_valid():
            noteSerializer.save(user=request.user)
            return Response(request, status=status.HTTP_204_NO_CONTENT)
        return Response(noteSerializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes(IsAuthenticated)
class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)


class LoginView(views.APIView):
    permission_classes(IsAuthenticated)
    def post(self, request, format=None):
        data = request.data

        username = data.get('username', None)
        password = data.get('password', None)

        try:
            user = authenticate(username=username, password=password)
        except User.DoesNotExist:
            user = None

        if user is not None:
            if user.is_active:
                login(request, user)
                return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Account is inactive"}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"error": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        if not email or not username or not password:
            raise ValidationError("All fields are required")

        User.objects.create_user(username=username, email=email, password=password)
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
