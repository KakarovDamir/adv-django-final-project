import os

import django

# Set up Django settings before importing specific Django modules
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cartoonix.settings')
django.setup()  # This must come before other imports

import videochat.routing  # Must be imported after Django setup
from channels.auth import AuthMiddlewareStack
# Now import specific Django modules
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                videochat.routing.websocket_urlpatterns
            )
        )
    ),
})
