from monitoring.monitoring_service import MonitoringService

if __name__=="__main__":
    service=MonitoringService()
    try:
        service.start(cycles=3)
    except KeyboardInterrupt:
        service.stop()
        print("Monitoring stopped by user.")
    
    