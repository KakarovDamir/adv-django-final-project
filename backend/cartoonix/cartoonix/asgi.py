import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cartoonix.settings')
django.setup()  # ✅ это должно идти ДО других импортов

import videochat.routing  # ✅ после setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            videochat.routing.websocket_urlpatterns
        )
    ),
})
