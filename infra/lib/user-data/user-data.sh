#!/bin/bash
set -e

# Update and install dependencies
apt-get update -y
apt-get install -y awscli curl unzip git nodejs npm postgresql-client jq

# Install nvm and use Node.js 20
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

# Clone backend repo
cd /home/ubuntu
git clone https://github.com/gabnash05/pixel-pursuit.git
cd pixel-pursuit
cd backend
npm install

# Fetch RDS credentials from Secrets Manager
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$DB_SECRET_ARN" \
  --region ap-southeast-2 \
  --query SecretString \
  --output text)

DB_USER=$(echo "$SECRET_JSON" | jq -r '.username')
DB_PASS=$(echo "$SECRET_JSON" | jq -r '.password')

# Write .env file
cat <<EOF > .env
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@$DB_ENDPOINT:5432/pixelpursuit
PORT=80
JWT_SECRET=$(openssl rand -hex 32)
EOF

# Run Prisma migrations
npx prisma generate
npx prisma migrate deploy

# Start backend
npm run build
npm run start:prod
