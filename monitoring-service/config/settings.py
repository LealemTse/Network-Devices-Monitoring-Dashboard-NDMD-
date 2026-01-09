# config/settings.py
import requests    #python library to make HTTP calls 
import logging

class Configuration:
    def __init__(self, config_key="ping_interval", default_value=5, min_value=1, max_value=60, backend_url=None):
        self.config_key=config_key
        self.config_value = default_value
        self.min_value = min_value
        self.max_value = max_value
        self.backend_url = backend_url  # URL to fetch config from backend

    def get_value(self):
        """Return current value. Also fetches the config_value from backend if URL is provided."""
        if self.backend_url:   # if backend_url is provided  attempt a network request
            try:
                #get request to backend, timeout after 2 seconds
                resp = requests.get(self.backend_url, timeout=2)

                #throws error if HTTP response is not 200 OK
                resp.raise_for_status()

                #Parse JSON response
                data = resp.json()
                
                #gets config_key from JSON, use current config value (Example backend JSON: {"ping_interval": 10} → will extract 10.)
                value = data.get(self.config_key, self.config_value)

                # Ensure backend value is within allowed range by calling set_value()
                self.set_value(value)
           
           #handles network fails, backend down or JSON invalid
            except Exception as e:   
                logging.warning(f"Warning: Failed to fetch config from backend: {e}")
        return self.config_value
   
    
    def set_value(self,value):
        #set config value if it is within the allowed range
        if self.validate_range(value):
            self.config_value=value 
        else:
            print(f"Warning: {value} out of allowed range [{self.min_value},{self.max_value}].")

    def validate_range(self,value=None):
        #return true if value is within the ranges
        v=value if value is not None else self.config_value
        return self.min_value <=v<=self.max_value

# Backend endpoint returning JSON like: {"ping_interval": 10}
PING_INTERVAL_CONFIG = Configuration(config_key="ping_interval", default_value=5, min_value=1, max_value=60,
                                     backend_url="http://localhost:5000/api/configs")
