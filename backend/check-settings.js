const { PrismaClient } = require('@prisma/client');

async function checkSettings() {
  const prisma = new PrismaClient();
  try {
    const settings = await prisma.systemSettings.findFirst();
    console.log('Settings:', JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkSettings();
