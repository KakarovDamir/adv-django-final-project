from django.contrib.auth.models import User
from ai.models import VideoPrompt
from .models import Comment, Profile
from rest_framework import serializers
from .models import Post, Notification, FriendRequest, User
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

class VideoPromptSerializer(serializers.ModelSerializer):
    class Meta:
        ref_name = "SocialNetwork_VideoPrompt"
        model = VideoPrompt
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'email': {'required': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'content', 'created_at', 'author', 'post']
        read_only_fields = ['author', 'created_at', 'post']

    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'avatar': obj.author.profile.avatar.url if obj.author.profile.avatar else None
        }


class PostSerializer(serializers.ModelSerializer):
    author = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    total_likes = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'image',
            'created_at', 'updated_at', 'author',
            'total_likes', 'is_liked', 'comments_count', 'comments'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'avatar': obj.author.profile.avatar.url if obj.author.profile.avatar else None
        }

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_comments_count(self, obj):
        return obj.comments.count()

    def update(self, instance, validated_data):
        # Проверка прав при обновлении
        if self.context['request'].user != instance.author:
            raise serializers.ValidationError("You are not the author of this post")
        return super().update(instance, validated_data)


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['title', 'content', 'image']


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.CharField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    friends_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    is_friend = serializers.SerializerMethodField()
    id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id',
            'username', 'email', 'first_name', 'last_name',
            'bio', 'avatar', 'birth_date', 'friends_count',
            'posts_count', 'is_friend'
        ]
        read_only_fields = ['id', 'username', 'email', 'friends_count', 'posts_count']

    def get_friends_count(self, obj):
        return obj.friends.count()

    def get_posts_count(self, obj):
        return obj.user.posts.count()

    def get_is_friend(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj in request.user.profile.friends.all()
        return False

class ProfileUpdateSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.CharField(source='user.email', required=False)

    class Meta:
        model = Profile
        fields = [
            'bio', 'avatar', 'birth_date',
            'first_name', 'last_name', 'email'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update user fields
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = serializers.SerializerMethodField()
    to_user = serializers.SerializerMethodField()

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_from_user(self, obj):
        return {
            'id': obj.from_user.id,
            'username': obj.from_user.username,
            'avatar': obj.from_user.profile.avatar.url if obj.from_user.profile.avatar else None
        }

    def get_to_user(self, obj):
        return {
            'id': obj.to_user.id,
            'username': obj.to_user.username,
            'avatar': obj.to_user.profile.avatar.url if obj.to_user.profile.avatar else None
        }

class FriendSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['user']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'avatar': obj.avatar.url if obj.avatar else None,
            'bio': obj.bio
        }

class NotificationSerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'verb', 'target', 'timestamp', 'read']
        read_only_fields = ['id', 'timestamp']

    def get_actor(self, obj):
        if obj.actor:
            return {
                'id': obj.actor.id,
                'username': obj.actor.username,
                'avatar': obj.actor.profile.avatar.url if obj.actor.profile.avatar else None
            }
        return None

    def get_target(self, obj):
        if obj.target:
            if hasattr(obj.target, 'get_absolute_url'):
                return {
                    'type': obj.target.__class__.__name__.lower(),
                    'id': obj.target.id,
                    'url': obj.target.get_absolute_url()
                }
            return str(obj.target)
        return None


class LikeSerializer(serializers.Serializer):
    post_id = serializers.IntegerField()
    liked = serializers.BooleanField()
    total_likes = serializers.IntegerField()

    def validate_post_id(self, value):
        try:
            Post.objects.get(pk=value)
        except Post.DoesNotExist:
            raise serializers.ValidationError("Post does not exist")
        return value