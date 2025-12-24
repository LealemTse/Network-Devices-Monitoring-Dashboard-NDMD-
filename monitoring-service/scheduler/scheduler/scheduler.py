import time
from monitoring.device_monitor import DeviceMonitor
from backend_communication.api_client import (send_status_to_backend,fetch_devices, fetch_refresh_interval,send_status_update)
from config.settings import PING_INTERVAL_CONFIG

def start_scheduler():
    print("Monitoring scheduler started...")
    while True:
        try:
            device_data_list=fetch_devices()
            devices=[]
            for d in device_data_list:
                devices.append(
                    DeviceMonitor(device_id=d["deviceId"],ip_address=d["ipAddress"],name=d["name"])
                )

            interval = PING_INTERVAL_CONFIG.get_value()  # read from config
            print(f"Refresh interval:{interval} seconds")

            for device in devices: 
                try: 
                    result=device.check_device()
                    if result:
                        send_status_update(result)  
                except Exception as e:
                    print(f"Scheduler error:{e}")
        except Exception as e:
            print(f"Scheduler error:{e}")

        print(f"Waiting {interval} seconds before next cycle...\n")
        time.sleep(interval)
      
if __name__ == "__main__":
    start_scheduler()
