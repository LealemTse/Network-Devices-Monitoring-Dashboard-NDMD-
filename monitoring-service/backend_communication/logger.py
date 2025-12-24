import logging

# Configure a simple logger
logging.basicConfig(
    filename='monitoring.log',
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)

def log_status_change(device_name, status, latency=None):
    message = f"{device_name} is now {status}"
    if latency is not None:
        message += f" with latency {latency*1000:.0f}ms"
    logging.info(message)