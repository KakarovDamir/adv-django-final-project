import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User 
from .models import Message 


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        print(f"User {self.user.username} connected to room {self.room_name}") 

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name') and hasattr(self, 'channel_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        if hasattr(self, 'user') and self.user.is_authenticated:
             print(f"User {self.user.username} disconnected from room {self.room_name}")

    async def receive(self, text_data):
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        try:
            data = json.loads(text_data)
            message_content = data.get('message')
            action = data.get('action')

            if not message_content and action != 'delete_message':
                await self.send_error_message("Message content is required.")
                return

            can_add_message = await database_sync_to_async(self.user.has_perm)('chat.add_message')
            if not can_add_message:
                await self.send_error_message("You do not have permission to send messages.")
                return

            new_message = await self.save_message(self.user, message_content)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_content,
                    'user': self.user.username, 
                    'timestamp': str(new_message.timestamp)
                }
            )
        except json.JSONDecodeError:
            await self.send_error_message("Invalid JSON format.")
        except Exception as e:
            await self.send_error_message(f"An error occurred: {str(e)}")
            print(f"Error in receive for user {self.user.username}: {e}")

    @database_sync_to_async
    def save_message(self, user, content):
        return Message.objects.create(user=user, content=content)

    async def chat_message(self, event):
        message = event['message']
        user = event['user']
        timestamp = event['timestamp']

        await self.send(text_data=json.dumps({
            'message': message,
            'user': user,
            'timestamp': timestamp
        }))
        
    async def send_error_message(self, error_text):
        await self.send(text_data=json.dumps({
            'error': error_text
        }))