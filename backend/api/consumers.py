from channels_yroom.consumer import YroomConsumer
from urllib.parse import parse_qs

from yroom import YRoomClientOptions


def get_client_options(scope):
    params = parse_qs(scope["query_string"].decode())
    read_only = params.get("readonly", ["false"])[0].lower() == "true"
    return YRoomClientOptions(
        allow_write=not read_only,
        allow_write_awareness=not read_only,
    )


def get_lexical_room_name(room_name: str) -> str:
    return "textcollab_lexical.%s" % room_name


class LexicalConsumer(YroomConsumer):
    def get_room_name(self) -> str:
        room_name = self.scope["url_route"]["kwargs"]["room_name"]
        return get_lexical_room_name(room_name)

    async def get_client_options(self) -> YRoomClientOptions:
        return get_client_options(self.scope)

    async def connect(self) -> None:
        """
        Optional: perform some sort of authentication
        """
        user = self.scope["user"]
        if not user.is_staff:
            await self.close()
            return

        await super().connect()
