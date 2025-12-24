from ping3 import ping
import time

def ping_device(ip_address):
    """Pings a device and returns response time or None."""
    try:
        response = ping(ip_address, timeout=2)
        if response is None or response is False:
            return None
        return response
    except Exception:
        return None
