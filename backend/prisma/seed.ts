import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@theycare.com' },
      update: {},
      create: {
        email: 'admin@theycare.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        roles: ['SYSTEM_ADMIN'],
        status: 'ACTIVE',
        contactNumber: '09123456789',
        address: 'Barangay Hall'
      }
    }),
    prisma.user.upsert({
      where: { email: 'bhw@theycare.com' },
      update: {},
      create: {
        email: 'bhw@theycare.com',
        password: hashedPassword,
        firstName: 'Maria',
        lastName: 'Santos',
        roles: ['BHW'],
        status: 'ACTIVE',
        contactNumber: '09123456790',
        address: 'Purok 1'
      }
    }),
    prisma.user.upsert({
      where: { email: 'parent@theycare.com' },
      update: {},
      create: {
        email: 'parent@theycare.com',
        password: hashedPassword,
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        roles: ['PARENT_RESIDENT'],
        status: 'ACTIVE',
        contactNumber: '09123456791',
        address: 'Purok 2'
      }
    })
  ]);

  // Create sample patients
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        userId: users[2].id,
        firstName: 'Ana',
        lastName: 'Dela Cruz',
        dateOfBirth: new Date('2020-01-15'),
        gender: 'Female',
        bloodType: 'O+',
        address: 'Purok 2',
        contactNumber: '09123456791',
        emergencyContact: '09123456792',
        guardianName: 'Juan Dela Cruz'
      }
    }),
    prisma.patient.create({
      data: {
        firstName: 'Pedro',
        lastName: 'Garcia',
        dateOfBirth: new Date('2019-05-20'),
        gender: 'Male',
        bloodType: 'A+',
        address: 'Purok 3',
        contactNumber: '09123456793',
        emergencyContact: '09123456794',
        guardianName: 'Rosa Garcia'
      }
    })
  ]);

  // Create sample appointments
  await Promise.all([
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        healthWorkerId: users[1].id,
        appointmentDate: new Date('2024-01-15T09:00:00Z'),
        appointmentType: 'GENERAL_CHECKUP',
        status: 'COMPLETED',
        notes: 'Regular checkup completed'
      }
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        healthWorkerId: users[1].id,
        appointmentDate: new Date('2024-01-20T10:00:00Z'),
        appointmentType: 'IMMUNIZATION',
        status: 'SCHEDULED'
      }
    })
  ]);

  // Create sample immunization records
  await prisma.immunizationRecord.create({
    data: {
      patientId: patients[0].id,
      vaccineName: 'BCG',
      vaccineType: 'Live Attenuated',
      dateGiven: new Date('2020-02-15'),
      ageAtVaccination: '1 month',
      administeredBy: users[1].id,
      recordedBy: users[1].id,
      doseNumber: 1,
      isCompleted: true
    }
  });

  // Create sample daycare registration
  const daycareReg = await prisma.daycareRegistration.create({
    data: {
      parentId: users[2].id,
      childFirstName: 'Ana',
      childLastName: 'Dela Cruz',
      childDateOfBirth: new Date('2020-01-15'),
      childGender: 'Female',
      address: 'Purok 2',
      parentContact: '09123456791',
      emergencyContact: '09123456792',
      status: 'APPROVED'
    }
  });

  // Create sample daycare student
  const student = await prisma.daycareStudent.create({
    data: {
      registrationId: daycareReg.id,
      firstName: 'Ana',
      lastName: 'Dela Cruz',
      dateOfBirth: new Date('2020-01-15'),
      gender: 'Female',
      address: 'Purok 2',
      emergencyContact: '09123456792'
    }
  });

  // Create sample attendance records
  await Promise.all([
    prisma.attendanceRecord.create({
      data: {
        studentId: student.id,
        date: new Date('2024-01-15'),
        status: 'PRESENT',
        timeIn: new Date('2024-01-15T08:00:00Z'),
        timeOut: new Date('2024-01-15T16:00:00Z'),
        recordedBy: users[0].id
      }
    }),
    prisma.attendanceRecord.create({
      data: {
        studentId: student.id,
        date: new Date('2024-01-16'),
        status: 'PRESENT',
        timeIn: new Date('2024-01-16T08:00:00Z'),
        timeOut: new Date('2024-01-16T16:00:00Z'),
        recordedBy: users[0].id
      }
    })
  ]);

  // Create sample events
  const event = await prisma.event.create({
    data: {
      title: 'Youth Basketball Tournament',
      description: 'Annual basketball tournament for youth',
      eventDate: new Date('2024-02-15'),
      startTime: new Date('2024-02-15T08:00:00Z'),
      endTime: new Date('2024-02-15T17:00:00Z'),
      location: 'Barangay Basketball Court',
      category: 'Sports',
      maxParticipants: 50,
      status: 'COMPLETED',
      createdBy: users[0].id,
      publishedAt: new Date('2024-01-01')
    }
  });

  // Create sample event registration
  await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      userId: users[2].id,
      status: 'APPROVED',
      confirmedAt: new Date()
    }
  });

  // Create sample event attendance
  await prisma.eventAttendance.create({
    data: {
      eventId: event.id,
      userId: users[2].id,
      recordedBy: users[0].id
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Sample data created:');
  console.log('- 3 users (admin, bhw, parent)');
  console.log('- 2 patients');
  console.log('- 2 appointments');
  console.log('- 1 immunization record');
  console.log('- 1 daycare registration & student');
  console.log('- 2 attendance records');
  console.log('- 1 event with registration & attendance');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });