from config.settings import PING_INTERVAL_CONFIG

print("\n=== Configuration Test ===")
interval = PING_INTERVAL_CONFIG.get_value()  # Fetch from backend
print(f"Refresh interval from backend: {interval}")

# Try setting an invalid value
PING_INTERVAL_CONFIG.set_value(100)  # Should warn
print(f"Current config value: {PING_INTERVAL_CONFIG.get_value()}")
