from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from uuid import uuid4
from django.middleware.csrf import get_token
from django.http import JsonResponse


class MyTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = response.data["access"]
        response.set_cookie("access", token, httponly=True)
        return response


class AsgiTokenValidatorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        ticket_uuid = uuid4()
        user_id = request.user.id
        cache.set(ticket_uuid, user_id, 600)
        Response({"uuid": ticket_uuid})


def get_csrf_token(request):
    csrf_token = get_token(request)
    response = JsonResponse({"csrftoken": csrf_token})
    response.set_cookie(
        "csrftoken", csrf_token, secure=True, samesite="Lax", httponly=False
    )
    return response
