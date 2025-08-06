#!/bin/bash
set -e

DB_SECRET_ARN="__DB_SECRET_ARN__"
DB_ENDPOINT="__DB_ENDPOINT__"

export HOME="/home/ubuntu"
cd $HOME

# Update and install dependencies
sudo apt-get update -y
sudo apt-get install -y curl unzip git nodejs npm postgresql-client jq

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install 
rm -rf awscliv2.zip aws

# Install nvm and Node.js 20
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

export NVM_DIR="$HOME/.nvm"
mkdir -p $NVM_DIR

cat <<EOF >> $HOME/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "\$NVM_DIR/nvm.sh" ] && \. "\$NVM_DIR/nvm.sh"
EOF

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

# Clone repo to /opt
sudo mkdir -p /opt/pixel-pursuit
sudo chown -R $USER:$USER /opt/pixel-pursuit  # Let current user write
git clone https://github.com/gabnash05/pixel-pursuit.git /opt/pixel-pursuit
cd /opt/pixel-pursuit/backend && npm install

# Fetch RDS credentials (uses AWS CLI)
SECRET_JSON=$(aws secretsmanager get-secret-value \
    --secret-id "$DB_SECRET_ARN" \
    --region ap-southeast-2 \
    --query SecretString \
    --output text)

DB_USER=$(echo "$SECRET_JSON" | jq -r '.username')
DB_PASS=$(echo "$SECRET_JSON" | jq -r '.password')

# Write .env file
cat <<EOF > /opt/pixel-pursuit/backend/.env
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_ENDPOINT:5432/pixelpursuit
PORT=80
JWT_SECRET=$(openssl rand -hex 32)
NODE_ENV=production
EOF

# Run Prisma migrations
cd /opt/pixel-pursuit/backend
echo "Generating Prisma client..."
npx prisma generate
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Install PM2 globally (requires sudo for global npm install)
sudo npm install -g pm2
cd /opt/pixel-pursuit/backend && npm run build

# Create PM2 ecosystem file
cat <<EOF > /opt/pixel-pursuit/backend/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'pixel-pursuit',
    script: 'dist/server.js',
    cwd: '/opt/pixel-pursuit/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 80
    },
    env_file: '.env',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Create logs directory
mkdir -p /opt/pixel-pursuit/backend/logs

# Test the server can start manually first
echo "Testing server startup..."
cd /opt/pixel-pursuit/backend
timeout 10s node dist/server.js || echo "Server test completed"

# Start PM2 with ecosystem file
echo "Starting PM2..."
cd /opt/pixel-pursuit/backend
pm2 start ecosystem.config.js

# Wait a moment and check status
sleep 5
pm2 status

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
sudo pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "Setup complete. PM2 should be running and configured to start on boot." 