import os
import sys
import django
import logging

# Добавляем родительскую папку, чтобы Python видел videochat и другие модули
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import videochat.routing  # ✅ теперь работает, потому что sys.path.append настроен

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cartoonix.settings')
django.setup()

async def error_app(scope, receive, send):
    logging.error(f"🚨 No match for scope type: {scope['type']} path: {scope.get('path')}")
    raise ValueError(f"No route found for scope type: {scope['type']} path: {scope.get('path')}")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            videochat.routing.websocket_urlpatterns
        )
    ),
})
