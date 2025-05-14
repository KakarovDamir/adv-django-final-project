from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ChatRoom, Message, CallSession
from .serializers import ChatRoomSerializer, MessageSerializer, CallSessionSerializer
from django.contrib.auth import get_user_model
from rest_framework import status

User = get_user_model()

class ChatRoomViewSet(viewsets.ModelViewSet):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        room = serializer.save()
        room.participants.add(self.request.user)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        room = self.get_object()
        messages = room.messages.all().order_by('timestamp')
        return Response(MessageSerializer(messages, many=True).data)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)


class CallSessionViewSet(viewsets.ModelViewSet):
    queryset = CallSession.objects.all()
    serializer_class = CallSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CallSession.objects.filter(caller=user) | CallSession.objects.filter(callee=user)

    def create(self, request, *args, **kwargs):
        caller = request.user
        callee_id = request.data.get('callee_id')

        if not callee_id:
            return Response({"error": "callee_id required"}, status=status.HTTP_400_BAD_REQUEST)

        callee = User.objects.get(id=callee_id)

        session = CallSession.objects.create(
            caller=caller,
            callee=callee,
            room_id=f"{caller.id}_{callee.id}"
        )

        serializer = self.get_serializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def end(self, request, pk=None):
        call = self.get_object()
        call.is_active = False
        call.save()
        return Response({"status": "ended"})