from .base import *


ALLOWED_HOSTS = ["0.0.0.0"]


CORS_ALLOWED_ORIGINS = [
    "http://0.0.0.0:5173",
    "http://0.0.0.0:4173",
    "http://0.0.0.0:3000",
]

CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://0.0.0.0:5173",
    "http://0.0.0.0:4173",
    "http://0.0.0.0:3000",
]


REDIS_HOST = os.environ.get("REDIS_HOST")
REDIS_PORT = os.environ.get("REDIS_PORT")
REDIS_DB = os.environ.get("REDIS_DB")

REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"

SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": os.environ.get(
            "REDIS_BACKEND", "channels_redis.core.RedisChannelLayer"
        ),
        "CONFIG": {
            "hosts": [("{host}".format(host=os.environ.get("REDIS_HOST")), 6379)],
        },
    },
}


CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}


YROOM_SETTINGS = {
    "lexical-editor": {
        # HocuspocusProvider adds and expects a name prefix
        "PROTOCOL_NAME_PREFIX": True,
        # Since the server doesn't know the name on connect,
        # it has to wait for communication from client
        "SERVER_START_SYNC": False,
        # HocuspocusProvider can only read one message per WS frame
        "PROTOCOL_DISABLE_PIPELINING": True,
        "REMOVE_ROOM_DELAY": 120,
    }
}

# Database
DATABASES = {
    "default": {
        "ENGINE": os.environ["DATABASE_ENGINE"],
        "NAME": os.environ["DATABASE_NAME"],
        "USER": os.environ["DATABASE_USERNAME"],
        "PASSWORD": os.environ["DATABASE_PASSWORD"],
        "HOST": os.environ["DATABASE_HOST"],
        "PORT": os.environ["DATABASE_PORT"],
    }
}
