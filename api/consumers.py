import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NoteConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.note=self.scope["url_route"]["kwargs"]["id"]
        self.room_group_name = f"chat_{self.note}"
        
        
        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    
    async def disconnect(self, close_code):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message}
        )
