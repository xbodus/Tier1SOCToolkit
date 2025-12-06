import time

from channels.generic.websocket import AsyncWebsocketConsumer
import json

from django.core.cache import cache



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
        cooldown_ends = time.time() + 15
        cache.set(stop_key, cooldown_ends, timeout=10)

        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Called by the background poller
    async def send_log(self, event):
        await self.send(text_data=json.dumps({
            "message": event.get("message"),
            "alert": event.get("alert", False)
        }))