#!/bin/bash

# Flash Campaigns - Quick Deploy Script
# This script deploys your app to Vercel

set -e

echo "🚀 Flash Campaigns - Vercel Deployment"
echo "======================================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use default

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo ""
    echo "Please create .env.local with your environment variables."
    echo "See .env.local.template for reference."
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Run Prisma generate
echo "📦 Generating Prisma client..."
npm run db:generate

echo ""
echo "🎯 Ready to deploy!"
echo ""
echo "Choose deployment type:"
echo "  1. Preview deployment (test first)"
echo "  2. Production deployment"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "🔄 Deploying preview..."
        vercel
        ;;
    2)
        echo ""
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Update X OAuth callback URL with your Vercel domain"
echo "  2. Set Telegram webhook with your Vercel domain"
echo "  3. Test the app at your deployment URL"
echo ""
echo "See VERCEL_DEPLOYMENT.md for detailed post-deployment steps."
