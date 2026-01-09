#!/bin/bash
GREEN="\033[32m"
RESET="\033[0m"

echo "Starting Redis..."
sudo systemctl start redis-server

echo "Starting Backend..."
cd backend
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "Backend running (PID: $BACKEND_PID)"
cd ..

echo "Starting Frontend..."
cd frontend
nohup npm run dev -- --host > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "Frontend running (PID: $FRONTEND_PID)"
cd ..

IP=$(hostname -I | awk '{print $1}')
echo -e "\n\033[32mDashboard Access: http://$IP:5173\033[0m"
echo -e "Backend API: http://$IP:5000"
echo "Logs are in backend.log and frontend.log"
echo "To stop services: kill $BACKEND_PID $FRONTEND_PID"
