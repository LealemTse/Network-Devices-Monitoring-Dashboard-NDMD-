import logging 
from datetime import datetime,timezone

logging.basicConfig(
    filename='monitoring.log',  #log to a file for now
    level=logging.INFO,
    format='%(asctime)s|%(levelname)s|%(message)s'
)

def log_status_change(device_name,status,latency=None,last_checked=None):
    """
    Logs a device status change.
    
    Currently logs to a file.
    Ready for future DB logging (Sequelize or Redis).
    
    Args:
        device_name (str): Human-readable device name
        status (str): Status like "ONLINE", "OFFLINE", "UNSTABLE"
        latency (float, optional): Ping latency in seconds
        last_checked (float|int|datetime, optional): Timestamp of the check
    """

    if last_checked is None:
        last_checked=datetime.now(timezone.utc)
    elif isinstance(last_checked,(float,int)):
        last_checked=datetime.fromtimestamp(last_checked,tz=timezone.utc)

    #message
    message=f"{device_name} is now {status}"
    if latency is not None:
        message +=f" with latency {latency*1000:.0f}ms"
    message+=f" at {last_checked.isoformat()}"

    logging.info(message)

    #Placeholder for Database logging

    # db.insert_status_change(
    #     device_name=device_name,
    #     status=status,
    #     latency_ms=latency*1000 if latency else None,
    #     last_checked_iso=last_checked.isoformat()
    # )