from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Room, Call
from .serializers import RoomSerializer, CallSerializer  # добавим ниже
from django.contrib.auth import get_user_model


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_or_create_room(request, room_name):
    room, created = Room.objects.get_or_create(
        slug=room_name,
        defaults={"name": room_name.replace("-", " ").title()}
    )
    serializer = RoomSerializer(room)
    return Response(serializer.data)

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_call(request, room_name, receiver_id):
    room = get_object_or_404(Room, slug=room_name)
    receiver = get_object_or_404(User, id=receiver_id)

    call = Call.objects.create(
        caller=request.user,
        receiver=receiver,
        room=room
    )
    serializer = CallSerializer(call)
    return Response(serializer.data)

