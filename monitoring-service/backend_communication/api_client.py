import requests

BACKEND_BASE_URL = "http://localhost:5000/api"

def fetch_devices(): #Get list of devices from backend
    response = requests.get(f"{BACKEND_BASE_URL}/monitoring/all-devices")
    response.raise_for_status()
    return response.json().get("devices", [])

def fetch_refresh_interval(): #get current refresh interval from backend
    response = requests.get(f"{BACKEND_BASE_URL}/config/refresh-interval")
    response.raise_for_status()
    return response.json()["interval"]

def send_status_update(status_payload): #send device status data to backend
    requests.post(f"{BACKEND_BASE_URL}/monitoring/monitoring-update", json=status_payload)
