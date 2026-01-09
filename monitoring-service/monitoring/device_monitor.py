from .ping_service import ping_device
from .status_classifier import classify_status
from datetime import datetime,timezone

# CLASS: DeviceMonitor 

class DeviceMonitor:
    """
    A smart tracker for a single network device.

    This is the Class that:
    1. tracks ping history (last 5 results)
    2. Determines current status
    3. Provides data for scheduler and backend
    """

    def __init__(self, device_id, ip_address, name="Unknown"):
        """
        Create a new device monitor.

        Args:
        device_id: Unique ID from database
        ip_address: Device IP to monitor
        name: Human-readable name
        """
        self.device_id = device_id
        self.ip_address = ip_address
        self.name = name
        self.ping_history = [] #it will store the last 5 ping result
        self.status = "OFFLINE" # current status
        self.last_checked = datetime.now(timezone.utc) #when we last pinged

    def check_device(self):
        """ 
        Perform a complete monitoring check on this device.

        steps:
        1. Pings the device using ping_device()
        2. Update ping history (keep only last 5)
        3. Determine new status using classify_status()
        4. Return all data as a dictionary

        Returns:
            dict: Complete device information for backend
        """

        print(f"\n Checking {self.name} ({self.ip_address})...")

        # STEP 1: Ping device
        latency = ping_device(self.ip_address)

        #STEP 2: Update history
        self.ping_history.append(latency)
        if len (self.ping_history) > 5:
            self.ping_history.pop(0) # remove oldest

        #STEP 3: Determine status
        self.status = classify_status(self.ping_history)
        self.last_checked = datetime.now(timezone.utc)

        #STEP 4: Prepare data for backend 
        result = {
            "device_id": self.device_id,
            "name": self.name,
            "ip_address": self.ip_address,
            "status": self.status,
            "latency_ms": round(latency * 1000, 2) if latency else None,
            "last_checked": self.last_checked.isoformat(),
            "ping_history": self.ping_history.copy()
        }

        # shows what happened
        status_symbol = "✅" if self.status == "ONLINE" else "⚠️" if self.status == "UNSTABLE" else "❌"
        print(f" {status_symbol} status: {self.status}")
        if latency:
            print(f" Latency: {result['latency_ms']} ms")
            
        return result
    
    def get_summary(self):
        """Get a one-line summary of this device's status."""
        latency_str = "N/A"
        if self.ping_history and self.ping_history[-1] is not None:
            latency_str = f"{self.ping_history[-1]*1000:.0f}ms"
        return f"{self.name:20} | {self.ip_address:15} | {self.status:8} | {latency_str:>8}"
