from uuid import uuid4
from django.core.cache import cache
import os
from dotenv import load_dotenv
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import (
    ExpiredTokenError,
    TokenError,
    InvalidToken,
    
)

from rest_framework.decorators import api_view


from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view

from api.serializers import UserSerializer


load_dotenv()
DEBUG = os.environ.get("DEBUG", default=True)


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])

        if not refresh_token:
            return Response(
                {"detail": "Refresh token not found"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except (ExpiredTokenError, TokenError, InvalidToken) as e:
            response = Response(
                {"detail": "Refresh token expired or invalid"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            response.delete_cookie(
                settings.SIMPLE_JWT["AUTH_COOKIE"],
                path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
                domain=settings.SIMPLE_JWT.get("AUTH_COOKIE_DOMAIN"),
            )
            response.delete_cookie(
                settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
                domain=settings.SIMPLE_JWT.get("AUTH_COOKIE_DOMAIN"),
            )
            return response

        access = serializer.validated_data["access"]
        refresh = serializer.validated_data.get("refresh", refresh_token)

        response = Response({"detail": "Token refreshed successfully"}, status=200)

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=access,
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            domain=settings.SIMPLE_JWT.get("AUTH_COOKIE_DOMAIN"),
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
        )

        if refresh != refresh_token:
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                value=refresh,
                max_age=int(
                    settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()
                ),
                domain=settings.SIMPLE_JWT.get("AUTH_COOKIE_DOMAIN"),
                path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )

        return response


class AsgiTokenValidatorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        ticket_uuid = uuid4()
        user_id = request.user.id
        cache.set(ticket_uuid, user_id, 600)
        return Response({"uuid": ticket_uuid})


@require_GET
@api_view(["GET"])
@ensure_csrf_cookie
def get_csrf_token(request):
    return Response(status=status.HTTP_200_OK)


class UserDetailView(APIView):
    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):
        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data)
