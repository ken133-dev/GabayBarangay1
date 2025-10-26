import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting sample data seeding...');

  // Get existing users
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@theycare.com' } });
  const bhwUser = await prisma.user.findUnique({ where: { email: 'bhw@theycare.com' } });
  const residentUser = await prisma.user.findUnique({ where: { email: 'parent@theycare.com' } });

  if (!adminUser || !bhwUser || !residentUser) {
    console.log('❌ Base users not found. Run the main seed first: npm run prisma:seed');
    return;
  }

  console.log('✅ Found base users');

  // Create sample patients
  console.log('📋 Creating sample patients...');
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { id: 'sample-patient-1' },
      update: {},
      create: {
        id: 'sample-patient-1',
        firstName: 'Maria',
        lastName: 'Santos',
        middleName: 'Cruz',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'Female',
        bloodType: 'O+',
        address: 'Purok 1, Main Street',
        contactNumber: '09171234567',
        emergencyContact: '09187654321',
        userId: residentUser.id
      }
    }),
    prisma.patient.upsert({
      where: { id: 'sample-patient-2' },
      update: {},
      create: {
        id: 'sample-patient-2',
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        middleName: 'Reyes',
        dateOfBirth: new Date('1990-08-20'),
        gender: 'Male',
        bloodType: 'A+',
        address: 'Purok 2, Second Street',
        contactNumber: '09181234567',
        emergencyContact: '09191234567',
        userId: residentUser.id
      }
    }),
    prisma.patient.upsert({
      where: { id: 'sample-patient-3' },
      update: {},
      create: {
        id: 'sample-patient-3',
        firstName: 'Ana',
        lastName: 'Garcia',
        middleName: 'Lopez',
        dateOfBirth: new Date('2020-03-10'),
        gender: 'Female',
        bloodType: 'B+',
        address: 'Purok 3, Third Street',
        contactNumber: '09161234567',
        emergencyContact: '09151234567'
      }
    })
  ]);
  console.log(`✅ Created ${patients.length} sample patients`);

  // Create sample appointments
  console.log('📅 Creating sample appointments...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await Promise.all([
    prisma.appointment.upsert({
      where: { id: 'sample-appointment-1' },
      update: {},
      create: {
        id: 'sample-appointment-1',
        patientId: patients[0].id,
        appointmentType: 'PRENATAL',
        appointmentDate: tomorrow,
        status: 'SCHEDULED',
        notes: 'First prenatal checkup',
        healthWorkerId: bhwUser.id
      }
    }),
    prisma.appointment.upsert({
      where: { id: 'sample-appointment-2' },
      update: {},
      create: {
        id: 'sample-appointment-2',
        patientId: patients[1].id,
        appointmentType: 'GENERAL_CHECKUP',
        appointmentDate: nextWeek,
        status: 'CONFIRMED',
        notes: 'Annual health screening',
        healthWorkerId: bhwUser.id
      }
    })
  ]);
  console.log('✅ Created sample appointments');

  // Create sample immunization records
  console.log('🏥 Creating sample immunization records...');
  await Promise.all([
    prisma.immunizationRecord.upsert({
      where: { id: 'sample-record-1' },
      update: {},
      create: {
        id: 'sample-record-1',
        patientId: patients[0].id,
        vaccineName: 'Prenatal Checkup',
        vaccineType: 'HEALTH_CHECK',
        dateGiven: new Date(),
        ageAtVaccination: '35 years',
        administeredBy: bhwUser.firstName + ' ' + bhwUser.lastName,
        recordedBy: bhwUser.id,
        doseNumber: 1,
        isCompleted: true,
        notes: 'Patient is doing well - healthy pregnancy'
      }
    })
  ]);
  console.log('✅ Created sample immunization records');

  // Create sample immunization records
  console.log('💉 Creating sample immunization records...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  await Promise.all([
    prisma.immunizationRecord.upsert({
      where: { id: 'sample-vacc-1' },
      update: {},
      create: {
        id: 'sample-vacc-1',
        patientId: patients[2].id,
        vaccineName: 'Measles-Mumps-Rubella',
        vaccineType: 'MMR',
        dosage: '0.5ml',
        dateGiven: yesterday,
        ageAtVaccination: '4 years',
        administeredBy: bhwUser.firstName + ' ' + bhwUser.lastName,
        recordedBy: bhwUser.id,
        doseNumber: 1,
        nextDueDate: oneMonthFromNow,
        batchNumber: 'MMR2024-001',
        isCompleted: true
      }
    }),
    prisma.immunizationRecord.upsert({
      where: { id: 'sample-vacc-2' },
      update: {},
      create: {
        id: 'sample-vacc-2',
        patientId: patients[2].id,
        vaccineName: 'BCG Vaccine',
        vaccineType: 'BCG',
        dosage: '0.1ml',
        dateGiven: new Date('2020-04-01'),
        ageAtVaccination: '3 months',
        administeredBy: bhwUser.firstName + ' ' + bhwUser.lastName,
        recordedBy: bhwUser.id,
        doseNumber: 1,
        batchNumber: 'BCG2020-045',
        isCompleted: true
      }
    })
  ]);
  console.log('✅ Created sample immunization records');

  // Create sample events
  console.log('📅 Creating sample SK events...');
  const eventDate1 = new Date();
  eventDate1.setDate(eventDate1.getDate() + 14);
  const eventDate2 = new Date();
  eventDate2.setDate(eventDate2.getDate() + 30);

  const events = await Promise.all([
    prisma.event.upsert({
      where: { id: 'sample-event-1' },
      update: {},
      create: {
        id: 'sample-event-1',
        title: 'Community Basketball Tournament',
        description: 'Annual inter-purok basketball tournament. All youth are invited to participate!',
        eventDate: eventDate1,
        startTime: new Date(eventDate1.setHours(14, 0, 0, 0)),
        endTime: new Date(eventDate1.setHours(18, 0, 0, 0)),
        location: 'Barangay Covered Court',
        category: 'SPORTS',
        maxParticipants: 100,
        status: 'PUBLISHED',
        createdBy: adminUser.id
      }
    }),
    prisma.event.upsert({
      where: { id: 'sample-event-2' },
      update: {},
      create: {
        id: 'sample-event-2',
        title: 'Youth Leadership Training',
        description: 'Skills development workshop for aspiring youth leaders. Free snacks and certificates provided.',
        eventDate: eventDate2,
        startTime: new Date(eventDate2.setHours(9, 0, 0, 0)),
        endTime: new Date(eventDate2.setHours(16, 0, 0, 0)),
        location: 'Barangay Hall - Conference Room',
        category: 'TRAINING',
        maxParticipants: 50,
        status: 'PUBLISHED',
        createdBy: adminUser.id
      }
    })
  ]);
  console.log('✅ Created sample events');

  // Create sample event registrations
  console.log('📝 Creating sample event registrations...');
  await Promise.all([
    prisma.eventRegistration.upsert({
      where: { id: 'sample-event-reg-1' },
      update: {},
      create: {
        id: 'sample-event-reg-1',
        eventId: events[0].id,
        userId: residentUser.id,
        status: 'APPROVED'
      }
    })
  ]);
  console.log('✅ Created sample event registrations');

  // Create sample daycare registrations first
  console.log('📝 Creating sample daycare registrations...');
  const registrations = await Promise.all([
    prisma.daycareRegistration.upsert({
      where: { id: 'sample-reg-1' },
      update: {},
      create: {
        id: 'sample-reg-1',
        parentId: residentUser.id,
        childFirstName: 'Miguel',
        childLastName: 'Santos',
        childMiddleName: 'Cruz',
        childDateOfBirth: new Date('2020-01-15'),
        childGender: 'Male',
        address: 'Purok 1, Main Street',
        parentContact: '09171234567',
        emergencyContact: '09187654321',
        status: 'APPROVED'
      }
    }),
    prisma.daycareRegistration.upsert({
      where: { id: 'sample-reg-2' },
      update: {},
      create: {
        id: 'sample-reg-2',
        parentId: residentUser.id,
        childFirstName: 'Sofia',
        childLastName: 'Reyes',
        childMiddleName: 'Garcia',
        childDateOfBirth: new Date('2021-03-20'),
        childGender: 'Female',
        address: 'Purok 2, Second Street',
        parentContact: '09181234567',
        emergencyContact: '09191234567',
        status: 'APPROVED'
      }
    })
  ]);
  console.log(`✅ Created ${registrations.length} sample daycare registrations`);

  // Create sample daycare students
  console.log('👶 Creating sample daycare students...');
  const students = await Promise.all([
    prisma.daycareStudent.upsert({
      where: { id: 'sample-student-1' },
      update: {},
      create: {
        id: 'sample-student-1',
        firstName: 'Miguel',
        lastName: 'Santos',
        middleName: 'Cruz',
        dateOfBirth: new Date('2020-01-15'),
        gender: 'Male',
        address: 'Purok 1, Main Street',
        emergencyContact: '09187654321',
        registrationId: registrations[0].id
      }
    }),
    prisma.daycareStudent.upsert({
      where: { id: 'sample-student-2' },
      update: {},
      create: {
        id: 'sample-student-2',
        firstName: 'Sofia',
        lastName: 'Reyes',
        middleName: 'Garcia',
        dateOfBirth: new Date('2021-03-20'),
        gender: 'Female',
        address: 'Purok 2, Second Street',
        emergencyContact: '09191234567',
        registrationId: registrations[1].id
      }
    })
  ]);
  console.log('✅ Created sample daycare students');

  // Create sample attendance records
  console.log('✅ Creating sample attendance records...');
  const today = new Date();
  await Promise.all([
    prisma.attendanceRecord.upsert({
      where: { id: 'sample-attendance-1' },
      update: {},
      create: {
        id: 'sample-attendance-1',
        studentId: students[0].id,
        date: today,
        status: 'PRESENT',
        timeIn: new Date(today.setHours(7, 30, 0, 0)),
        timeOut: new Date(today.setHours(16, 0, 0, 0)),
        recordedBy: 'Teacher Cruz'
      }
    }),
    prisma.attendanceRecord.upsert({
      where: { id: 'sample-attendance-2' },
      update: {},
      create: {
        id: 'sample-attendance-2',
        studentId: students[1].id,
        date: today,
        status: 'PRESENT',
        timeIn: new Date(today.setHours(7, 45, 0, 0)),
        timeOut: new Date(today.setHours(16, 0, 0, 0)),
        recordedBy: 'Teacher Cruz'
      }
    })
  ]);
  console.log('✅ Created sample attendance records');

  // Create sample announcements
  console.log('📢 Creating sample announcements...');
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  await Promise.all([
    prisma.announcement.upsert({
      where: { id: 'sample-announcement-1' },
      update: {},
      create: {
        id: 'sample-announcement-1',
        title: 'Free Health Check-up this Weekend',
        content: 'The Barangay Health Center is offering FREE health check-ups this Saturday, 8AM-12PM. All residents are welcome. Please bring your Barangay ID.',
        category: 'HEALTH',
        priority: 'HIGH',
        publishedAt: new Date(),
        expiresAt: expiryDate,
        publishedBy: adminUser.firstName + ' ' + adminUser.lastName
      }
    }),
    prisma.announcement.upsert({
      where: { id: 'sample-announcement-2' },
      update: {},
      create: {
        id: 'sample-announcement-2',
        title: 'Daycare Enrollment Now Open',
        content: 'Enrollment for the next school year is now open! Visit the Daycare Center or register online through the portal. Limited slots available.',
        category: 'DAYCARE',
        priority: 'NORMAL',
        publishedAt: new Date(),
        expiresAt: expiryDate,
        publishedBy: adminUser.firstName + ' ' + adminUser.lastName
      }
    })
  ]);
  console.log('✅ Created sample announcements');

  // Create sample notifications
  console.log('🔔 Creating sample notifications...');
  await Promise.all([
    prisma.notification.upsert({
      where: { id: 'sample-notif-1' },
      update: {},
      create: {
        id: 'sample-notif-1',
        userId: residentUser.id,
        type: 'IN_APP',
        title: 'Upcoming Appointment',
        message: 'You have an appointment scheduled for tomorrow at 9:00 AM',
        isRead: false
      }
    }),
    prisma.notification.upsert({
      where: { id: 'sample-notif-2' },
      update: {},
      create: {
        id: 'sample-notif-2',
        userId: residentUser.id,
        type: 'IN_APP',
        title: 'Event Registration Confirmed',
        message: 'Your registration for Community Basketball Tournament has been approved!',
        isRead: false
      }
    })
  ]);
  console.log('✅ Created sample notifications');

  console.log('\n🎉 Sample data seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Patients: ${patients.length}`);
  console.log(`   Appointments: 2`);
  console.log(`   Immunization Records: 3`);
  console.log(`   Events: ${events.length}`);
  console.log(`   Event Registrations: 1`);
  console.log(`   Daycare Students: ${students.length}`);
  console.log(`   Attendance Records: 2`);
  console.log(`   Announcements: 2`);
  console.log(`   Notifications: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Sample data seeding error:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
