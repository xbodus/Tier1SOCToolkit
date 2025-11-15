from channels.generic.websocket import AsyncWebsocketConsumer
import json

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