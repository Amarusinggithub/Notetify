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
    AuthenticationFailed,
)

from rest_framework.decorators import api_view


from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, renderer_classes

from api.serializers import UserSerializer


load_dotenv()
DEBUG = os.environ.get("DEBUG", default=True)


class CookieTokenRefreshView(TokenRefreshView):

    def finalize_response(self, request, response, *args, **kwargs):
        return super().finalize_response(request, response, *args, **kwargs)

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
            )
            response.delete_cookie(
                settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
            )
            return response

        # Get new tokens
        access = serializer.validated_data["access"]
        refresh = serializer.validated_data.get("refresh", refresh_token)

        response = Response({"detail": "Token refreshed successfully"}, status=200)

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=access,
            expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )
        if refresh != refresh_token:
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"],
                value=refresh,
                expires=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
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


@api_view(["GET"])
def verify_token(request):
    """Verify JWT token from cookies and return user data"""
    auth = JWTAuthentication()
    raw_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])

    if not raw_token:
        return Response(
            {"error": "Authentication token not found"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        validated_token = auth.get_validated_token(raw_token)
        if validated_token:
            user = auth.get_user(validated_token)

        if not user.is_active:
            return Response(
                {"error": "User account is inactive"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = UserSerializer(request.user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    except (InvalidToken, AuthenticationFailed, ExpiredTokenError, TokenError) as e:
        return Response(
            {"error": "Token is invalid or expired", "detail": str(e)},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    except Exception as e:
        return Response(
            {"error": "Authentication failed", "detail": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
