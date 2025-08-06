#!/bin/bash

echo "=== Pixel Pursuit Server Debug Script ==="
echo "Date: $(date)"
echo ""

echo "=== System Information ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"
echo ""

echo "=== Directory Structure ==="
ls -la /opt/pixel-pursuit/backend/
echo ""

echo "=== Environment Variables ==="
cd /opt/pixel-pursuit/backend
if [ -f .env ]; then
    echo "Environment file exists"
    cat .env | sed 's/DATABASE_URL=.*/DATABASE_URL=***HIDDEN***/'
else
    echo "Environment file missing!"
fi
echo ""

echo "=== Prisma Status ==="
npx prisma --version
echo ""

echo "=== PM2 Status ==="
pm2 status
echo ""

echo "=== PM2 Logs (last 20 lines) ==="
pm2 logs pixel-pursuit --lines 20
echo ""

echo "=== Manual Server Test ==="
echo "Testing server startup manually..."
cd /opt/pixel-pursuit/backend
timeout 15s node dist/server.js || echo "Server test completed or timed out"
echo ""

echo "=== File Permissions ==="
ls -la /opt/pixel-pursuit/backend/dist/
echo ""

echo "=== Database Connection Test ==="
cd /opt/pixel-pursuit/backend
npx prisma db pull --print || echo "Database connection failed"
echo ""

echo "=== Debug Complete ===" 