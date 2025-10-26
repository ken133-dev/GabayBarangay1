import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const defaultPassword = await hashPassword('password123');

  // 1. SYSTEM_ADMIN
  await prisma.user.upsert({
    where: { email: 'admin@theycare.local' },
    update: {},
    create: {
      email: 'admin@theycare.local',
      password: defaultPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SYSTEM_ADMIN',
      status: 'ACTIVE'
    }
  });

  // 2. BARANGAY_CAPTAIN
  await prisma.user.upsert({
    where: { email: 'captain@theycare.local' },
    update: {},
    create: {
      email: 'captain@theycare.local',
      password: defaultPassword,
      firstName: 'Barangay',
      lastName: 'Captain',
      role: 'BARANGAY_CAPTAIN',
      status: 'ACTIVE'
    }
  });

  // 3. BARANGAY_OFFICIAL
  await prisma.user.upsert({
    where: { email: 'official@theycare.local' },
    update: {},
    create: {
      email: 'official@theycare.local',
      password: defaultPassword,
      firstName: 'Barangay',
      lastName: 'Official',
      role: 'BARANGAY_OFFICIAL',
      status: 'ACTIVE'
    }
  });

  // 4. BHW (Barangay Health Worker)
  await prisma.user.upsert({
    where: { email: 'bhw@theycare.local' },
    update: {},
    create: {
      email: 'bhw@theycare.local',
      password: defaultPassword,
      firstName: 'Maria',
      lastName: 'Santos',
      role: 'BHW',
      status: 'ACTIVE',
      contactNumber: '09171234567',
      address: 'Barangay Health Center'
    }
  });

  // 5. BHW_COORDINATOR
  await prisma.user.upsert({
    where: { email: 'bhw-coordinator@theycare.local' },
    update: {},
    create: {
      email: 'bhw-coordinator@theycare.local',
      password: defaultPassword,
      firstName: 'Dr. Rosa',
      lastName: 'Garcia',
      role: 'BHW_COORDINATOR',
      status: 'ACTIVE',
      contactNumber: '09171234568',
      address: 'Barangay Health Center'
    }
  });

  // 6. DAYCARE_STAFF
  await prisma.user.upsert({
    where: { email: 'daycare-staff@theycare.local' },
    update: {},
    create: {
      email: 'daycare-staff@theycare.local',
      password: defaultPassword,
      firstName: 'Ana',
      lastName: 'Reyes',
      role: 'DAYCARE_STAFF',
      status: 'ACTIVE',
      contactNumber: '09171234569',
      address: 'Barangay Daycare Center'
    }
  });

  // 7. DAYCARE_TEACHER
  await prisma.user.upsert({
    where: { email: 'daycare-teacher@theycare.local' },
    update: {},
    create: {
      email: 'daycare-teacher@theycare.local',
      password: defaultPassword,
      firstName: 'Teacher',
      lastName: 'Cruz',
      role: 'DAYCARE_TEACHER',
      status: 'ACTIVE',
      contactNumber: '09171234570',
      address: 'Barangay Daycare Center'
    }
  });

  // 8. SK_OFFICER
  await prisma.user.upsert({
    where: { email: 'sk-officer@theycare.local' },
    update: {},
    create: {
      email: 'sk-officer@theycare.local',
      password: defaultPassword,
      firstName: 'Mark',
      lastName: 'Gonzales',
      role: 'SK_OFFICER',
      status: 'ACTIVE',
      contactNumber: '09171234571',
      address: 'SK Office'
    }
  });

  // 9. SK_CHAIRMAN
  await prisma.user.upsert({
    where: { email: 'sk-chairman@theycare.local' },
    update: {},
    create: {
      email: 'sk-chairman@theycare.local',
      password: defaultPassword,
      firstName: 'SK Chairman',
      lastName: 'Ramos',
      role: 'SK_CHAIRMAN',
      status: 'ACTIVE',
      contactNumber: '09171234572',
      address: 'SK Office'
    }
  });

  // 10. PARENT_RESIDENT
  await prisma.user.upsert({
    where: { email: 'resident@theycare.local' },
    update: {},
    create: {
      email: 'resident@theycare.local',
      password: defaultPassword,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      role: 'PARENT_RESIDENT',
      status: 'ACTIVE',
      contactNumber: '09187654321',
      address: 'Purok 1, Sample Street'
    }
  });

  // 11. PATIENT
  await prisma.user.upsert({
    where: { email: 'patient@theycare.local' },
    update: {},
    create: {
      email: 'patient@theycare.local',
      password: defaultPassword,
      firstName: 'Pedro',
      lastName: 'Mendoza',
      role: 'PATIENT',
      status: 'ACTIVE',
      contactNumber: '09187654322',
      address: 'Purok 2, Sample Street'
    }
  });

  // 12. VISITOR (Pending approval example)
  await prisma.user.upsert({
    where: { email: 'visitor@theycare.local' },
    update: {},
    create: {
      email: 'visitor@theycare.local',
      password: defaultPassword,
      firstName: 'Guest',
      lastName: 'User',
      role: 'VISITOR',
      status: 'PENDING',
      contactNumber: '09187654323'
    }
  });

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Users Summary (All use password: password123):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   1. System Admin:       admin@theycare.local');
  console.log('   2. Barangay Captain:   captain@theycare.local');
  console.log('   3. Barangay Official:  official@theycare.local');
  console.log('   4. BHW:                bhw@theycare.local');
  console.log('   5. BHW Coordinator:    bhw-coordinator@theycare.local');
  console.log('   6. Daycare Staff:      daycare-staff@theycare.local');
  console.log('   7. Daycare Teacher:    daycare-teacher@theycare.local');
  console.log('   8. SK Officer:         sk-officer@theycare.local');
  console.log('   9. SK Chairman:        sk-chairman@theycare.local');
  console.log('  10. Parent/Resident:    resident@theycare.local');
  console.log('  11. Patient:            patient@theycare.local');
  console.log('  12. Visitor (Pending):  visitor@theycare.local (PENDING status)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Login with any of these accounts to test role-based sidebar navigation!');

  // Initialize system settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      barangayName: 'Barangay Binitayan',
      barangayAddress: 'Daraga, Albay, Philippines',
      barangayEmail: 'contact@barangaybinitayan.gov.ph',
      barangayContactNumber: '+63 XXX XXX XXXX',
      systemName: 'TheyCare Portal',
      systemVersion: '1.0.0',
      maintenanceMode: false,
      allowRegistration: true,
      requireApproval: true
    }
  });

  console.log('\n⚙️  System settings initialized!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
