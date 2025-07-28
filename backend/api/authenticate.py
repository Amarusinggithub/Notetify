from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


def dummy_get_response(request):
    return None


def enforce_csrf(request):
    """Only enforce CSRF for non-safe methods"""
    if request.method in ("GET", "HEAD", "OPTIONS", "TRACE"):
        return

    check = CSRFCheck(dummy_get_response)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied("CSRF Failed: %s" % reason)


class CustomAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            user = self.get_user(validated_token)

          
            if request.method not in ("GET", "HEAD", "OPTIONS", "TRACE"):
                enforce_csrf(request)

            return user, validated_token

        except (InvalidToken, TokenError):
            return None
