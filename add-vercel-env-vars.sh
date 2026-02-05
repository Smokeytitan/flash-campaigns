#!/bin/bash

# Script to add all environment variables to Vercel
# Run this from the flash-campaigns directory

set -e

echo "Adding environment variables to Vercel..."

# Link project if needed
echo "Linking Vercel project..."
vercel link --yes --project polygon-flash-campaigns

# Add DATABASE_URL
echo "Adding DATABASE_URL..."
echo 'postgresql://postgres.xdtfcrkdnbzakmmbnnba:Steelclarksm10%3F@aws-0-us-west-1.pooler.supabase.com:6543/postgres' | vercel env add DATABASE_URL production preview development

# Add NEXTAUTH_URL
echo "Adding NEXTAUTH_URL..."
echo 'https://polygon-flash-campaigns.vercel.app' | vercel env add NEXTAUTH_URL production
echo 'https://polygon-flash-campaigns.vercel.app' | vercel env add NEXTAUTH_URL preview
echo 'http://localhost:3000' | vercel env add NEXTAUTH_URL development

# Add NEXTAUTH_SECRET
echo "Adding NEXTAUTH_SECRET..."
echo 'Di7sl5WtaIOpYnl4nsRqJj7F92wxzJgCxHrn7c6oQ1s=' | vercel env add NEXTAUTH_SECRET production preview development

# Add ENCRYPTION_KEY
echo "Adding ENCRYPTION_KEY..."
echo 'ce81981bf6f7601133510c5777cf0cd4360bf6f68ca913b8e74668c227593034' | vercel env add ENCRYPTION_KEY production preview development

# Add CRON_SECRET
echo "Adding CRON_SECRET..."
echo 'CRxTPgiqJz1PYVbSD/J9yXc3Re2f3FupVdrhGKFvfVU=' | vercel env add CRON_SECRET production preview development

# Add TELEGRAM_WEBHOOK_SECRET
echo "Adding TELEGRAM_WEBHOOK_SECRET..."
echo 'lhe/G87rgC4OYI5DH1gsn5TL9AalbogOsqRJLFc+eC8=' | vercel env add TELEGRAM_WEBHOOK_SECRET production preview development

# Add X_CLIENT_ID
echo "Adding X_CLIENT_ID..."
echo 'OXRYYmhDejVHUHRCQUVYUWxpWkM6MTpjaQ' | vercel env add X_CLIENT_ID production preview development

# Add X_CLIENT_SECRET
echo "Adding X_CLIENT_SECRET..."
echo 'eAOc7ad_oXB69jjqCPQWGvFW27OyL4ID1p7n-feKHEmbQaeTuA' | vercel env add X_CLIENT_SECRET production preview development

# Add NEXT_PUBLIC_APP_URL
echo "Adding NEXT_PUBLIC_APP_URL..."
echo 'https://polygon-flash-campaigns.vercel.app' | vercel env add NEXT_PUBLIC_APP_URL production preview
echo 'http://localhost:3000' | vercel env add NEXT_PUBLIC_APP_URL development

# Add NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
echo "Adding NEXT_PUBLIC_TELEGRAM_BOT_USERNAME..."
echo 'FlashCampaignsBot' | vercel env add NEXT_PUBLIC_TELEGRAM_BOT_USERNAME production preview development

echo ""
echo "✅ All environment variables added!"
echo ""
echo "⚠️  Note: TELEGRAM_BOT_TOKEN still needs to be added after you create your bot"
echo "   Run: echo 'YOUR_BOT_TOKEN' | vercel env add TELEGRAM_BOT_TOKEN production preview development"
echo ""
echo "🚀 Triggering a new deployment..."
vercel --prod

echo ""
echo "✅ Done! Check your deployment at: https://vercel.com/ntruslow-1248s-projects/polygon-flash-campaigns"
