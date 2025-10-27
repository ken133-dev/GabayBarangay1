import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminRoles() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@theycare.com' },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (user) {
      console.log('Admin user roles:', user.roles.map(r => r.name));
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminRoles();