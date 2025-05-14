from django.contrib.auth import get_user_model
from django.contrib.postgres.indexes import BrinIndex, GinIndex
from django.contrib.postgres.search import SearchVector
from django.db import models
from django.utils import timezone

User = get_user_model()


class ChatRoom(models.Model):
    name = models.CharField(max_length=255)
    participants = models.ManyToManyField(User, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            BrinIndex(fields=['created_at'], name='room_created_at_brin_idx'),
        ]

    def __str__(self):
        return self.name


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)


class CallSession(models.Model):
    room_id = models.CharField(max_length=255, unique=True)
    caller = models.ForeignKey(User, related_name='initiated_calls', on_delete=models.CASCADE)
    callee = models.ForeignKey(User, related_name='received_calls', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Call {self.room_id} from {self.caller} to {self.callee}"
