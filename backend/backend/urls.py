from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt import views as jwt_views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)
from .views import AsgiTokenValidatorView,get_csrf_token,CookieTokenRefreshView,verify_token


urlpatterns = [
    path("api/admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("", include("two_factor.urls", "two_factor")),
    path(
        r"^api/password_reset/",
        include("django_rest_passwordreset.urls", namespace="password_reset"),
    ),
    path("api/ws/", AsgiTokenValidatorView.as_view()),
    path("api/csrf/", get_csrf_token, name="csrf-token"),
    path("api/auth/me/", verify_token, name="verify-token"),
   # path("verify_mfa/", verify_mfa, name="verify_mfa"),
   # path("disable-2fa/", disable_2fa, name="disable_2fa"),
    path("", include("api.urls")),
    path("api/silk/", include("silk.urls", namespace="silk")),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
