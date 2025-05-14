import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import VideoPrompt
from django.db.models import Q

logger = logging.getLogger(__name__)

@shared_task
def cleanup_stale_ai_jobs():
    logger.info("Executing cleanup_stale_ai_jobs task...")
    seven_days_ago = timezone.now() - timedelta(days=7)

    try:
        stale_prompts = VideoPrompt.objects.filter(
            Q(created_at__lt=seven_days_ago) & 
            (Q(finalVideo__isnull=True) | Q(finalVideo__exact=''))
        )
        
        count = stale_prompts.count()
        
        if count > 0:
            _, deleted_counts = stale_prompts.delete()
            deleted_count_actual = deleted_counts.get('ai.VideoPrompt', 0)
            
            success_msg = f"Successfully deleted {deleted_count_actual} stale VideoPrompt entries."
            logger.info(success_msg)
            print(success_msg)
            return success_msg
        else:
            info_msg = "No stale VideoPrompt entries to delete."
            logger.info(info_msg)
            print(info_msg)
            return info_msg
            
    except Exception as e:
        error_msg = f"Error during cleanup_stale_ai_jobs: {str(e)}"
        logger.error(error_msg)
        print(error_msg)
        return error_msg 