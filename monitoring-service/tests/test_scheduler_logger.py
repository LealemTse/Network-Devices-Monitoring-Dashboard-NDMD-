# tests/test_scheduler_logger.py

import time
from unittest.mock import patch
from backend_communication.logger import log_status_change
from monitoring.device_monitor import DeviceMonitor
import mock_backend  # your mock_backend.py

# Patch requests in api_client to use Flask test client
import requests
from backend_communication import api_client

# 1️⃣ Set up a Flask test client
client = mock_backend.app.test_client()

# Patch the API client to redirect HTTP calls to the test client
def mock_fetch_devices():
    resp = client.get("/api/devices")
    return resp.get_json()

def mock_fetch_refresh_interval():
    resp = client.get("/api/config")
    return resp.get_json()["ping_interval"]

def mock_send_status_update(payload):
    resp = client.post("/api/device-status", json=payload)
    print("Mock backend received status:", payload)
    return resp.get_json()

# 2️⃣ Mock DeviceMonitor to avoid real ping calls
class MockDeviceMonitor(DeviceMonitor):
    def check_device(self):
        # Simulate device always ONLINE with low latency
        status = "ONLINE"
        latency = 0.01  # 10ms
        log_status_change(self.name, status, latency)
        return {
            "device_id": self.device_id,
            "name": self.name,
            "ip_address": self.ip_address,
            "status": status,
            "latency_ms": latency * 1000,
            "last_checked": time.time(),
            "ping_history": [latency]
        }

# 3️⃣ Simple scheduler function for testing
def start_scheduler_for_test(cycles=2):
    # Patch api_client functions
    api_client.fetch_devices = mock_fetch_devices
    api_client.fetch_refresh_interval = mock_fetch_refresh_interval
    api_client.send_status_update = mock_send_status_update

    # Fetch devices
    device_data_list = api_client.fetch_devices()
    devices = [MockDeviceMonitor(d["deviceId"], d["ipAddress"], d["name"]) for d in device_data_list]

    for cycle in range(cycles):
        print(f"\n--- Cycle {cycle+1} ---")
        for device in devices:
            result = device.check_device()
            api_client.send_status_update(result)
        interval = api_client.fetch_refresh_interval()
        print(f"Waiting {interval} seconds before next cycle...\n")
        time.sleep(0.5)  # short sleep for testing

# 4️⃣ Run the test
if __name__ == "__main__":
    print("Running scheduler + logger test with mock backend...")
    start_scheduler_for_test(cycles=3)
    print("Test completed.")
