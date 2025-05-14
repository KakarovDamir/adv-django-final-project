# urls.py
from django.urls import path
from .views import (
    api_login, api_logout, api_register,
    post_list_create, post_detail,
    comment_list_create,
    profile_detail, profile_update, profile_delete,
    send_friend_request, accept_friend_request,
    reject_friend_request, friend_list,
    notification_list, mark_notification_as_read, get_csrf,
    post_like,
    post_update,
    post_delete,
    current_user
)

urlpatterns = [
    # Auth
    path('auth/current_user/', current_user, name='current-user'),
    path('auth/login/', api_login),
    path('get_csrf/', get_csrf),
    path('auth/logout/', api_logout, name='api-logout'),
    path('auth/register/', api_register, name='api-register'),

    # Posts
    path('posts/', post_list_create, name='post-list'),
    path('posts/<int:pk>/', post_detail, name='post-detail'),
    path('posts/<int:pk>/update/', post_update, name='post-update'),
    path('posts/<int:pk>/delete/', post_delete, name='post-delete'),

    # Comments
    path('posts/<int:post_id>/comments/', comment_list_create, name='comment-list'),

    # Profiles
    path('profile/<str:username>/', profile_detail, name='profile-detail'),
    path('profile/update/', profile_update, name='profile-update'),
    path('profile/delete/', profile_delete, name='profile-delete'),

    # Friends
    path('friends/requests/send/<int:profile_id>/', send_friend_request, name='send-friend-request'),
    path('friends/requests/accept/<int:request_id>/', accept_friend_request, name='accept-friend-request'),
    path('friends/requests/reject/<int:request_id>/', reject_friend_request, name='reject-friend-request'),
    path('friends/list/', friend_list, name='friend-list'),

    # Notifications
    path('notifications/', notification_list, name='notification-list'),
    path('notifications/<int:notification_id>/read/', mark_notification_as_read, name='mark-notification-read'),

    # Likes
    path('posts/<int:post_id>/like/', post_like, name='post-like'),
]