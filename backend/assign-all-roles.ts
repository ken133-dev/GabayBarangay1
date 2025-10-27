import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignAllRolesToAdmin() {
  try {
    // Get all roles
    const allRoles = await prisma.role.findMany();

    // Get admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@theycare.com' }
    });

    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    // Disconnect existing roles
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        roles: {
          set: [] // Clear existing roles
        }
      }
    });

    // Assign all roles to admin
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        roles: {
          connect: allRoles.map((role: any) => ({ id: role.id }))
        }
      }
    });

    console.log('✅ Assigned all roles to admin@theycare.com');
    console.log('Roles assigned:', allRoles.map((r: any) => r.name));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignAllRolesToAdmin();