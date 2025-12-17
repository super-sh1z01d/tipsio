#!/bin/bash

# Tipsio Deployment Script
# Usage: ./deploy.sh

set -e

SERVER="91.222.236.239"
USER="root"
DOMAIN="tipsio.sh1z01d.ru"
APP_DIR="/opt/tipsio"

echo "🚀 Starting Tipsio deployment..."

# Create app directory on server
ssh $USER@$SERVER "mkdir -p $APP_DIR"

# Copy files to server
echo "📦 Copying files to server..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  --exclude '.env' --exclude '.env.*' \
  ./ $USER@$SERVER:$APP_DIR/

# Deploy on server
ssh $USER@$SERVER << 'ENDSSH'
cd /opt/tipsio

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "📥 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo "📥 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
NEXTAUTH_SECRET=$(openssl rand -base64 32)
OPENROUTER_API_KEY=
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
EOF
    echo "⚠️  Please edit .env file with your Midtrans keys!"
fi

# Create nginx config for initial cert
cat > nginx-init.conf << 'NGINX'
events {
    worker_connections 1024;
}
http {
    server {
        listen 80;
        server_name tipsio.sh1z01d.ru;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'Tipsio is being configured...';
            add_header Content-Type text/plain;
        }
    }
}
NGINX

# Create certbot directories
mkdir -p certbot/conf certbot/www

# Start nginx for cert generation
echo "🔐 Getting SSL certificate..."
docker run -d --name nginx-init -p 80:80 \
    -v $(pwd)/nginx-init.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/certbot/www:/var/www/certbot:ro \
    nginx:alpine

sleep 3

# Get certificate
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@sh1z01d.ru \
    --agree-tos \
    --no-eff-email \
    -d tipsio.sh1z01d.ru

# Stop init nginx
docker stop nginx-init && docker rm nginx-init
rm nginx-init.conf

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose down || true
docker-compose build --no-cache
docker-compose up -d

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

echo "✅ Deployment complete!"
echo "🌐 Visit https://tipsio.sh1z01d.ru"
ENDSSH

echo "🎉 Done!"
