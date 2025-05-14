import json
import logging
from datetime import datetime

from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger('api_logger')

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # Log connection request
        client_addr = self.scope.get('client', ['0.0.0.0'])[0]
        is_auth = not isinstance(self.scope["user"], AnonymousUser)
        logger.info(f"Chat WebSocket connect attempt from {client_addr} to room {self.room_name} | Auth: {is_auth}")

        # Accept all connections - auth will be handled at the message level
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"Chat WebSocket connection accepted for room {self.room_name}")

    async def disconnect(self, close_code):
        logger.info(f"Chat WebSocket disconnected from room {self.room_name} with code {close_code}")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message = data.get("message", "")
            username = data.get("username", "Anonymous")
            msg_type = data.get("type", "chat")
            
            # Log based on message type
            if msg_type == "join":
                logger.info(f"User {username} joined chat room {self.room_name}")
            elif msg_type == "leave":
                logger.info(f"User {username} left chat room {self.room_name}")
            elif msg_type == "chat":
                if not message:
                    logger.warning(f"Received empty message in chat room {self.room_name}")
                    return
                logger.info(f"Chat message received in room {self.room_name} from {username}")
            
            # If user is authenticated, use their real username
            if self.scope["user"].is_authenticated:
                username = self.scope["user"].username
                
            # Send to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "username": username,
                    "msg_type": msg_type
                }
            )
        except Exception as e:
            logger.error(f"Error in chat receive: {str(e)}")

    async def chat_message(self, event):
        try:
            # Forward the message to WebSocket
            await self.send(text_data=json.dumps({
                "type": event.get("msg_type", "chat"),
                "message": event["message"],
                "username": event["username"],
                "timestamp": datetime.now().isoformat()
            }))
            logger.info(f"Message sent to client in room {self.room_name}")
        except Exception as e:
            logger.error(f"Error in chat_message: {str(e)}")


class CallConsumer(AsyncWebsocketConsumer):
    connected_users = {}  # Track users by room

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"call_{self.room_id}"
        self.user_id = None
        
        # Log connection request
        client_addr = self.scope.get('client', ['0.0.0.0'])[0]
        is_auth = not isinstance(self.scope["user"], AnonymousUser)
        logger.info(f"Call WebSocket connect attempt from {client_addr} to room {self.room_id} | Auth: {is_auth}")

        # Join the room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"Call WebSocket connection accepted for room {self.room_id}")

    async def disconnect(self, close_code):
        logger.info(f"Call WebSocket disconnected from room {self.room_id} with code {close_code}")
        
        # Remove user from room and notify others
        if self.user_id and self.room_id in self.connected_users:
            if self.user_id in self.connected_users[self.room_id]:
                self.connected_users[self.room_id].remove(self.user_id)
                
                # Notify others that user has left
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_left',
                        'user_id': self.user_id,
                    }
                )
                
                logger.info(f"User {self.user_id} removed from room {self.room_id}. Users left: {self.connected_users.get(self.room_id, [])}")
            
            # Clean up empty rooms
            if not self.connected_users.get(self.room_id):
                self.connected_users.pop(self.room_id, None)
                logger.info(f"Room {self.room_id} is now empty and was removed")
        
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            username = "anon"
            if self.scope["user"].is_authenticated:
                username = self.scope["user"].username
            
            # Handle join message
            if data.get('type') == 'join':
                self.user_id = data.get('userId', f"anon-{id(self)}")
                
                # Initialize room if needed
                if self.room_id not in self.connected_users:
                    self.connected_users[self.room_id] = []
                
                # Add user to room if not already there
                if self.user_id not in self.connected_users[self.room_id]:
                    self.connected_users[self.room_id].append(self.user_id)
                
                logger.info(f"User {self.user_id} joined call room {self.room_id}. Users in room: {self.connected_users[self.room_id]}")
                
                # Notify everyone (including this user) about all users in the room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'room_status',
                        'users': self.connected_users[self.room_id],
                    }
                )
                return
                
            # Handle signaling messages (offer, answer, etc.)
            msg_type = data.get('type', 'unknown')
            logger.info(f"Signal received in call room {self.room_id} from {username} (type: {msg_type})")

            # Add more detailed logging for WebRTC debugging
            if msg_type in ['offer', 'answer']:
                logger.info(f"WebRTC {msg_type} signal received and will be forwarded")
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'forward_signal',
                    'data': data,
                    'username': username,
                    'user_id': self.user_id,
                }
            )
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received in call room {self.room_id}")
        except Exception as e:
            logger.error(f"Error in call receive: {str(e)}")

    async def forward_signal(self, event):
        try:
            # Don't send signals back to the sender
            if event.get('user_id') == self.user_id and event['data'].get('type') not in ['room_status']:
                logger.debug(f"Not forwarding {event['data'].get('type')} signal back to sender {self.user_id}")
                return
                
            # Log what's being forwarded
            signal_type = event['data'].get('type', 'unknown')
            if signal_type in ['offer', 'answer']:
                logger.info(f"Forwarding {signal_type} signal to client {self.user_id} in room {self.room_id}")
            
            await self.send(text_data=json.dumps({
                'data': event['data'],
                'username': event['username'],
                'timestamp': datetime.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Error in forward_signal: {str(e)}")
            
    async def user_left(self, event):
        try:
            await self.send(text_data=json.dumps({
                'data': {
                    'type': 'user_left',
                    'userId': event['user_id'],
                },
                'username': 'system',
                'timestamp': datetime.now().isoformat()
            }))
            logger.info(f"User left notification sent to client in room {self.room_id}")
        except Exception as e:
            logger.error(f"Error in user_left handler: {str(e)}")
            
    async def room_status(self, event):
        try:
            await self.send(text_data=json.dumps({
                'data': {
                    'type': 'room_status',
                    'users': event['users'],
                },
                'username': 'system',
                'timestamp': datetime.now().isoformat()
            }))
            logger.info(f"Room status sent to client in room {self.room_id}")
        except Exception as e:
            logger.error(f"Error in room_status handler: {str(e)}")