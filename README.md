# Network Devices Monitoring Dashboard (NDMD)

A comprehensive monitoring solution for network devices, providing real-time status updates, logging, and system configuration capabilities.

## 🚀 Features

- **Real-time Monitoring**: Automatically pings configured devices to check their status (Online/Offline/Unstable).
- **Dashboard**: A user-friendly web interface to view device statistics and logs.
- **Device Management**: Add, remove, and update network devices to be monitored.
- **Detailed Logs**: View historical performance data and system events.
- **Authentication**: Secure login system with recovery security questions.
- **Role-Based Access**: Capabilities for different user roles (configured in backend).
- **Theme Support**: Dark and Light mode support for the dashboard.

## 🏗️ Architecture

The system consists of three main components:

1.  **Frontend**: A web-based user interface (HTML/CSS/JS) served by Node.js.
2.  **Backend**: A Node.js/Express REST API that handles user authentication, device management, and data retrieval.
3.  **Monitoring Service**: A Python-based service that runs in the background, continuously checking the status of network devices via ICMP (ping) and updating the database/Redis.
4.  **Database**: MySQL for persistent storage and Redis for caching/real-time status updates.

## 📋 Prerequisites

Ensure you have the following installed on your system:

-   **Linux Machine**

# Deployment Guide


## Installation

1.  Clone the repository.
2.  Run the deployment script:
    ```bash
    ./deployment/deploy.sh
    ```
    This will:
    -   Install Node.js, MySQL, Redis, Python3.
    -   Set up the Database and Admin User.
    -   Set up the Python Monitoring Service (venv & dependencies).

## Starting the System

Run the start script from the root directory:

```bash
./start.sh
```

## Troubleshooting

-   **Site Unreachable?** Check if your firewall is blocking port 3000.
-   **Monitoring Service not starting?** Check `monitoring.log`. Ensure `deploy.sh` completed successfully to install Python dependencies.

## 🚀 Usage

The easiest way to start the entire system is using the provided start script.

### Start All Services

Run the startup script from the root directory:

```bash
./start.sh
```

This script will:
-   Start the Redis server.
-   Start the Backend API (Port 5000).
-   Start the Frontend Server (Port 3000).
-   Start the Python Monitoring Service.

### Accessing the Dashboard

Once started, open your browser and navigate to:

**`http://localhost:3000/login.html`** (or your machine's IP address)

### Default Credentials

If you ran the seed script, the default login is:

-   **Username**: `admin`
-   **Password**: `password@123#`

## 📂 Project Structure

-   `backend/`: Node.js Express API and Frontend static files (`public/`).
-   `monitoring-service/`: Python scripts for polling devices.
-   `deployment/`: Deployment scripts.
-   `database/`: Database configs/scripts.
-   `start.sh`: Master startup script.

## 🛑 Stopping the System

Press `Ctrl+C` in the terminal where `./start.sh` is running. The script is designed to trap the exit signal and clean up all background processes (Backend, Frontend, Monitoring Service).
