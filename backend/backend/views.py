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
    InvalidToken, AuthenticationFailed


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
            return Response({"detail": "Refresh cookie missing"}, status=401)

        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except (ExpiredTokenError, TokenError, InvalidToken):
            # delete cookies and tell the SPA to re-login
            resp = Response({"detail": "Refresh token expired"}, status=401)
            resp.delete_cookie(settings.SIMPLE_JWT["AUTH_COOKIE"])
            resp.delete_cookie(settings.SIMPLE_JWT["AUTH_COOKIE_REFRESH"])
            return resp

        # get new tokens
        access = serializer.validated_data["access"]
        refresh = serializer.validated_data.get("refresh", None)
        response = Response(status=200)

        # reset the access cookie
        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=access,
            expires=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )
        if refresh:
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
        Response({"uuid": ticket_uuid})


@require_GET
@api_view(["GET"])
@ensure_csrf_cookie
def get_csrf_token(request):
    return Response( status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def verify_token( request):
    auth = JWTAuthentication()

    raw_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"]) or None
    if (raw_token==None) :
        return Response(
            {"error": "Token is invalid or expired"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    try:
        validated_token = auth.get_validated_token(raw_token)
        if validated_token:
            user=auth.get_user(validated_token=validated_token)
            response = Response()
            serializer = UserSerializer(user, context={"request": request})

            response.data =serializer.data

            response.status_code = status.HTTP_200_OK
            return response
    except  (InvalidToken, AuthenticationFailed,ExpiredTokenError,TokenError):
        return Response(
            {"error": "Token is invalid or expired"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
