import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'SYSTEM_ADMIN' },
      update: {},
      create: {
        name: 'SYSTEM_ADMIN',
        displayName: 'System Administrator',
        description: 'Full system access and administration',
        permissions: [
          'USER_CREATE', 'USER_READ', 'USER_UPDATE', 'USER_DELETE', 'USER_SUSPEND', 'USER_APPROVE',
          'ROLE_CREATE', 'ROLE_READ', 'ROLE_UPDATE', 'ROLE_DELETE',
          'PATIENT_CREATE', 'PATIENT_READ', 'PATIENT_UPDATE', 'PATIENT_DELETE', 'APPOINTMENT_MANAGE', 'IMMUNIZATION_MANAGE',
          'DAYCARE_STUDENT_MANAGE', 'DAYCARE_ATTENDANCE_MANAGE', 'DAYCARE_REPORTS',
          'EVENT_MANAGE', 'EVENT_ATTENDANCE',
          'SYSTEM_SETTINGS', 'AUDIT_LOGS', 'ANNOUNCEMENTS_MANAGE',
          'REPORTS_VIEW', 'REPORTS_GENERATE'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'BARANGAY_CAPTAIN' },
      update: {},
      create: {
        name: 'BARANGAY_CAPTAIN',
        displayName: 'Barangay Captain',
        description: 'Barangay leadership and oversight',
        permissions: [
          'USER_READ', 'USER_UPDATE', 'USER_APPROVE',
          'PATIENT_READ', 'APPOINTMENT_MANAGE',
          'DAYCARE_STUDENT_MANAGE', 'DAYCARE_ATTENDANCE_MANAGE',
          'EVENT_MANAGE', 'EVENT_ATTENDANCE',
          'REPORTS_VIEW', 'REPORTS_GENERATE'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'BARANGAY_OFFICIAL' },
      update: {},
      create: {
        name: 'BARANGAY_OFFICIAL',
        displayName: 'Barangay Official',
        description: 'Barangay administrative staff',
        permissions: [
          'USER_READ', 'USER_UPDATE', 'USER_APPROVE',
          'PATIENT_READ', 'APPOINTMENT_MANAGE',
          'REPORTS_VIEW'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'BHW' },
      update: {},
      create: {
        name: 'BHW',
        displayName: 'Barangay Health Worker',
        description: 'Health services and patient care',
        permissions: [
          'PATIENT_CREATE', 'PATIENT_READ', 'PATIENT_UPDATE',
          'APPOINTMENT_MANAGE', 'IMMUNIZATION_MANAGE',
          'REPORTS_VIEW'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'BHW_COORDINATOR' },
      update: {},
      create: {
        name: 'BHW_COORDINATOR',
        displayName: 'BHW Coordinator',
        description: 'Coordinates barangay health workers',
        permissions: [
          'PATIENT_CREATE', 'PATIENT_READ', 'PATIENT_UPDATE', 'PATIENT_DELETE',
          'APPOINTMENT_MANAGE', 'IMMUNIZATION_MANAGE',
          'USER_READ', 'USER_UPDATE',
          'REPORTS_VIEW', 'REPORTS_GENERATE'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'DAYCARE_STAFF' },
      update: {},
      create: {
        name: 'DAYCARE_STAFF',
        displayName: 'Daycare Staff',
        description: 'Daycare operations and student management',
        permissions: [
          'DAYCARE_STUDENT_MANAGE', 'DAYCARE_ATTENDANCE_MANAGE', 'DAYCARE_REPORTS'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'DAYCARE_TEACHER' },
      update: {},
      create: {
        name: 'DAYCARE_TEACHER',
        displayName: 'Daycare Teacher',
        description: 'Daycare teaching and student development',
        permissions: [
          'DAYCARE_STUDENT_MANAGE', 'DAYCARE_ATTENDANCE_MANAGE', 'DAYCARE_REPORTS'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'SK_OFFICER' },
      update: {},
      create: {
        name: 'SK_OFFICER',
        displayName: 'SK Officer',
        description: 'Sangguniang Kabataan operations',
        permissions: [
          'EVENT_MANAGE', 'EVENT_ATTENDANCE', 'REPORTS_VIEW'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'SK_CHAIRMAN' },
      update: {},
      create: {
        name: 'SK_CHAIRMAN',
        displayName: 'SK Chairman',
        description: 'Sangguniang Kabataan leadership',
        permissions: [
          'EVENT_MANAGE', 'EVENT_ATTENDANCE',
          'USER_READ', 'USER_UPDATE', 'USER_APPROVE',
          'REPORTS_VIEW', 'REPORTS_GENERATE'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'PARENT_RESIDENT' },
      update: {},
      create: {
        name: 'PARENT_RESIDENT',
        displayName: 'Parent/Resident',
        description: 'Basic resident access',
        permissions: [
          'USER_READ'
        ],
        isSystem: true,
        isActive: true
      }
    }),
    prisma.role.upsert({
      where: { name: 'VISITOR' },
      update: {},
      create: {
        name: 'VISITOR',
        displayName: 'Visitor',
        description: 'Limited public access',
        permissions: [],
        isSystem: true,
        isActive: true
      }
    }),
    // Custom role for testing edit/delete functionality
    prisma.role.upsert({
      where: { name: 'CUSTOM_ROLE' },
      update: {},
      create: {
        name: 'CUSTOM_ROLE',
        displayName: 'Custom Role',
        description: 'A custom role for testing edit and delete functionality',
        permissions: [
          'USER_READ',
          'REPORTS_VIEW'
        ],
        isSystem: false,
        isActive: true
      }
    })
  ]);

  // Create sample users with role assignments
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
        roles: {
          connect: [{ id: roles[0].id }] // SYSTEM_ADMIN
        },
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
        roles: {
          connect: [{ id: roles[2].id }] // BHW
        },
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
        roles: {
          connect: [{ id: roles[5].id }] // PARENT_RESIDENT
        },
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
  console.log('- 11 roles (SYSTEM_ADMIN, BARANGAY_CAPTAIN, BARANGAY_OFFICIAL, BHW, BHW_COORDINATOR, DAYCARE_STAFF, DAYCARE_TEACHER, SK_OFFICER, SK_CHAIRMAN, PARENT_RESIDENT, VISITOR)');
  console.log('- 3 users (admin, bhw, parent) with assigned roles');
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