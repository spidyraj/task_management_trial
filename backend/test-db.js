const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test if tables exist
    const userCount = await prisma.user.count();
    console.log(`Users table exists: ${userCount > 0 ? 'YES' : 'NO'}`);
    
    const taskCount = await prisma.task.count();
    console.log(`Tasks table exists: ${taskCount > 0 ? 'YES' : 'NO'}`);
    
    await prisma.$disconnect();
    console.log('✅ Database test completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testDatabase();
