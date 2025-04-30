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
    path("admin/", admin.site.urls),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("path_for_ws_connection/", AsgiTokenValidatorView.as_view()),
    path("csrf/", get_csrf_token, name="csrf-token"),
    path("auth/me/", verify_token, name="verify-token"),
    path("", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
