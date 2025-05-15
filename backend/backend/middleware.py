from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.db import close_old_connections
from django.middleware.csrf import CsrfViewMiddleware


from django.db import close_old_connections
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async


@database_sync_to_async
def get_user_for_token(token_str):
 
    jwt_auth = JWTAuthentication()
    validated_token = jwt_auth.get_validated_token(token_str)
    return jwt_auth.get_user(validated_token)


class CookieJWTAuthMiddleware(BaseMiddleware):
    """
    Custom Channels middleware that:
    1. Reads the 'access' cookie from scope['headers']
    2. Validates it using SimpleJWT
    3. Sets scope['user'] to our Django user or AnonymousUser
    """

    async def __call__(self, scope, receive, send):
        # Close old DB connections to avoid timeout errors
        close_old_connections()

        # Default to Anonymous
        scope["user"] = AnonymousUser()

        # Grab 'cookie' header (bytes) and parse it
        headers = dict(scope["headers"])
        raw_cookie = headers.get(b"cookie", b"").decode("utf-8")
        cookies = {
            k: v
            for k, v in (
                pair.split("=", 1) for pair in raw_cookie.split("; ") if "=" in pair
            )
        }

        access_token = cookies.get("access_token") 
        if access_token:
            try:
                user = await get_user_for_token(access_token)
                scope["user"] = user
            except (InvalidToken, TokenError):
                pass

        return await super().__call__(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return CookieJWTAuthMiddleware(AuthMiddlewareStack(inner))


class CustomCsrfMiddleware(CsrfViewMiddleware):
    def process_view(self, request, callback, callback_args, callback_kwargs):
        if 'HTTP_X_CSRFTOKEN' not in request.META:
            csrf_token = request.COOKIES.get('csrftoken')
            if csrf_token:
                request.CSRF_COOKIE = csrf_token
            request.META['HTTP_X_CSRFTOKEN'] = csrf_token
            super().process_view(request, callback, callback_args, callback_kwargs)
