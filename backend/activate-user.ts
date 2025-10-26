import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateUser() {
  const user = await prisma.user.update({
    where: { email: 'testadmin@theycare.local' },
    data: { status: 'ACTIVE' }
  });
  console.log('✅ User activated:', user.email, '-', user.status);
  await prisma.$disconnect();
}

activateUser();
