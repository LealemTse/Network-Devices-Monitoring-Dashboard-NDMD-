#!/bin/bash

# Network Devices Monitoring Dashboard - Deployment Script

# 0. Set Project Root (Handle running from deployment/ or root)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
if [[ "$SCRIPT_DIR" == */deployment ]]; then
  PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
else
  PROJECT_ROOT="$SCRIPT_DIR"
fi

cd "$PROJECT_ROOT" || { echo "Error: Could not find project root"; exit 1; }

RESET="\033[0m"
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
CYAN="\033[36m"
BLUE="\033[34m"

info() { echo -e "${BLUE}[INFO]${RESET} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${RESET} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${RESET} $1"; }
error() { echo -e "${RED}[ERROR]${RESET} $1"; exit 1; }

check_command() {
    if ! command -v "$1" &> /dev/null; then
        warn "$1 is not installed."
        return 1
    fi
    return 0
}

# 1. Update and Install System Dependencies
info "Updating package lists and checking dependencies..."
if check_command node; then
    success "Node.js is installed."
else
    info "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if check_command mysql; then
    success "MySQL Client is installed."
else
    info "Installing MySQL..."
    sudo apt-get install -y mysql-server
fi

if check_command redis-server; then
    success "Redis is installed."
else
    info "Installing Redis..."
    sudo apt-get install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
fi


if check_command ping; then
    success "Ping utility is ready."
else
    info "Installing Ping utility..."
    sudo apt-get install -y iputils-ping
fi

# Python Setup
if check_command python3; then
    success "Python 3 is installed."
else
    info "Installing Python 3..."
    sudo apt-get install -y python3
fi

# Check for pip
if command -v pip3 &> /dev/null; then
    success "pip3 is installed."
else
    info "Installing python3-pip..."
    sudo apt-get install -y python3-pip
fi

# Check for venv
if dpkg -s python3-venv &> /dev/null; then
    success "python3-venv is installed."
else
    info "Installing python3-venv..."
    sudo apt-get install -y python3-venv
fi

# 2. Interactive Configuration
echo -e "\n${BOLD}${CYAN}=== System Configuration ===${RESET}"

# Password
while true; do
    read -sp "Enter Admin Password: " ADMIN_PASS
    echo
    read -sp "Confirm Password: " ADMIN_PASS_CONFIRM
    echo
    if [ "$ADMIN_PASS" == "$ADMIN_PASS_CONFIRM" ] && [ -n "$ADMIN_PASS" ]; then
        break
    else
        echo -e "${RED}Passwords do not match or are empty. Try again.${RESET}"
    fi
done

# Database Password (New)
echo -e "\n${YELLOW}Database Configuration:${RESET}"
read -sp "Enter MySQL Root Password (leave empty if none): " DB_ROOT_PASS
echo ""

# Security Questions
QUESTIONS=(
    "What was your childhood nickname?"
    "What is the name of your favorite pet?"
    "In what city were you born?"
    "What is your mother's maiden name?"
    "What was the make of your first car?"
    "What is your favorite book?"
)

select_question() {
    # Print menu to stderr (>&2) to avoid capturing it in the variable
    echo -e "\n${YELLOW}Select Security Question $1:${RESET}" >&2
    for i in "${!QUESTIONS[@]}"; do
        echo "   $((i+1)). ${QUESTIONS[$i]}" >&2
    done
    echo "" >&2
    
    while true; do
        read -p "Enter choice (1-6): " choice >&2
        if [[ "$choice" =~ ^[1-6]$ ]]; then
             echo "${QUESTIONS[$((choice-1))]}" # Stdout: Captured
             break
        else 
             echo "Invalid Choice. Please enter a number between 1 and 6." >&2
        fi
    done
}

Q1_TEXT=$(select_question 1)
echo -e "Selected: ${CYAN}$Q1_TEXT${RESET}"
read -p "Answer: " A1_TEXT

Q2_TEXT=$(select_question 2)
echo -e "Selected: ${CYAN}$Q2_TEXT${RESET}"
read -p "Answer: " A2_TEXT

echo ""
info "Configuration captured."

# 3. Setup Database
info "Setting up Database..."
DB_NAME="testbackend" 
DB_USER="root"

# Check .env
ENV_FILE="backend/.env"
# Always recreate or update .env to ensure it matches DB_NAME and Credentials?
# User might have existing one. Let's backup if exists.
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$ENV_FILE.bak"
    info "Backed up existing .env to .env.bak"
fi

info "Creating backend/.env file..."
cat <<EOT > "$ENV_FILE"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=$DB_ROOT_PASS
DB_NAME=$DB_NAME
PORT=5000
TOKEN_KEY=$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
EOT

# Database Import
SQL_CMD="DROP DATABASE IF EXISTS $DB_NAME; CREATE DATABASE $DB_NAME;"
SCHEMA_FILE="database/db.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    error "Schema file $SCHEMA_FILE not found! Are you in the project root?"
fi

# Try connection (User Pass vs No Pass)
if [ -n "$DB_ROOT_PASS" ]; then
    # Password provided
    if ! mysql -u root -p"$DB_ROOT_PASS" -e "$SQL_CMD" 2>/dev/null; then
         # Try sudo with password? Sudo usually bypasses auth or uses root system user.
         # If sudo, we might not need -p if root uses socket.
         warn "Failed to connect with password. Trying with sudo..."
         sudo mysql -e "$SQL_CMD" || error "Failed to create database. Check credentials."
    fi
    
    info "Importing Configured Schema..."
    if ! mysql -u root -p"$DB_ROOT_PASS" "$DB_NAME" < "$SCHEMA_FILE" 2>/dev/null; then
         sudo mysql "$DB_NAME" < "$SCHEMA_FILE" || error "Failed to import schema."
    fi

else
    # No Password
    if ! mysql -u root -e "$SQL_CMD" 2>/dev/null; then
         warn "Failed to connect without password. Trying with sudo..."
         sudo mysql -e "$SQL_CMD" || error "Failed to create database. Check credentials."
    fi
    
    info "Importing Configured Schema..."
    if ! mysql -u root "$DB_NAME" < "$SCHEMA_FILE" 2>/dev/null; then
         sudo mysql "$DB_NAME" < "$SCHEMA_FILE" || error "Failed to import schema."
    fi
fi

success "Database imported."

# 4. Seed Database with User Config
info "Seeding Admin User..."
export ADMIN_USER="admin"
export ADMIN_PASSWORD="$ADMIN_PASS"
export SEC_Q1="$Q1_TEXT"
export SEC_A1="$A1_TEXT"
export SEC_Q2="$Q2_TEXT"
export SEC_A2="$A2_TEXT"

cd backend
npm install
node seed.js || error "Failed to seed database."
success "Database Seeded."
cd ..

# 5. Setup Monitoring Service (Python)
info "Setting up Monitoring Service..."
cd monitoring-service

if [ ! -d "venv" ]; then
    info "Creating virtual environment..."
    sudo apt install python3-venv || error "Failed to install virtual environment."
    python3 -m venv venv || error "Failed to create virtual environment."
fi

info "Installing Python dependencies..."
# Activate venv for installation
source venv/bin/activate
# Check if requirements.txt exists in root or current dir (script expects it in root based on analysis)
if [ -f "../requirements.txt" ]; then
    pip install requests || error "Failed to install dependencies."
else 
   warn "requirements.txt not found in project root."
fi
deactivate
cd ..

# 6. Skip Frontend Install (Served Static)
info "Frontend is now static/vanilla. Skipping npm install."

success "Installation Complete!"
echo -e "${BOLD}${GREEN}Execute ./start.sh to launch the application.${RESET}"

# Create start.sh with dual-server support
cat <<EOT > start.sh
<<<<<<< HEAD
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

EOT
=======


chmod +x start.sh
