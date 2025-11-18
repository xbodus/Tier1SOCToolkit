from channels.generic.websocket import AsyncWebsocketConsumer
import json

from django.core.cache import cache


class TestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "test_group"

        # Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Broadcast the message to the whole group
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat_message",
                "message": text_data,
            }
        )

    async def chat_message(self, event):
        message = event["message"]

        await self.send(text_data=message)



class LogConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.group_name = None
        self.session_key = None

    async def connect(self):
        self.session_key = self.scope['url_route']['kwargs']['session_key']
        self.group_name = f"user_logs_{self.session_key}"

        # Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        stop_key = f"stop_logs_{self.session_key}"
        cache.set(stop_key, True, timeout=300)

        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Called by the background poller
    async def send_log(self, event):
        await self.send(text_data=json.dumps(event["message"]))