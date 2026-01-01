import time
from monitoring.device_monitor import DeviceMonitor
from backend_communication.api_client import fetch_devices, send_status_update
from db_communication.logger import log_status_change
from config.settings import PING_INTERVAL_CONFIG

def start_scheduler():
    print("Monitoring scheduler started...")

    # Keep devices persistent to maintain ping history
    devices_dict = {}

    while True:
        interval = PING_INTERVAL_CONFIG.get_value()
        print(f"Refresh interval: {interval} seconds")

        try:
            device_data_list = fetch_devices()
            if not device_data_list:
                print("No devices from the backend.")
            else:
                # Create new DeviceMonitor objects if not already in dict
                for d in device_data_list:
                    device_id = d["deviceId"]
                    if device_id not in devices_dict:
                        devices_dict[device_id] = DeviceMonitor(
                            device_id=device_id,
                            ip_address=d["ipAddress"],
                            name=d.get("name", "Unknown")
                        )

                # Check all devices
                for device in devices_dict.values():
                    try:
                        result = device.check_device()
                        if result:
                            # Send result  to backend
                            send_status_update(result)

                            # Log status change (file + future DB)
                            log_status_change(
                                device_name=result["name"],
                                status=result["status"],
                                latency=result["latency_ms"]/1000 if result["latency_ms"] else None,
                                last_checked=device.last_checked
                            )

                    except Exception as e:
                        print(f"Device check failed (ID={device.device_id}, IP={device.ip_address}): {e}")

        except Exception as e:
            print(f"Scheduler error: {e}")

        print(f"Waiting {interval} seconds before next cycle...\n")
        time.sleep(interval)


if __name__ == "__main__":
    start_scheduler()
