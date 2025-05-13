from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Room, Message, Call


@login_required
def room(request, room_name):
    # Получаем комнату или создаём, если её нет
    room, created = Room.objects.get_or_create(
        slug=room_name,
        defaults={"name": room_name.replace("-", " ").title()}
    )

    return render(request, "videochat/room.html", {"room": room})


@login_required
def start_call(request, room_name, receiver_id):
    room = get_object_or_404(Room, slug=room_name)
    receiver = get_object_or_404(User, id=receiver_id)

    call = Call.objects.create(
        caller=request.user,
        receiver=receiver,
        room=room
    )

    return render(request, 'videochat/call.html', {
        'room': room,
        'call': call,
        'receiver': receiver,
    })