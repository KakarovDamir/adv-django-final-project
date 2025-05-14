from django.urls import path
from .views import get_or_create_room, start_call

urlpatterns = [
    path('room/<slug:room_name>/', get_or_create_room),
    path('start-call/<slug:room_name>/<int:receiver_id>/', start_call),
]
