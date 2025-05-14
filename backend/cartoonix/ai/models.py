from django.db import models
from django.contrib.postgres.search import SearchVector
from django.contrib.postgres.indexes import GinIndex, BrinIndex


class VideoPrompt(models.Model):
    CATEGORY_CHOICES = [
        ('comedy', 'Comedy'),
        ('tragedy', 'Tragedy'),
        ('humor', 'Humor'),
        ('romance', 'Romance'),
        ('horror', 'Horror'),
    ]
    
    prompt = models.TextField()
    arrTitles = models.JSONField(blank=True, null=True) 
    arrImages = models.JSONField(blank=True, null=True)
    arrVideos = models.JSONField(blank=True, null=True) 
    finalVideo = models.URLField(blank=True, null=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='comedy', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            GinIndex(SearchVector('prompt', config='pg_catalog.english'), name='videoprompt_prompt_search_idx'),
            GinIndex(fields=['arrTitles'], name='videoprompt_arrtitles_gin_idx'),
            BrinIndex(fields=['created_at'], name='videoprompt_created_at_brin_idx'),
        ]

    def __str__(self):
        return f"VideoPrompt {self.prompt[:50]}... (ID: {self.id})"