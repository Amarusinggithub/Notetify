from .base import *


ALLOWED_HOSTS = ["0.0.0.0"]


CORS_ALLOWED_ORIGINS = [
    "http://0.0.0.0:5173",
    "http://0.0.0.0:3000",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://0.0.0.0:5173",
    "http://0.0.0.0:3000",
]


CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("0.0.0.0", 6379)],
        },
    },
}

# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases
DATABASES = {
    "default": {
        "ENGINE": os.environ.get("DATABASE_ENGINE", default="django.db.backends.mysql"),
        "NAME": os.environ.get("DATABASE_NAME", default="notetify_db"),
        "USER": os.environ.get("DATABASE_USERNAME", default="root"),
        "PASSWORD": os.environ.get("DATABASE_PASSWORD", default=""),
        "HOST": os.environ.get("DATABASE_HOST", default="db_dev "),
        "PORT": os.environ.get("DATABASE_PORT", default="3306"),
    }
}
