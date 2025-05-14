from django.contrib.auth import authenticate, get_user_model, login, logout
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework import status
from rest_framework.authentication import (SessionAuthentication,
                                           TokenAuthentication)
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import FriendRequest, Notification, Post, Profile
from .serializers import (CommentSerializer, FriendRequestSerializer,
                          NotificationSerializer, PostSerializer,
                          ProfileSerializer, ProfileUpdateSerializer,
                          RegisterSerializer, UserSerializer)
from django.contrib.auth.models import User

@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({'message': 'CSRF cookie set'})

@csrf_protect
@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Login successful',
        }, status=status.HTTP_200_OK)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def api_logout(request):
    logout(request)
    return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user = authenticate(
            username=serializer.data['username'],
            password=request.data['password']
        )
        if user:
            login(request, user)
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Registration successful'
            }, status=status.HTTP_201_CREATED)
    return Response({
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def post_list_create(request):
    if request.method == 'GET':
        posts = Post.objects.all().order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)


    elif request.method == 'POST':
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def post_detail(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        if post.author != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        serializer = PostSerializer(post, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if post.author != request.user:
            return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def comment_list_create(request, post_id):
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def profile_detail(request, username):
    try:
        # Исправляем: ищем User, а не Profile
        user = get_user_model().objects.get(username__iexact=username)
        profile = user.profile
        
        # Используем сериализатор вместо ручного формирования ответа
        serializer = ProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)
        
    except get_user_model().DoesNotExist:  # Изменяем тип исключения
        return Response(
            {'error': f'User "{username}" not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Profile.DoesNotExist:  # Добавляем проверку на отсутствие профиля
        return Response(
            {'error': 'Profile not found for user'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def profile_update(request):
    profile = request.user.profile
    serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def profile_delete(request):
    user = request.user
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request, user_id):
    to_user = get_object_or_404(get_user_model(), pk=user_id)

    if request.user == to_user:
        return Response({'error': 'Cannot send request to yourself'}, status=status.HTTP_400_BAD_REQUEST)

    if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
        return Response({'error': 'Request already sent'}, status=status.HTTP_400_BAD_REQUEST)

    friend_request = FriendRequest.objects.create(
        from_user=request.user,
        to_user=to_user
    )
    serializer = FriendRequestSerializer(friend_request)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_friend(request, profile_id):
    other_profile = get_object_or_404(Profile, pk=profile_id)
    current_profile = request.user.profile

    if other_profile not in current_profile.friends.all():
        return Response({'error': 'This user is not in your friends list'}, status=status.HTTP_400_BAD_REQUEST)

    current_profile.friends.remove(other_profile)
    other_profile.friends.remove(current_profile)

    return Response({'message': 'Friend removed successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request, request_id):
    friend_request = get_object_or_404(
        FriendRequest,
        pk=request_id,
        to_user=request.user
    )

    request.user.profile.friends.add(friend_request.from_user.profile)
    friend_request.from_user.profile.friends.add(request.user.profile)
    friend_request.delete()

    return Response({'message': 'Friend request accepted'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_friend_request(request, request_id):
    friend_request = get_object_or_404(
        FriendRequest,
        pk=request_id,
        to_user=request.user
    )
    friend_request.delete()
    return Response({'message': 'Friend request rejected'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friend_list(request):
    """List friends and handle search queries"""
    search_query = request.GET.get('search', '')
    
    if search_query:
        # Search for users by username or bio
        users = Profile.objects.filter(
            Q(user__username__icontains=search_query) |
            Q(bio__icontains=search_query)
        ).exclude(user=request.user)
        
        # Add is_friend status to each user
        for user in users:
            user.is_friend = user in request.user.profile.friends.all()
            
        serializer = ProfileSerializer(users, many=True, context={'request': request})
        return Response({'users': serializer.data})
    else:
        # Return just the friends list
        friends = request.user.profile.friends.all()
        serializer = ProfileSerializer(friends, many=True, context={'request': request})
        return Response({'users': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    notifications = request.user.notifications.filter(read=False)
    serializer = NotificationSerializer(notifications, many=True)
    return Response({'notifications': serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_as_read(request, notification_id):
    notification = get_object_or_404(
        Notification,
        pk=notification_id,
        recipient=request.user
    )
    notification.read = True
    notification.save()
    return Response({'message': 'Notification marked as read'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_like(request, post_id):
    post = get_object_or_404(Post, pk=post_id)
    if post.likes.filter(id=request.user.id).exists():
        post.likes.remove(request.user)
        return Response({'liked': False, 'count': post.total_likes()})
    else:
        post.likes.add(request.user)
        return Response({'liked': True, 'count': post.total_likes()})

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def post_update(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if post.author != request.user:
        return Response({"error": "You are not the author"}, status=403)
    
    serializer = PostSerializer(
        post, 
        data=request.data, 
        partial=request.method == 'PATCH',
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def post_delete(request, pk):
    post = get_object_or_404(Post, pk=pk)
    if post.author != request.user:
        return Response({"error": "You are not the author"}, status=403)
    
    post.delete()
    return Response(status=204)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friend_request_list(request):
    """List all friend requests for the current user"""
    received_requests = FriendRequest.objects.filter(to_user=request.user)
    sent_requests = FriendRequest.objects.filter(from_user=request.user)
    
    received_serializer = FriendRequestSerializer(received_requests, many=True)
    sent_serializer = FriendRequestSerializer(sent_requests, many=True)
    
    return Response({
        'received': received_serializer.data,
        'sent': sent_serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """Search for users by username or bio"""
    query = request.GET.get('search', '')
    if not query:
        return Response({'users': []})
        
    users = Profile.objects.filter(
        Q(user__username__icontains=query) |
        Q(bio__icontains=query)
    ).exclude(user=request.user)
    
    serializer = ProfileSerializer(users, many=True, context={'request': request})
    return Response({'users': serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_posts(request, username):
    user = get_object_or_404(User, username=username)
    posts = Post.objects.filter(author=user).order_by('-created_at')
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_friends(request, username):
    user = get_object_or_404(User, username=username)
    friends = user.profile.friends.all()
    serializer = ProfileSerializer(friends, many=True, context={'request': request})
    return Response(serializer.data)