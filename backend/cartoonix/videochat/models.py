from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.contrib.postgres.search import SearchVector
from django.contrib.postgres.indexes import GinIndex, BrinIndex

User = get_user_model()


class Room(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            BrinIndex(fields=['created_at'], name='room_created_at_brin_idx'),
        ]

    def __str__(self):
        return self.name


class Message(models.Model):
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ('timestamp',)
        indexes = [
            GinIndex(SearchVector('content', config='pg_catalog.english'), name='message_content_search_idx'),
            BrinIndex(fields=['timestamp'], name='message_timestamp_brin_idx'),
        ]


class Call(models.Model):
    caller = models.ForeignKey(User, related_name='outgoing_calls', on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='incoming_calls', on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        indexes = [
            BrinIndex(fields=['start_time'], name='call_start_time_brin_idx'),
        ]

    def end_call(self):
        self.is_active = False
        self.end_time = timezone.now()
        self.save()