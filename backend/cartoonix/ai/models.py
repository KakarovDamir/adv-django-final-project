from django.db import models
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
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES, default='comedy')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            GinIndex(fields=['arrTitles'], name='vp_arrtitles_gin_idx'),
            GinIndex(fields=['arrImages'], name='vp_arrimages_gin_idx'),
            GinIndex(fields=['arrVideos'], name='vp_arrvideos_gin_idx'),
            BrinIndex(fields=['created_at'], name='vp_created_at_brin_idx'),
            models.Index(fields=['category'], name='ai_videoprompt_category_idx'),
        ]

    def __str__(self):
        return f"VideoPrompt {self.prompt[:50]}... (ID: {self.id})"