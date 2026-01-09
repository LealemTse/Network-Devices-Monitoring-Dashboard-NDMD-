from monitoring.monitoring_service import MonitoringService

if __name__=="__main__":
    service=MonitoringService()
    try:
        # Run continuously (cycles=None means infinite loop)
        service.start(cycles=None)
    except KeyboardInterrupt:
        service.stop()
        print("Monitoring stopped by user.")
    
    