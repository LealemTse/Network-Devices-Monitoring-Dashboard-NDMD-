from flask import Flask, jsonify, request

app = Flask(__name__)

# Mock device list
devices = [
    {"deviceId": 1, "name": "Google DNS", "ipAddress": "8.8.8.8"},
    {"deviceId": 2, "name": "Local Server", "ipAddress": "192.168.50.80"},
]

# Mock config
config = {"ping_interval": 5}

# Endpoints
@app.route("/api/devices", methods=["GET"])
def get_devices():
    return jsonify(devices)

@app.route("/api/config", methods=["GET"])
def get_config():
    return jsonify(config)

@app.route("/api/device-status", methods=["POST"])
def post_status():
    data = request.json
    print("Received status update:", data)
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(port=5000)
