/**
 * Test database connection
 * Run: npx tsx scripts/test-db.ts
 */

import prisma from '../lib/db/prisma'

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...')

    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    // Test query
    const userCount = await prisma.user.count()
    const campaignCount = await prisma.campaign.count()

    console.log(`\n📊 Database Stats:`)
    console.log(`   Users: ${userCount}`)
    console.log(`   Campaigns: ${campaignCount}`)

    await prisma.$disconnect()
    console.log('\n✅ Connection test passed!')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.error('\n💡 Check:')
    console.error('   1. DATABASE_URL is set in .env.local')
    console.error('   2. Supabase project is running')
    console.error('   3. You have run: npm run db:migrate')
    process.exit(1)
  }
}

testConnection()
