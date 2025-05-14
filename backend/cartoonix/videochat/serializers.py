from rest_framework import serializers
from .models import ChatRoom, Message, CallSession
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'timestamp']

class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'participants', 'messages']


class CallSessionSerializer(serializers.ModelSerializer):
    caller = UserSerializer(read_only=True)
    callee = UserSerializer(read_only=True)

    class Meta:
        model = CallSession
        fields = ['id', 'room_id', 'caller', 'callee', 'created_at', 'is_active']
