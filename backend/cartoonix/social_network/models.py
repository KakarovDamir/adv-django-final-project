import logging
from django.contrib.auth.models import User, AbstractUser
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models.signals import post_save
from ai.models import VideoPrompt
from django import forms
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.postgres.search import SearchVector
from django.contrib.postgres.indexes import GinIndex, BrinIndex

logger = logging.getLogger('model_logger')


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    friends = models.ManyToManyField('self', symmetrical=True, blank=True)

    class Meta:
        indexes = [
            GinIndex(SearchVector('bio', config='pg_catalog.russian'), name='profile_bio_search_idx'),
        ]

    def __str__(self):
        return self.user.username

    def is_friend(self, profile):
        return self.friends.filter(id=profile.id).exists()

@receiver(post_save, sender=get_user_model())
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)

    class Meta:
        indexes = [
            GinIndex(
                SearchVector('title', 'content', config='pg_catalog.russian'), 
                name='post_search_vector_idx'
            ),
            BrinIndex(fields=['created_at'], name='post_created_at_brin_idx'),
        ]

    def __str__(self):
        return self.title

    def total_likes(self):
        return self.likes.count()

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            GinIndex(SearchVector('content', config='pg_catalog.russian'), name='comment_content_search_idx'),
            BrinIndex(fields=['created_at'], name='comment_created_at_brin_idx'),
        ]

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"

class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"{self.from_user} to {self.to_user}"

class Notification(models.Model):
    recipient = models.ForeignKey(User, related_name='notifications', on_delete=models.CASCADE)
    actor = models.ForeignKey(User, related_name='acted_notifications', on_delete=models.CASCADE)
    verb = models.CharField(max_length=255)
    target = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE)
    read = models.BooleanField(default=False, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            BrinIndex(fields=['timestamp'], name='notification_timestamp_brin_idx'),
        ]

    def __str__(self):
        return f"{self.actor} {self.verb} {self.target}"
