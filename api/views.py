
from api.models import User
from api.serializers import UserSerializer
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated,AllowAny


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes =[AllowAny]