import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting sample data seeding...');

  // Get existing users
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@theycare.local' } });
  const bhwUser = await prisma.user.findUnique({ where: { email: 'bhw@theycare.local' } });
  const residentUser = await prisma.user.findUnique({ where: { email: 'resident@theycare.local' } });

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

  // Create sample health records
  console.log('🏥 Creating sample health records...');
  await Promise.all([
    prisma.healthRecord.upsert({
      where: { id: 'sample-record-1' },
      update: {},
      create: {
        id: 'sample-record-1',
        patientId: patients[0].id,
        recordDate: new Date(),
        diagnosis: 'Healthy pregnancy',
        treatment: 'Prenatal vitamins prescribed',
        medications: 'Folic acid, Iron supplements',
        vitalSigns: {
          bloodPressure: '120/80',
          temperature: '36.5',
          heartRate: '72',
          weight: '65'
        },
        notes: 'Patient is doing well'
      }
    })
  ]);
  console.log('✅ Created sample health records');

  // Create sample vaccinations
  console.log('💉 Creating sample vaccinations...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  await Promise.all([
    prisma.vaccination.upsert({
      where: { id: 'sample-vacc-1' },
      update: {},
      create: {
        id: 'sample-vacc-1',
        patientId: patients[2].id,
        vaccineName: 'Measles-Mumps-Rubella',
        vaccineType: 'MMR',
        dosage: '0.5ml',
        dateGiven: yesterday,
        nextDueDate: oneMonthFromNow,
        administeredBy: bhwUser.firstName + ' ' + bhwUser.lastName,
        batchNumber: 'MMR2024-001'
      }
    }),
    prisma.vaccination.upsert({
      where: { id: 'sample-vacc-2' },
      update: {},
      create: {
        id: 'sample-vacc-2',
        patientId: patients[2].id,
        vaccineName: 'BCG Vaccine',
        vaccineType: 'BCG',
        dosage: '0.1ml',
        dateGiven: new Date('2020-04-01'),
        administeredBy: bhwUser.firstName + ' ' + bhwUser.lastName,
        batchNumber: 'BCG2020-045'
      }
    })
  ]);
  console.log('✅ Created sample vaccinations');

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
        status: 'UPCOMING'
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
        status: 'UPCOMING'
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
        contactInfo: residentUser.contactNumber || '09171234567',
        status: 'APPROVED'
      }
    })
  ]);
  console.log('✅ Created sample event registrations');

  // Create sample daycare students
  console.log('👶 Creating sample daycare students...');
  const students = await Promise.all([
    prisma.daycareStudent.upsert({
      where: { id: 'sample-student-1' },
      update: {},
      create: {
        id: 'sample-student-1',
        childFirstName: 'Miguel',
        childLastName: 'Santos',
        childMiddleName: 'Cruz',
        childDateOfBirth: new Date('2020-01-15'),
        childGender: 'Male',
        parentId: residentUser.id,
        address: 'Purok 1, Main Street',
        parentContact: '09171234567',
        emergencyContact: '09187654321',
        enrollmentDate: new Date('2024-06-01'),
        status: 'ACTIVE'
      }
    }),
    prisma.daycareStudent.upsert({
      where: { id: 'sample-student-2' },
      update: {},
      create: {
        id: 'sample-student-2',
        childFirstName: 'Sofia',
        childLastName: 'Reyes',
        childMiddleName: 'Garcia',
        childDateOfBirth: new Date('2021-03-20'),
        childGender: 'Female',
        parentId: residentUser.id,
        address: 'Purok 2, Second Street',
        parentContact: '09181234567',
        emergencyContact: '09191234567',
        enrollmentDate: new Date('2024-06-01'),
        status: 'ACTIVE'
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
        timeOut: new Date(today.setHours(16, 0, 0, 0))
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
        timeOut: new Date(today.setHours(16, 0, 0, 0))
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
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: expiryDate,
        createdBy: adminUser.firstName + ' ' + adminUser.lastName
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
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: expiryDate,
        createdBy: adminUser.firstName + ' ' + adminUser.lastName
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
        type: 'APPOINTMENT',
        title: 'Upcoming Appointment',
        message: 'You have an appointment scheduled for tomorrow at 9:00 AM',
        isRead: false,
        relatedType: 'APPOINTMENT',
        relatedId: 'sample-appointment-1'
      }
    }),
    prisma.notification.upsert({
      where: { id: 'sample-notif-2' },
      update: {},
      create: {
        id: 'sample-notif-2',
        userId: residentUser.id,
        type: 'EVENT',
        title: 'Event Registration Confirmed',
        message: 'Your registration for Community Basketball Tournament has been approved!',
        isRead: false,
        relatedType: 'EVENT',
        relatedId: events[0].id
      }
    })
  ]);
  console.log('✅ Created sample notifications');

  console.log('\n🎉 Sample data seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Patients: ${patients.length}`);
  console.log(`   Appointments: 2`);
  console.log(`   Health Records: 1`);
  console.log(`   Vaccinations: 2`);
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
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
