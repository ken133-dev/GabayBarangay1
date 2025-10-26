import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateTestUsers() {
  const emails = [
    'testadmin@theycare.local',
    'test_bhw@binitayan.com',
    'test_daycare@binitayan.com',
    'test_sk@binitayan.com',
    'test_parent@binitayan.com'
  ];

  for (const email of emails) {
    try {
      const user = await prisma.user.update({
        where: { email },
        data: { status: 'ACTIVE' }
      });
      console.log(`✅ Activated: ${user.email} (${user.role})`);
    } catch (error) {
      console.log(`⚠️  Could not activate ${email} - may not exist`);
    }
  }

  await prisma.$disconnect();
}

activateTestUsers();
