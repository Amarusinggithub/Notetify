from django.urls import re_path
from . import consumers

ws_urlpatterns = [
    re_path(r"ws/Note/(?P<id>\d+)/$", consumers.TextCollaborationConsumer.as_asgi()),
    re_path(r"ws/tiptap/(?P<room_name>\w+)$", consumers.TipTapConsumer.as_asgi()),
]





