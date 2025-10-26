import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToMultiRole() {
  console.log('Migrating existing users to multi-role system...');
  
  try {
    // Get all users to ensure they have roles array populated
    const users = await prisma.user.findMany();

    console.log(`Found ${users.length} users to migrate`);

    // Update each user to have their current role in the roles array
    for (const user of users) {
      if (!user.roles || user.roles.length === 0 || (user.roles.length === 1 && user.roles[0] === 'VISITOR' && user.role !== 'VISITOR')) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            roles: [user.role]
          }
        });
        console.log(`Migrated user ${user.email}: ${user.role} -> [${user.role}]`);
      } else {
        console.log(`User ${user.email} already has correct roles: [${user.roles.join(', ')}]`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateToMultiRole();
}

export { migrateToMultiRole };