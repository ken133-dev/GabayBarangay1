const { PrismaClient } = require('@prisma/client');

async function checkBackups() {
  const prisma = new PrismaClient();
  try {
    const backups = await prisma.systemBackup.findMany({ orderBy: { startedAt: 'desc' } });
    console.log('Backups:', JSON.stringify(backups, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkBackups();
