from monitoring.device_monitor import DeviceMonitor

# Test a single device
device = DeviceMonitor(device_id=1, ip_address="8.8.8.8", name="Google DNS")

print("\n=== DeviceMonitor Test ===")
result = device.check_device()  # Ping the device
print("Check device result:", result)
print("Summary:", device.get_summary())
