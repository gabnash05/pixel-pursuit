#!/bin/bash

#Pixel Pursuit Backend Setup

set -euo pipefail  # Basic error handling

# Configuration
DB_SECRET_ARN="__DB_SECRET_ARN__"
DB_ENDPOINT="__DB_ENDPOINT__"
APP_DIR="/opt/pixel-pursuit"
BACKEND_DIR="$APP_DIR/backend"
LOG_FILE="/var/log/pixel-pursuit-setup.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1: $2" | tee -a "$LOG_FILE"
}

# Update system and install dependencies
log "INFO" "Updating system packages"
sudo apt-get update -y
sudo apt-get install -y curl unzip git postgresql-client jq

# Install Node.js 22.x
log "INFO" "Installing Node.js"
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install AWS CLI (v2)
log "INFO" "Installing AWS CLI"
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
unzip -q awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws

# Setup application directory
log "INFO" "Setting up application"
sudo mkdir -p "$APP_DIR"
sudo chown -R ubuntu:ubuntu "$APP_DIR"
git clone https://github.com/gabnash05/pixel-pursuit.git "$APP_DIR"

# Install dependencies
log "INFO" "Installing dependencies"
cd "$BACKEND_DIR"
npm install

# Configure environment
log "INFO" "Configuring environment"
secret_json=$(aws secretsmanager get-secret-value --secret-id "$DB_SECRET_ARN" --region ap-southeast-2 --query SecretString --output text)
db_user=$(echo "$secret_json" | jq -r '.username')
db_pass=$(echo "$secret_json" | jq -r '.password')

cat > .env << EOF
DATABASE_URL=postgresql://${db_user}:${db_pass}@${DB_ENDPOINT}:5432/pixelpursuit
PORT=80
JWT_SECRET=$(openssl rand -hex 32)
SUPER_ADMIN_SECRET=your-very-strong-random-secret
NODE_ENV=development
EOF
 
# Build the application
log "INFO" "Building application"
npm run build

# Setup database
log "INFO" "Setting up database"
npx prisma generate
npx prisma migrate deploy

# Start application
log "INFO" "Starting application"
sudo npm install -g pm2
pm2 start dist/server.js --name "pixel-pursuit"
pm2 save
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu

log "SUCCESS" "Deployment completed"