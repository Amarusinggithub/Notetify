import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels_yroom.consumer import YroomConsumer
from urllib.parse import parse_qs

from yroom import YRoomClientOptions


class NoteConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.note=self.scope["url_route"]["kwargs"]["id"]
        self.room_group_name = f"Note_{self.note}" 
        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
        
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "Note.message", "message": message}
        )
    
    async def disconnect(self, close_code):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)


class TextCollaborationConsumer(YroomConsumer):
    def get_room_name(self) -> str:
        """
        Determine a unique name for this room, e.g. based on URL
        """
        room_name = self.scope["url_route"]["kwargs"]["room_name"]
        return "textcollab.%s" % room_name

    async def connect(self) -> None:
        """
        Optional: perform some sort of authentication
        """
        user = self.scope["user"]
        if not user.is_staff:
            await self.close()
            return

        await super().connect()


def get_prosemirror_room_name(room_name: str) -> str:
    return "textcollab.%s" % room_name


def get_client_options(scope):
    params = parse_qs(scope["query_string"].decode())
    read_only = params.get("readonly", ["false"])[0].lower() == "true"
    return YRoomClientOptions(
        allow_write=not read_only,
        allow_write_awareness=not read_only,
    )


class TextCollabConsumer(YroomConsumer):
    def get_room_name(self) -> str:
        room_name = self.scope["url_route"]["kwargs"]["room_name"]
        return get_prosemirror_room_name(room_name)

    async def get_client_options(self) -> YRoomClientOptions:
        return get_client_options(self.scope)


def get_lexical_room_name(room_name: str) -> str:
    return "textcollab_lexical.%s" % room_name


class LexicalConsumer(YroomConsumer):
    def get_room_name(self) -> str:
        room_name = self.scope["url_route"]["kwargs"]["room_name"]
        return get_lexical_room_name(room_name)

    async def get_client_options(self) -> YRoomClientOptions:
        return get_client_options(self.scope)
