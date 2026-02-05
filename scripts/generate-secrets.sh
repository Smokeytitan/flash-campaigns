#!/bin/bash

# Generate all required secrets for Flash Campaigns

echo "🔐 Generating secrets for Flash Campaigns..."
echo ""

echo "# ============================================================================"
echo "# GENERATED SECRETS - Copy these to your .env.local file"
echo "# ============================================================================"
echo ""

echo "# ENCRYPTION_KEY (64 hex characters)"
echo "ENCRYPTION_KEY=\"$(node -e "console.log(require('crypto').randomBytes(32).toString('hex')")\""
echo ""

echo "# NEXTAUTH_SECRET"
echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\""
echo ""

echo "# CRON_SECRET"
echo "CRON_SECRET=\"$(openssl rand -base64 32)\""
echo ""

echo "# TELEGRAM_WEBHOOK_SECRET"
echo "TELEGRAM_WEBHOOK_SECRET=\"$(openssl rand -base64 32)\""
echo ""

echo "✅ Secrets generated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the secrets above to your .env.local file"
echo "2. Add your DATABASE_URL from Supabase"
echo "3. Add your X_CLIENT_ID and X_CLIENT_SECRET"
echo "4. Add your TELEGRAM_BOT_TOKEN from @BotFather"
