#!/bin/bash
GREEN="\033[32m"
RESET="\033[0m"

echo "Starting Redis..."
sudo systemctl start redis-server

echo "Starting Backend API (Port 5000)..."
cd backend
nohup node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "Backend running (PID: $BACKEND_PID)"
cd ..

echo "Starting Frontend Server (Port 3000)..."
cd backend
nohup node frontend-server.js > ../frontend.log 2>&1 &
FRONT_PID=$!
cd ..
echo -e "Frontend running (PID: $FRONT_PID)"

# Wait for backend to be ready before starting monitoring
sleep 2

echo "Starting Monitoring Service..."
cd monitoring-service
# Use the virtual environment python
nohup ./venv/bin/python3 main.py > ../monitoring.log 2>&1 &
MONITOR_PID=$!
cd ..
echo -e "Monitoring service running (PID: $MONITOR_PID)"

IP=$(hostname -I | awk '{print $1}')
echo -e "\n${GREEN}Access Login via Frontend: http://$IP:3000/login.html${RESET}"
echo "Backend API is at: http://$IP:5000"
echo "Logs are in backend.log, frontend.log, and monitoring.log"
echo "To stop services: kill $BACKEND_PID $FRONT_PID $MONITOR_PID"
