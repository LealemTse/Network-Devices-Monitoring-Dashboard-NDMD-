import time   #used for time.sleep() to pause between monitoring cycles
from monitoring.device_monitor import DeviceMonitor
from backend_communication import fetch_devices, send_status_update 
from config.settings import PING_INTERVAL_CONFIG
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    filename='monitoring_service.log',
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

class MonitoringService:
    def __init__(self,timeout=2):
        self._timeout=max(1,timeout) 
        self._running=False
        self._devices={} #list that will store DeviceMonitor objects

    def start(self,cycles=None):
        #Start monitoring loop. If cycles is set, only run that many times (for testing)
        self._running= True   
        run_count=0    #counter for how many cycles we've done
        try:
            while self._running:
                try:
                    device_data_list=fetch_devices()  #gets a list of devices from the backend
                    
                except Exception as e:
                    print(f"Error fetching device: {e}")
                    device_data_list=[]

                # Create or update DeviceMonitor objects
                for d in device_data_list:   #for each device in device list
                    device_id=d["deviceId"]

                    if device_id not in self._devices:
                        self._devices[device_id] = DeviceMonitor(
                            device_id=device_id,
                            ip_address=d["ipAddress"],
                            name=d["name"]
                        )

                    else:
                        # Update existing device info if changed
                        self._devices[device_id].ip_address = d["ipAddress"]
                        self._devices[device_id].name = d["name"]
                

                #Ping all devices and send updates
                for device in self._devices.values():  #the self._devices created earlier holds deviceMonitor objects line 20
                    try:
                        result=device.check_device()
                        if result:
                            send_status_update(result)  #this sends the device status to the backend
                            
                            # Log to file
                            log_msg = f"Device: {result['name']} ({result['ip_address']}) | Status: {result['status']} | Latency: {result['latency_ms']}ms"
                            logging.info(log_msg)
                            print(f"Logged: {log_msg}")

                    except Exception as e:
                        print(f"Error monitoring device {device.name}: {e}")  #one device failing doesnot cause the loop to crash

                interval=PING_INTERVAL_CONFIG.get_value()  #this reads the refresh interval from the config or backend if provided
                print(f"\nWaiting {interval} seconds before next cycle...\n")    
                time.sleep(interval)  #pauses the loop for interval seconds before the next cycle

                # Stop after N cycles if specified (testing mode)
                if cycles is not None:  #if the cycle is sent
                    run_count+=1        #increment the counter, since its is a counter for how many cycles we are done
                    if run_count>=cycles:
                        self.stop()

        except KeyboardInterrupt:
            # Graceful shutdown on Ctrl+C
            self.stop()

    def stop(self):
        print("Stopping Monitoring Service...")
        self._running = False

