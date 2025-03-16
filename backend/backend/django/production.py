from .base import *
from backend.env import env


ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS",default=[])

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool("DEBUG", default=False)