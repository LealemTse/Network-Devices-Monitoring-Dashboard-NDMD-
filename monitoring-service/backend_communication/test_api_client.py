from backend_communication.api_client import fetch_devices, send_status_update

print("\n=== API Client Test ===")

# Fetch devices from backend
devices = fetch_devices()
print("Fetched devices:", devices)

# Send a test status update
status_payload = {
    "device_id": 1,
    "name": "Test Device",
    "ip_address": "127.0.0.1",
    "status": "ONLINE",
    "latency_ms": 10,
    "last_checked": "2025-12-23T14:00:00",
    "ping_history": [0.01, 0.012]
}
send_status_update(status_payload)
print("Sent status update. Check mock_backend console for received data.")
