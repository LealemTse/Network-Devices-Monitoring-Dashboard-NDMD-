# Deployment Script Usage Guide

## Overview

The `deploy.sh` script automates the entire deployment process for the Network Devices Monitoring Dashboard backend.

## What It Does (Sequential Steps)

1. ✅ **Checks System Dependencies**
   - Node.js (v16+)
   - npm
   - MySQL Server
   - Installs missing dependencies automatically

2. ✅ **Validates Environment Configuration**
   - Checks for `.env` file
   - Validates all required environment variables

3. ✅ **Database Setup**
   - Creates database if it doesn't exist
   - Imports schema from `tests.sql`
   - Shows all created tables

4. ✅ **Installs Node Modules**
   - Runs `npm install` or `npm ci`
   - Installs all backend dependencies

5. ✅ **Seeds Database (Optional)**
   - Prompts to create default admin user
   - Seeds initial configuration data

6. ✅ **Starts Application**
   - Tests database connection
   - Starts the Node.js server

## How to Use

### First Time Deployment

```bash
cd /home/le/Network-Devices-Monitoring-Dashboard-NDMD-
./deployment/deploy.sh
```

### Interactive Prompts

The script will ask you:
1. **"Do you want to drop and recreate the database?"** (if database exists)
   - Answer `y` to start fresh
   - Answer `n` to keep existing data

2. **"Do you want to seed the database with default admin user?"**
   - Answer `y` to create admin user (username: admin, password: password@123#)
   - Answer `n` to skip

## Prerequisites

Before running the script, ensure:

1. **`.env` file exists** at `backend/.env` with:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=testbackend
   TOKEN_KEY=your_token_key
   REFRESH_TOKEN_SECRET=your_refresh_secret
   ```

2. **MySQL root password** is known (you'll be prompted for it)

3. **sudo privileges** (may be needed for installing dependencies)

## What Happens on Success

```
========================================
STEP 1: Checking System Dependencies
========================================

[SUCCESS] Node.js is installed: v20.x.x
[SUCCESS] npm is installed: 10.x.x
[SUCCESS] MySQL is installed
[SUCCESS] MySQL service is running

========================================
STEP 2: Checking Environment Configuration
========================================

[SUCCESS] .env file found
[SUCCESS] All required environment variables are set

========================================
STEP 3: Setting Up Database
========================================

[SUCCESS] Database 'testbackend' created
[SUCCESS] Database schema imported successfully
[INFO] Tables in database:
+------------------------+
| Tables_in_testbackend  |
+------------------------+
| configuration_settings |
| devices                |
| refresh_tokens         |
| status_logs            |
| users                  |
+------------------------+

========================================
STEP 4: Installing Node.js Dependencies
========================================

[SUCCESS] Node modules installed successfully

========================================
STEP 5: Database Seeding
========================================

[SUCCESS] Database seeded successfully
[INFO] Default credentials: username=admin, password=password@123#

========================================
STEP 6: Starting Application
========================================

[SUCCESS] Database connection test passed
[SUCCESS] All deployment steps completed successfully!

[INFO] Starting the application on port 5000...

> backend@1.0.0 start
> node server.js

Successfully connected to mysql.
Listening on port 5000
```

## Troubleshooting

### Error: ".env file not found"
**Solution:** Create `.env` file in `backend/` directory with required variables

### Error: "MySQL service is not running"
**Solution:** The script will try to start it automatically. If it fails:
```bash
sudo systemctl start mysql
```

### Error: "Access denied for user"
**Solution:** Check your MySQL credentials in `.env` file

### Error: "Node.js version must be 16 or higher"
**Solution:** The script will automatically install a newer version

## Manual Steps (If Script Fails)

If the automated script fails, you can run steps manually:

```bash
# 1. Install Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install MySQL (if needed)
sudo apt-get install -y mysql-server
sudo systemctl start mysql

# 3. Create database
mysql -u root -p -e "CREATE DATABASE testbackend;"
mysql -u root -p testbackend < database/tests.sql

# 4. Install dependencies
cd backend
npm install

# 5. Seed database (optional)
node seed.js

# 6. Start application
npm start
```

## Features

- 🎨 **Colored output** for easy reading
- ✅ **Error handling** - exits on any failure
- 🔍 **Validation** - checks all prerequisites
- 🤝 **Interactive** - prompts for important decisions
- 📝 **Detailed logging** - shows what's happening at each step
- 🔄 **Idempotent** - safe to run multiple times

## Stopping the Application

Press `Ctrl+C` in the terminal where the script is running.

## Re-running the Script

You can safely re-run the script multiple times. It will:
- Skip installing already-installed dependencies
- Ask before recreating the database
- Update node modules if needed
- Restart the application

## Production Deployment

For production, consider:
1. Using environment-specific `.env` files
2. Running the app with a process manager (PM2)
3. Setting up reverse proxy (nginx)
4. Enabling SSL/TLS
5. Setting up monitoring and logging
