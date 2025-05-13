from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.indexes import GinIndex, BrinIndex


class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            GinIndex(fields=['content'], name='chat_message_content_gin_idx', opclasses=['gin_trgm_ops']),
            BrinIndex(fields=['timestamp'], name='msg_ts_brin_idx'),
            models.Index(fields=['user'], name='chat_message_user_idx'),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.content[:30]}"
