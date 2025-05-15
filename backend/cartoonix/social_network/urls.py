# urls.py
from django.urls import path

from .views import (accept_friend_request, api_login, api_logout, api_register,
                    comment_list_create, current_user, friend_list,
                    friend_request_list, get_csrf, mark_notification_as_read,
                    notification_list, post_delete, post_detail, post_like,
                    post_list_create, post_update, profile_delete,
                    profile_detail, profile_update, reject_friend_request,
                    remove_friend, search_users, send_friend_request,
                    user_friends, user_posts)

urlpatterns = [
    # Auth
    path('auth/current_user/', current_user, name='current-user'),
    path('auth/login/', api_login),
    path('auth/csrf/', get_csrf, name='csrf-token'),
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
    path('friends/', friend_list, name='friend-list'),
    path('friends/requests/', friend_request_list, name='friend-request-list'),
    path('friends/requests/send/<int:user_id>/', send_friend_request, name='send-friend-request'),
    path('friends/requests/accept/<int:request_id>/', accept_friend_request, name='accept-friend-request'),
    path('friends/requests/reject/<int:request_id>/', reject_friend_request, name='reject-friend-request'),
    path('friends/remove/<int:profile_id>/', remove_friend, name='remove_friend'),

    # Notifications
    path('notifications/', notification_list, name='notification-list'),
    path('notifications/<int:notification_id>/read/', mark_notification_as_read, name='mark-notification-read'),

    # Likes
    path('posts/<int:post_id>/like/', post_like, name='post-like'),

    # User specific
    path('users/<str:username>/posts/', user_posts, name='user-posts'),
    path('users/<str:username>/friends/', user_friends, name='user-friends'),
]