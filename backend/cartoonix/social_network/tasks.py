import logging
from celery import shared_task
from .models import Notification, Post, Profile
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count

logger = logging.getLogger(__name__)


@shared_task
def create_notification(recipient_id, actor_id, verb, target_content_type=None, 
                        target_object_id=None):
    """
    Asynchronously creates a notification.
    """
    notification = Notification.objects.create(
        recipient_id=recipient_id,
        actor_id=actor_id,
        verb=verb,
        target_content_type_id=target_content_type,
        target_object_id=target_object_id
    )
    logger.info(f"Notification {notification.id} created for user {recipient_id} by actor {actor_id}: '{verb}'.")

    return f"Notification created for user {recipient_id}"


@shared_task
def add(x, y):
    return x + y


@shared_task
def test_task():
    print("Test task executed")
    return "Test task completed"


@shared_task
def log_current_time():
    import datetime
    current_time = datetime.datetime.now().isoformat()
    logger.info(f"Periodic task log_current_time: The current time is {current_time}")
    return f"Logged time: {current_time}"


@shared_task
def cleanup_old_notifications():
    ninety_days_ago = timezone.now() - timedelta(days=90)
    
    try:
        if not hasattr(Notification, 'read') or not hasattr(Notification, 'timestamp'):
            error_msg = "Notification model does not have 'read' or 'timestamp' field. Skipping cleanup."
            logger.error(error_msg)
            print(error_msg)
            return error_msg
            
        old_read_notifications = Notification.objects.filter(
            timestamp__lt=ninety_days_ago,
            read=True
        )
        
        count = old_read_notifications.count()
        
        if count > 0:
            old_read_notifications.delete()
            success_msg = f"Successfully deleted {count} old read notifications."
            logger.info(success_msg)
            print(success_msg)
            return success_msg
        else:
            info_msg = "No old read notifications to delete."
            logger.info(info_msg)
            print(info_msg)
            return info_msg
            
    except Exception as e:
        error_msg = f"Error during cleanup_old_notifications: {str(e)}"
        logger.error(error_msg)
        print(error_msg)
        return error_msg


@shared_task
def send_activity_digest():
    logger.info("Executing send_activity_digest task...")
    yesterday = timezone.now() - timedelta(days=1)

    try:
        top_posts = Post.objects.filter(created_at__gte=yesterday).annotate(num_likes=Count('likes')).order_by('-num_likes', '-created_at')[:3]
        if not top_posts:
            logger.info("No new posts in the last 24 hours for digest.")
    except Exception as e:
        logger.error(f"Error fetching top posts for digest: {e}")
        top_posts = []

    users_to_notify_qs = User.objects.filter(is_active=True)
    if hasattr(Profile, 'send_activity_digest'):
        users_to_notify_qs = users_to_notify_qs.filter(profile__send_activity_digest=True)
    else:
        logger.warning("Profile model does not have 'send_activity_digest' field. Digest will attempt for all active users if not otherwise restricted.")

    for user in users_to_notify_qs:
        digest_content = f"Hello {user.username}, here is your activity digest:\n"
        send_this_digest = False

        if top_posts:
            digest_content += "\n--- Top Posts Today ---\n"
            for post in top_posts:
                digest_content += f"- '{post.title}' by {post.author.username} (Likes: {post.num_likes})\n"
            send_this_digest = True
        
        try:
            if hasattr(user, 'friend_requests_received'):
                new_friend_requests = user.friend_requests_received.filter(is_accepted=False, created_at__gte=yesterday).count()
                if new_friend_requests > 0:
                    digest_content += f"\n--- New Friend Requests ---\n"
                    digest_content += f"You have {new_friend_requests} new friend request(s) waiting for you!\n"
                    send_this_digest = True
        except Exception as e:
            logger.error(f"Error fetching friend requests for user {user.username}: {e}")

        if send_this_digest:
            logger.info(f"--- Digest for {user.username} ---")
            logger.info(digest_content)
            print(f"Digest prepared for {user.username}. Check logs.")
        else:
            logger.info(f"No significant activity for {user.username} to send a digest.")

    logger.info("send_activity_digest task finished.")
    return "Activity digest task completed."
