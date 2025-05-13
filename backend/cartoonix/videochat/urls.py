from django.urls import path
from videochat import views

urlpatterns = [
    path('<str:room_name>/', views.room, name='room'),
    path('<str:room_name>/<int:receiver_id>/', views.start_call, name='start_call'),
]