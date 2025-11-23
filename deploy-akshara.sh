#!/bin/bash

# ===========================================================
# Akshara ERP Frontend — Full Rehost / Redeploy Script
# Author: SMDigitalX
# Purpose: Auto-pull from GitHub, rebuild, deploy, and reload Nginx
# ===========================================================

APP_NAME="Akshara ERP Frontend"
FRONTEND_DIR="/root/akshara-erp/nexzen-frontend"
BUILD_DIR="$FRONTEND_DIR/dist"
DEPLOY_DIR="/var/www/akshara"
BRANCH="main"   # change if needed

echo "🚀 Starting deployment for $APP_NAME..."
echo "=========================================="

cd "$FRONTEND_DIR" || { echo "❌ Project directory not found: $FRONTEND_DIR"; exit 1; }

# Step 1: Pull latest changes from GitHub
echo ""
echo "📡 Step 1: Pulling latest code from GitHub..."
git fetch origin $BRANCH
git reset --hard origin/$BRANCH

# Step 2: Install dependencies
echo ""
echo "📦 Step 2: Installing dependencies..."
npm ci || npm install

# Step 3: Setup Akshara environment file
echo ""
echo "⚙️  Step 3: Setting up Akshara environment configuration..."
if [ -f "env.akshara.production" ]; then
    cp env.akshara.production .env.production
    echo "✅ Copied env.akshara.production to .env.production"
else
    echo "⚠️  Warning: env.akshara.production not found!"
    echo "   Make sure .env.production exists with Akshara configuration"
fi

# Step 4: Setup Akshara assets
echo ""
echo "🎨 Step 4: Setting up Akshara assets..."
if [ -f "setup-akshara-assets.js" ]; then
    node setup-akshara-assets.js || { echo "⚠️  Warning: Asset setup failed, continuing anyway..."; }
else
    echo "⚠️  Warning: setup-akshara-assets.js not found!"
fi

# Step 5: Verify environment configuration
echo ""
echo "✅ Step 5: Verifying environment configuration..."
if [ -f "verify-env.js" ]; then
    node verify-env.js || { echo "⚠️  Warning: Environment verification failed, continuing anyway..."; }
else
    echo "⚠️  Warning: verify-env.js not found, skipping verification"
fi

# Step 6: Build the app
echo ""
echo "🏗️  Step 6: Building production files..."
npm run build:akshara || { 
    echo "❌ Build failed!"
    echo "   Trying fallback build command..."
    npm run build || { 
        echo "❌ Build failed with fallback too!"
        exit 1
    }
}

# Step 7: Verify build
echo ""
echo "🔍 Step 7: Verifying build output..."
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build directory not found: $BUILD_DIR"
    exit 1
fi

if [ ! "$(ls -A $BUILD_DIR)" ]; then
    echo "❌ Build directory is empty!"
    exit 1
fi

echo "✅ Build verified successfully"
echo "   Build size: $(du -sh $BUILD_DIR | cut -f1)"

# Step 8: Backup current deployment (optional but recommended)
echo ""
echo "💾 Step 8: Creating backup of current deployment..."
BACKUP_DIR="${DEPLOY_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
if [ -d "$DEPLOY_DIR" ] && [ "$(ls -A $DEPLOY_DIR)" ]; then
    sudo cp -r $DEPLOY_DIR $BACKUP_DIR
    echo "✅ Backup created at: $BACKUP_DIR"
else
    echo "ℹ️  No existing deployment to backup"
fi

# Step 9: Clean old deployment
echo ""
echo "🧹 Step 9: Cleaning old files in $DEPLOY_DIR..."
sudo rm -rf ${DEPLOY_DIR:?}/*

# Step 10: Copy new build to web root
echo ""
echo "📂 Step 10: Copying new build to $DEPLOY_DIR..."
sudo cp -r $BUILD_DIR/* $DEPLOY_DIR/

# Step 11: Fix ownership & permissions
echo ""
echo "🔐 Step 11: Fixing ownership and permissions..."
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# Step 12: Reload Nginx
echo ""
echo "🔁 Step 12: Reloading Nginx..."
sudo systemctl reload nginx || {
    echo "⚠️  Warning: Nginx reload failed, trying restart..."
    sudo systemctl restart nginx || {
        echo "❌ Nginx restart failed!"
        exit 1
    }
}

# Step 13: Verify Nginx status
echo ""
echo "🔍 Step 13: Verifying Nginx status..."
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running!"
    exit 1
fi

# Step 14: Done!
echo ""
echo "=========================================="
echo "✅ $APP_NAME successfully deployed!"
echo "🌐 Live at: https://erp.aksharaedn.in"
echo "📦 Build directory: $BUILD_DIR"
echo "🚀 Deploy directory: $DEPLOY_DIR"
if [ -d "$BACKUP_DIR" ]; then
    echo "💾 Backup saved at: $BACKUP_DIR"
    echo "   (You can remove old backups later: rm -rf ${DEPLOY_DIR}.backup.*)"
fi
echo "=========================================="

