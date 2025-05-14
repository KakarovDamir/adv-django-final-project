from rest_framework import permissions
from django.contrib.auth.models import Group


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        if hasattr(obj, 'author'):
            return obj.author == request.user

        elif hasattr(obj, 'user'):
            return obj.user == request.user
        return False

class IsModeratorUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.groups.filter(name='Moderator').exists()

class CanEditOrDeletePost(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.author == request.user:
            return True

        is_moderator = request.user.groups.filter(name='Moderator').exists()
        if is_moderator:
            return True
        
        return False

class CanManageComment(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        is_moderator = request.user.groups.filter(name='Moderator').exists()
        return obj.author == request.user or obj.post.author == request.user or is_moderator