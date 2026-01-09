#!/bin/bash
GREEN="\033[32m"
RESET="\033[0m"

echo "Starting Redis..."
sudo systemctl start redis-server

echo "Starting Backend (Serving Static Frontend)..."
cd backend
# Use nohup to keep running after shell exit
nohup node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "Backend running (PID: $BACKEND_PID)"
cd ..

IP=$(hostname -I | awk '{print $1}')
echo -e "\n${GREEN}Dashboard Access: http://$IP:5000/login.html${RESET}"
echo "Logs are in backend.log"
echo "To stop services: kill $BACKEND_PID"
