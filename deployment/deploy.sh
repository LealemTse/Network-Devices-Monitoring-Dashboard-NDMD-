#!/bin/bash

# Network Devices Monitoring Dashboard - Deployment Script
# This script automates the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
DATABASE_DIR="$PROJECT_ROOT/database"
ENV_FILE="$BACKEND_DIR/.env"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 16 ]; then
        print_error "Node.js version must be 16 or higher. Current version: $(node -v)"
        return 1
    fi
    return 0
}

# ========================================
# STEP 1: Check and Install Dependencies
# ========================================
print_header "STEP 1: Checking System Dependencies"

# Check for Node.js
print_info "Checking for Node.js..."
if command_exists node; then
    print_success "Node.js is installed: $(node -v)"
    if ! check_node_version; then
        print_warning "Installing a newer version of Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
else
    print_warning "Node.js not found. Installing Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_success "Node.js installed: $(node -v)"
fi

# Check for npm
print_info "Checking for npm..."
if command_exists npm; then
    print_success "npm is installed: $(npm -v)"
else
    print_error "npm not found. This should have been installed with Node.js."
    exit 1
fi

# Check for MySQL
print_info "Checking for MySQL..."
if command_exists mysql; then
    print_success "MySQL is installed: $(mysql --version)"
else
    print_warning "MySQL not found. Installing MySQL Server..."
    sudo apt-get update
    sudo apt-get install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    print_success "MySQL installed and started"
    
    print_warning "Please run 'sudo mysql_secure_installation' to secure your MySQL installation"
fi

# Check if MySQL service is running
print_info "Checking MySQL service status..."
if sudo systemctl is-active --quiet mysql || sudo systemctl is-active --quiet mariadb; then
    print_success "MySQL service is running"
else
    print_warning "MySQL service is not running. Starting it..."
    sudo systemctl start mysql || sudo systemctl start mariadb
    print_success "MySQL service started"
fi

# ========================================
# STEP 2: Check Environment Configuration
# ========================================
print_header "STEP 2: Checking Environment Configuration"

if [ ! -f "$ENV_FILE" ]; then
    print_error ".env file not found at $ENV_FILE"
    print_info "Please create .env file with your database credentials"
    print_info "Required variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT, TOKEN_KEY, REFRESH_TOKEN_SECRET"
    exit 1
else
    print_success ".env file found"
    
    # Load environment variables
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    
    # Validate required variables
    required_vars=("DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME" "PORT" "TOKEN_KEY" "REFRESH_TOKEN_SECRET")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        exit 1
    fi
    
    print_success "All required environment variables are set"
fi

# ========================================
# STEP 3: Create Database and Import Schema
# ========================================
print_header "STEP 3: Setting Up Database"

print_info "Checking if database '$DB_NAME' exists..."
DB_EXISTS=$(mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "SHOW DATABASES LIKE '$DB_NAME';" | grep "$DB_NAME" || true)

if [ -z "$DB_EXISTS" ]; then
    print_info "Creating database '$DB_NAME'..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE $DB_NAME;"
    print_success "Database '$DB_NAME' created"
else
    print_warning "Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Dropping database '$DB_NAME'..."
        mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "DROP DATABASE $DB_NAME;"
        mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE $DB_NAME;"
        print_success "Database recreated"
    else
        print_info "Skipping database recreation"
    fi
fi

# Import schema
print_info "Importing database schema from $DATABASE_DIR/tests.sql..."
if [ -f "$DATABASE_DIR/tests.sql" ]; then
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$DATABASE_DIR/tests.sql"
    print_success "Database schema imported successfully"
    
    # Show imported tables
    print_info "Tables in database:"
    mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;"
else
    print_error "Schema file not found: $DATABASE_DIR/tests.sql"
    exit 1
fi

# ========================================
# STEP 4: Install Node Modules
# ========================================
print_header "STEP 4: Installing Node.js Dependencies"

cd "$BACKEND_DIR"
print_info "Installing npm packages..."

if [ -f "package-lock.json" ]; then
    npm ci  # Clean install using package-lock.json
else
    npm install
fi

print_success "Node modules installed successfully"

# ========================================
# STEP 5: Seed Database (Optional)
# ========================================
print_header "STEP 5: Database Seeding"

if [ -f "$BACKEND_DIR/seed.js" ]; then
    read -p "Do you want to seed the database with default admin user? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Seeding database..."
        node "$BACKEND_DIR/seed.js"
        print_success "Database seeded successfully"
        print_info "Default credentials: username=admin, password=password@123#"
    else
        print_info "Skipping database seeding"
    fi
else
    print_warning "Seed file not found. Skipping seeding."
fi

# ========================================
# STEP 6: Start Application
# ========================================
print_header "STEP 6: Starting Application"

print_info "Testing database connection..."
cd "$BACKEND_DIR"

# Create a test connection script
cat > test-connection.js << 'EOF'
const db = require('./config/db');
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('✓ Database connection successful');
        connection.release();
        process.exit(0);
    } catch (err) {
        console.error('✗ Database connection failed:', err.message);
        process.exit(1);
    }
})();
EOF

if node test-connection.js; then
    print_success "Database connection test passed"
    rm test-connection.js
else
    print_error "Database connection test failed"
    rm test-connection.js
    exit 1
fi

print_success "All deployment steps completed successfully!"
echo ""
print_info "Starting the application on port $PORT..."
echo ""

# Start the application
npm start