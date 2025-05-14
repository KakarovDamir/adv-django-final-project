import socket
import sys
import time

HOST = 'localhost'
PORT = 8000
RETRIES = 10
DELAY = 5

for i in range(RETRIES):
    try:
        with socket.create_connection((HOST, PORT), timeout=2):
            sys.exit(0)
    except (socket.timeout, ConnectionRefusedError):
        if i < RETRIES - 1:
            time.sleep(DELAY)
        else:
            sys.exit(1)
