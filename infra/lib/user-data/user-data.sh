#!/bin/bash
set -e

DB_SECRET_ARN="__DB_SECRET_ARN__"
DB_ENDPOINT="__DB_ENDPOINT__"

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
EOF

# Run Prisma migrations
cd /opt/pixel-pursuit/backend && npx prisma generate && npx prisma migrate deploy

# Install PM2 globally (requires sudo for global npm install)
sudo npm install -g pm2
cd /opt/pixel-pursuit/backend && npm run build
pm2 start npm --name "pixel-pursuit" -- run dev
pm2 save
sudo pm2 startup systemd 