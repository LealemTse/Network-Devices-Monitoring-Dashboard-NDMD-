#!/bin/bash
GREEN="\033[32m"
RED="\033[31m"
RESET="\033[0m"

# Function to kill all background processes on exit
cleanup() {
    echo -e "\n${RED}Stopping all services...${RESET}"
    kill $BACKEND_PID $FRONT_PID $MONITOR_PID 2>/dev/null
    exit
}

# Trap Ctrl+C (SIGINT) and call cleanup
trap cleanup SIGINT

# Kill any existing processes to prevent conflicts
echo "Cleaning up ports/processes..."
pkill -f "node server.js" 2>/dev/null
pkill -f "node frontend-server.js" 2>/dev/null
# fuser -k 5000/tcp 3000/tcp >/dev/null 2>&1

echo "Starting Redis..."
sudo systemctl start redis-server

echo "Starting Backend & Frontend (npm start)..."
cd backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "Backend running (PID: $BACKEND_PID)"

echo "Starting Frontend Server (Port 3000)..."
nohup node frontend-server.js > ../frontend.log 2>&1 &
FRONT_PID=$!
echo -e "Frontend running (PID: $FRONT_PID)"
cd ..

# Wait for backend to initialize
sleep 5

echo "Starting Monitoring Service..."
cd monitoring-service
# Activate venv and run
source venv/bin/activate
python3 main.py > ../monitoring.log 2>&1 &
MONITOR_PID=$!
cd ..
echo -e "Monitoring service running (PID: $MONITOR_PID)"

IP=$(hostname -I | awk '{print $1}')
echo -e "\n${GREEN}Access Login via Frontend: http://$IP:3000/login.html${RESET}"
echo "Backend API is at: http://$IP:5000"
echo "Services are running in background. Press Ctrl+C to stop."
echo "Logs: backend.log, monitoring.log"

# Wait indefinitely, so the script doesn't exit (keeping trap active)
wait
