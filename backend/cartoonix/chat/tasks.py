import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Message

logger = logging.getLogger(__name__)

@shared_task
def archive_old_chat_messages():
    logger.info("Executing archive_old_chat_messages task...")
    one_year_ago = timezone.now() - timedelta(days=365)
    
    try:
        old_messages = Message.objects.filter(timestamp__lt=one_year_ago)
        
        count = old_messages.count()
        
        if count > 0:
            _, deleted_counts = old_messages.delete()
            deleted_count_actual = deleted_counts.get('chat.Message', 0)
            success_msg = f"Successfully deleted {deleted_count_actual} chat messages older than one year."
            logger.info(success_msg)
            print(success_msg)
            return success_msg
        else:
            info_msg = "No chat messages older than one year to delete."
            logger.info(info_msg)
            print(info_msg)
            return info_msg
            
    except Exception as e:
        error_msg = f"Error during archive_old_chat_messages: {str(e)}"
        logger.error(error_msg)
        print(error_msg)
        return error_msg 