from rest_framework import serializers
from .models import Room, Call


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'slug', 'name']


class CallSerializer(serializers.ModelSerializer):
    room = RoomSerializer()
    caller = serializers.StringRelatedField()
    receiver = serializers.StringRelatedField()

    class Meta:
        model = Call
        fields = ['id', 'caller', 'receiver', 'room', 'created_at']
