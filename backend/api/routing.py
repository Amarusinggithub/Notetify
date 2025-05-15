from django.urls import re_path
from . import consumers

ws_urlpatterns = [
   
    re_path(r"ws/lexical/(?P<room_name>[\w-]+)$", consumers.LexicalConsumer.as_asgi()),
]
