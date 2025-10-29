import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default roles with navigation permissions
  const roles = await Promise.all([
    // SYSTEM_ADMIN - Full access to everything
    prisma.role.upsert({
      where: { name: 'SYSTEM_ADMIN' },
      update: {},
      create: {
        name: 'SYSTEM_ADMIN',
        displayName: 'System Administrator',
        description: 'Full system access and administration',
        permissions: [
          // Administrative
          'ADMIN_DASHBOARD', 'USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'SYSTEM_SETTINGS', 'AUDIT_LOGS', 'BACKUP_MANAGEMENT', 'ANNOUNCEMENTS', 'BROADCAST_MANAGEMENT',
          // Health Services
          'HEALTH_DASHBOARD', 'PATIENT_MANAGEMENT', 'APPOINTMENTS', 'HEALTH_RECORDS', 'VACCINATIONS', 'MY_HEALTH_RECORDS',
          // Daycare Services
          'DAYCARE_DASHBOARD', 'CHILD_REGISTRATION', 'STUDENT_REGISTRATIONS', 'ATTENDANCE_TRACKING', 'PROGRESS_REPORTS', 'LEARNING_MATERIALS', 'EDUCATIONAL_RESOURCES', 'DAYCARE_CERTIFICATES',
          // SK Engagement
          'SK_DASHBOARD', 'EVENT_MANAGEMENT', 'EVENT_REGISTRATION', 'ATTENDANCE_ANALYTICS', 'SK_ANALYTICS', 'MY_EVENT_REGISTRATIONS', 'SK_CERTIFICATES',
          // Reports & Analytics
          'REPORTS_DASHBOARD', 'HEALTH_REPORTS', 'DAYCARE_REPORTS', 'SK_REPORTS', 'CROSS_MODULE_ANALYTICS', 'HEALTH_STATS',
          // Public Access
          'PUBLIC_ANNOUNCEMENTS', 'PUBLIC_EVENTS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // BARANGAY_CAPTAIN - Leadership oversight
    prisma.role.upsert({
      where: { name: 'BARANGAY_CAPTAIN' },
      update: {},
      create: {
        name: 'BARANGAY_CAPTAIN',
        displayName: 'Barangay Captain',
        description: 'Barangay leadership and oversight',
        permissions: [
          // Administrative
          'ADMIN_DASHBOARD', 'USER_MANAGEMENT', 'ANNOUNCEMENTS', 'BROADCAST_MANAGEMENT',
          // Health Services
          'HEALTH_DASHBOARD', 'PATIENT_MANAGEMENT', 'APPOINTMENTS', 'HEALTH_RECORDS',
          // Daycare Services
          'DAYCARE_DASHBOARD', 'STUDENT_REGISTRATIONS', 'ATTENDANCE_TRACKING', 'PROGRESS_REPORTS',
          // SK Engagement
          'SK_DASHBOARD', 'EVENT_MANAGEMENT', 'ATTENDANCE_ANALYTICS', 'SK_ANALYTICS',
          // Reports & Analytics
          'REPORTS_DASHBOARD', 'HEALTH_REPORTS', 'DAYCARE_REPORTS', 'SK_REPORTS', 'CROSS_MODULE_ANALYTICS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // BARANGAY_OFFICIAL - Administrative staff
    prisma.role.upsert({
      where: { name: 'BARANGAY_OFFICIAL' },
      update: {},
      create: {
        name: 'BARANGAY_OFFICIAL',
        displayName: 'Barangay Official',
        description: 'Barangay administrative staff',
        permissions: [
          // Administrative
          'ADMIN_DASHBOARD', 'USER_MANAGEMENT', 'ANNOUNCEMENTS',
          // Health Services
          'HEALTH_DASHBOARD', 'PATIENT_MANAGEMENT', 'APPOINTMENTS',
          // Daycare Services
          'DAYCARE_DASHBOARD', 'STUDENT_REGISTRATIONS',
          // SK Engagement
          'SK_DASHBOARD', 'EVENT_MANAGEMENT',
          // Reports & Analytics
          'REPORTS_DASHBOARD', 'HEALTH_REPORTS', 'DAYCARE_REPORTS', 'SK_REPORTS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // BHW - Health services focus
    prisma.role.upsert({
      where: { name: 'BHW' },
      update: {},
      create: {
        name: 'BHW',
        displayName: 'Barangay Health Worker',
        description: 'Health services and patient care',
        permissions: [
          // Health Services
          'HEALTH_DASHBOARD', 'PATIENT_MANAGEMENT', 'APPOINTMENTS', 'HEALTH_RECORDS', 'VACCINATIONS',
          // Reports & Analytics
          'REPORTS_DASHBOARD', 'HEALTH_REPORTS', 'HEALTH_STATS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // BHW_COORDINATOR - Health services coordination
    prisma.role.upsert({
      where: { name: 'BHW_COORDINATOR' },
      update: {},
      create: {
        name: 'BHW_COORDINATOR',
        displayName: 'BHW Coordinator',
        description: 'Coordinates barangay health workers',
        permissions: [
          // Administrative
          'USER_MANAGEMENT',
          // Health Services
          'HEALTH_DASHBOARD', 'PATIENT_MANAGEMENT', 'APPOINTMENTS', 'HEALTH_RECORDS', 'VACCINATIONS',
          // Reports & Analytics
          'REPORTS_DASHBOARD', 'HEALTH_REPORTS', 'HEALTH_STATS', 'CROSS_MODULE_ANALYTICS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // DAYCARE_STAFF - Daycare operations
    prisma.role.upsert({
      where: { name: 'DAYCARE_STAFF' },
      update: {},
      create: {
        name: 'DAYCARE_STAFF',
        displayName: 'Daycare Staff',
        description: 'Daycare operations and student management',
        permissions: [
          // Daycare Services
          'DAYCARE_DASHBOARD', 'STUDENT_REGISTRATIONS', 'ATTENDANCE_TRACKING', 'LEARNING_MATERIALS',
          // Reports & Analytics
          'REPORTS_DASHBOARD', 'DAYCARE_REPORTS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // DAYCARE_TEACHER - Daycare teaching
    prisma.role.upsert({
      where: { name: 'DAYCARE_TEACHER' },
      update: {},
      create: {
        name: 'DAYCARE_TEACHER',
        displayName: 'Daycare Teacher',
        description: 'Daycare teaching and student development',
        permissions: [
          // Daycare Services
          'DAYCARE_DASHBOARD', 'STUDENT_REGISTRATIONS', 'ATTENDANCE_TRACKING', 'PROGRESS_REPORTS', 'LEARNING_MATERIALS', 'EDUCATIONAL_RESOURCES', 'DAYCARE_CERTIFICATES',
          // Reports & Analytics
          'REPORTS_DASHBOARD', 'DAYCARE_REPORTS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // SK_OFFICER - SK operations
    prisma.role.upsert({
      where: { name: 'SK_OFFICER' },
      update: {},
      create: {
        name: 'SK_OFFICER',
        displayName: 'SK Officer',
        description: 'Sangguniang Kabataan operations',
        permissions: [
          // SK Engagement
          'SK_DASHBOARD', 'EVENT_MANAGEMENT', 'EVENT_REGISTRATION', 'ATTENDANCE_ANALYTICS',
          // Reports & Analytics
          'REPORTS_DASHBOARD', 'SK_REPORTS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // SK_CHAIRMAN - SK leadership
    prisma.role.upsert({
      where: { name: 'SK_CHAIRMAN' },
      update: {},
      create: {
        name: 'SK_CHAIRMAN',
        displayName: 'SK Chairman',
        description: 'Sangguniang Kabataan leadership',
        permissions: [
          // Administrative
          'USER_MANAGEMENT',
          // SK Engagement
          'SK_DASHBOARD', 'EVENT_MANAGEMENT', 'EVENT_REGISTRATION', 'ATTENDANCE_ANALYTICS', 'SK_ANALYTICS', 'SK_CERTIFICATES',
          // Reports & Analytics
          'REPORTS_DASHBOARD', 'SK_REPORTS', 'CROSS_MODULE_ANALYTICS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // PARENT_RESIDENT - Parent/resident access
    prisma.role.upsert({
      where: { name: 'PARENT_RESIDENT' },
      update: {},
      create: {
        name: 'PARENT_RESIDENT',
        displayName: 'Parent/Resident',
        description: 'Basic resident access',
        permissions: [
          // Health Services
          'MY_HEALTH_RECORDS',
          // Daycare Services
          'CHILD_REGISTRATION', 'EDUCATIONAL_RESOURCES',
          // SK Engagement
          'EVENT_REGISTRATION', 'MY_EVENT_REGISTRATIONS',
          // Public Access
          'PUBLIC_ANNOUNCEMENTS', 'PUBLIC_EVENTS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // VISITOR - Limited public access
    prisma.role.upsert({
      where: { name: 'VISITOR' },
      update: {},
      create: {
        name: 'VISITOR',
        displayName: 'Visitor',
        description: 'Limited public access',
        permissions: [
          // Public Access
          'PUBLIC_ANNOUNCEMENTS', 'PUBLIC_EVENTS'
        ],
        isSystem: true,
        isActive: true
      }
    }),

    // CUSTOM_ROLE - For testing
    prisma.role.upsert({
      where: { name: 'CUSTOM_ROLE' },
      update: {},
      create: {
        name: 'CUSTOM_ROLE',
        displayName: 'Custom Role',
        description: 'A custom role for testing edit and delete functionality',
        permissions: [
          'PUBLIC_ANNOUNCEMENTS', 'PUBLIC_EVENTS'
        ],
        isSystem: false,
        isActive: true
      }
    })
  ]);

  console.log(`✅ Created ${roles.length} roles`);

  // Create sample users with role assignments
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    // System Admin
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

    // Barangay Captain
    prisma.user.upsert({
      where: { email: 'captain@theycare.com' },
      update: {},
      create: {
        email: 'captain@theycare.com',
        password: hashedPassword,
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        roles: {
          connect: [{ id: roles[1].id }] // BARANGAY_CAPTAIN
        },
        status: 'ACTIVE',
        contactNumber: '09123456788',
        address: 'Barangay Hall'
      }
    }),

    // BHW
    prisma.user.upsert({
      where: { email: 'bhw@theycare.com' },
      update: {},
      create: {
        email: 'bhw@theycare.com',
        password: hashedPassword,
        firstName: 'Maria',
        lastName: 'Santos',
        roles: {
          connect: [{ id: roles[3].id }] // BHW
        },
        status: 'ACTIVE',
        contactNumber: '09123456790',
        address: 'Purok 1'
      }
    }),

    // Daycare Teacher
    prisma.user.upsert({
      where: { email: 'teacher@theycare.com' },
      update: {},
      create: {
        email: 'teacher@theycare.com',
        password: hashedPassword,
        firstName: 'Ana',
        lastName: 'Garcia',
        roles: {
          connect: [{ id: roles[6].id }] // DAYCARE_TEACHER
        },
        status: 'ACTIVE',
        contactNumber: '09123456787',
        address: 'Purok 3'
      }
    }),

    // SK Chairman
    prisma.user.upsert({
      where: { email: 'sk@theycare.com' },
      update: {},
      create: {
        email: 'sk@theycare.com',
        password: hashedPassword,
        firstName: 'Pedro',
        lastName: 'Reyes',
        roles: {
          connect: [{ id: roles[8].id }] // SK_CHAIRMAN
        },
        status: 'ACTIVE',
        contactNumber: '09123456786',
        address: 'Purok 4'
      }
    }),

    // Parent/Resident
    prisma.user.upsert({
      where: { email: 'parent@theycare.com' },
      update: {},
      create: {
        email: 'parent@theycare.com',
        password: hashedPassword,
        firstName: 'Rosa',
        lastName: 'Martinez',
        roles: {
          connect: [{ id: roles[9].id }] // PARENT_RESIDENT
        },
        status: 'ACTIVE',
        contactNumber: '09123456791',
        address: 'Purok 2'
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample patients
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        userId: users[5].id, // Parent user
        firstName: 'Ana',
        lastName: 'Martinez',
        dateOfBirth: new Date('2020-01-15'),
        gender: 'Female',
        bloodType: 'O+',
        address: 'Purok 2',
        contactNumber: '09123456791',
        emergencyContact: '09123456792',
        guardianName: 'Rosa Martinez',
        guardianUserId: users[5].id
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
        guardianName: 'Ana Garcia'
      }
    })
  ]);

  console.log(`✅ Created ${patients.length} patients`);

  // Create sample appointments
  await Promise.all([
    prisma.appointment.create({
      data: {
        patientId: patients[0].id,
        healthWorkerId: users[2].id, // BHW
        appointmentDate: new Date('2024-01-15T09:00:00Z'),
        appointmentType: 'GENERAL_CHECKUP',
        status: 'COMPLETED',
        notes: 'Regular checkup completed'
      }
    }),
    prisma.appointment.create({
      data: {
        patientId: patients[1].id,
        healthWorkerId: users[2].id, // BHW
        appointmentDate: new Date('2024-01-20T10:00:00Z'),
        appointmentType: 'IMMUNIZATION',
        status: 'SCHEDULED'
      }
    })
  ]);

  console.log('✅ Created sample appointments');

  // Create sample immunization records
  await prisma.immunizationRecord.create({
    data: {
      patientId: patients[0].id,
      vaccineName: 'BCG',
      vaccineType: 'Live Attenuated',
      dateGiven: new Date('2020-02-15'),
      ageAtVaccination: '1 month',
      administeredBy: 'Dr. Santos',
      recordedBy: users[2].id, // BHW
      doseNumber: 1,
      isCompleted: true
    }
  });

  console.log('✅ Created sample immunization records');

  // Create immunization schedule
  await Promise.all([
    prisma.immunizationSchedule.upsert({
      where: {
        vaccineName_doseNumber_ageInDays: {
          vaccineName: 'BCG',
          doseNumber: 1,
          ageInDays: 0
        }
      },
      update: {},
      create: {
        vaccineName: 'BCG',
        vaccineType: 'Live Attenuated',
        recommendedAge: 'Birth',
        ageInDays: 0,
        doseNumber: 1,
        isRequired: true,
        description: 'Bacillus Calmette-Guérin vaccine for tuberculosis'
      }
    }),
    prisma.immunizationSchedule.upsert({
      where: {
        vaccineName_doseNumber_ageInDays: {
          vaccineName: 'Hepatitis B',
          doseNumber: 1,
          ageInDays: 0
        }
      },
      update: {},
      create: {
        vaccineName: 'Hepatitis B',
        vaccineType: 'Inactivated',
        recommendedAge: 'Birth',
        ageInDays: 0,
        doseNumber: 1,
        isRequired: true,
        description: 'First dose of Hepatitis B vaccine'
      }
    }),
    prisma.immunizationSchedule.upsert({
      where: {
        vaccineName_doseNumber_ageInDays: {
          vaccineName: 'DPT',
          doseNumber: 1,
          ageInDays: 42
        }
      },
      update: {},
      create: {
        vaccineName: 'DPT',
        vaccineType: 'Inactivated',
        recommendedAge: '6 weeks',
        ageInDays: 42,
        doseNumber: 1,
        isRequired: true,
        description: 'Diphtheria, Pertussis, and Tetanus vaccine'
      }
    })
  ]);

  console.log('✅ Created immunization schedules');

  // Create sample daycare registration
  const daycareRegistration = await prisma.daycareRegistration.create({
    data: {
      parentId: users[5].id, // Parent user
      childFirstName: 'Ana',
      childLastName: 'Martinez',
      childDateOfBirth: new Date('2021-03-10'),
      childGender: 'Female',
      address: 'Purok 2',
      parentContact: '09123456791',
      emergencyContact: '09123456792',
      status: 'APPROVED'
    }
  });

  // Create daycare student
  const daycareStudent = await prisma.daycareStudent.create({
    data: {
      registrationId: daycareRegistration.id,
      firstName: 'Ana',
      lastName: 'Martinez',
      dateOfBirth: new Date('2021-03-10'),
      gender: 'Female',
      address: 'Purok 2',
      emergencyContact: '09123456792',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Created sample daycare registration and student');

  // Create attendance records
  await Promise.all([
    prisma.attendanceRecord.create({
      data: {
        studentId: daycareStudent.id,
        date: new Date('2024-01-15'),
        status: 'PRESENT',
        timeIn: new Date('2024-01-15T08:00:00Z'),
        timeOut: new Date('2024-01-15T16:00:00Z'),
        recordedBy: users[3].id // Daycare Teacher
      }
    }),
    prisma.attendanceRecord.create({
      data: {
        studentId: daycareStudent.id,
        date: new Date('2024-01-16'),
        status: 'LATE',
        timeIn: new Date('2024-01-16T08:30:00Z'),
        timeOut: new Date('2024-01-16T16:00:00Z'),
        remarks: 'Arrived 30 minutes late',
        recordedBy: users[3].id // Daycare Teacher
      }
    })
  ]);

  console.log('✅ Created attendance records');

  // Create learning materials
  await Promise.all([
    prisma.learningMaterial.create({
      data: {
        title: 'ABC Learning Cards',
        description: 'Colorful alphabet learning cards for preschoolers',
        fileUrl: '/materials/abc-cards.pdf',
        fileType: 'PDF',
        category: 'Alphabet',
        uploadedBy: users[3].id, // Daycare Teacher
        isPublic: true
      }
    }),
    prisma.learningMaterial.create({
      data: {
        title: 'Number Recognition Worksheets',
        description: 'Worksheets for teaching number recognition 1-10',
        fileUrl: '/materials/numbers-worksheet.pdf',
        fileType: 'PDF',
        category: 'Mathematics',
        uploadedBy: users[3].id, // Daycare Teacher
        isPublic: true
      }
    })
  ]);

  console.log('✅ Created learning materials');

  // Create progress reports
  await prisma.progressReport.create({
    data: {
      studentId: daycareStudent.id,
      reportingPeriod: 'January 2024',
      academicPerformance: 'Excellent progress in alphabet recognition and basic counting',
      socialBehavior: 'Plays well with others, shares toys appropriately',
      physicalDevelopment: 'Good motor skills development, active participation in physical activities',
      emotionalDevelopment: 'Shows confidence and independence, expresses emotions appropriately',
      recommendations: 'Continue encouraging reading activities at home',
      generatedBy: users[3].id // Daycare Teacher
    }
  });

  console.log('✅ Created progress reports');

  // Create sample events
  const event = await prisma.event.create({
    data: {
      title: 'Youth Leadership Training',
      description: 'Training program for young leaders in the community',
      eventDate: new Date('2024-02-15'),
      startTime: new Date('2024-02-15T09:00:00Z'),
      endTime: new Date('2024-02-15T17:00:00Z'),
      location: 'Barangay Hall',
      category: 'Training',
      maxParticipants: 50,
      status: 'PUBLISHED',
      createdBy: users[4].id // SK Chairman
    }
  });

  console.log('✅ Created sample events');

  // Create event registrations
  await Promise.all([
    prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: users[5].id, // Parent user
        status: 'APPROVED',
        confirmedAt: new Date()
      }
    }),
    prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: users[2].id, // BHW user
        status: 'PENDING'
      }
    })
  ]);

  console.log('✅ Created event registrations');

  // Create event attendance
  await prisma.eventAttendance.create({
    data: {
      eventId: event.id,
      userId: users[5].id, // Parent user
      recordedBy: users[4].id, // SK Chairman
      remarks: 'Active participation throughout the event'
    }
  });

  console.log('✅ Created event attendance');

  // Create sample announcements
  await prisma.announcement.create({
    data: {
      title: 'Community Health Day',
      content: 'Join us for a free health checkup and vaccination drive on February 20, 2024.',
      category: 'Health',
      priority: 'HIGH',
      isPublic: true,
      publishedBy: users[1].id // Barangay Captain
    }
  });

  console.log('✅ Created sample announcements');

  // Create certificates
  await Promise.all([
    prisma.certificate.create({
      data: {
        certificateType: 'Health Certificate',
        recipientName: 'Ana Martinez',
        issuedFor: 'Medical Clearance',
        issuedBy: users[2].id, // BHW
        patientId: patients[0].id,
        certificateData: {
          purpose: 'School enrollment',
          validUntil: '2024-12-31'
        }
      }
    }),
    prisma.certificate.create({
      data: {
        certificateType: 'Daycare Completion',
        recipientName: 'Ana Martinez',
        issuedFor: 'Successful completion of daycare program',
        issuedBy: users[3].id, // Daycare Teacher
        studentId: daycareStudent.id,
        certificateData: {
          program: 'Early Childhood Development',
          year: '2024'
        }
      }
    }),
    prisma.certificate.create({
      data: {
        certificateType: 'Event Participation',
        recipientName: 'Rosa Martinez',
        issuedFor: 'Youth Leadership Training',
        issuedBy: users[4].id, // SK Chairman
        eventId: event.id,
        certificateData: {
          eventDate: '2024-02-15',
          hours: '8 hours'
        }
      }
    })
  ]);

  console.log('✅ Created certificates');

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[5].id, // Parent user
        type: 'IN_APP',
        title: 'Appointment Reminder',
        message: 'Your child has an appointment scheduled for tomorrow at 9:00 AM',
        metadata: {
          appointmentId: 'sample-id',
          type: 'reminder'
        }
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[2].id, // BHW user
        type: 'IN_APP',
        title: 'New Patient Registration',
        message: 'A new patient has been registered and requires initial assessment',
        isRead: true,
        readAt: new Date()
      }
    })
  ]);

  console.log('✅ Created notifications');

  // Create notification settings
  await Promise.all([
    prisma.notificationSettings.upsert({
      where: { userId: users[5].id },
      update: {},
      create: {
        userId: users[5].id, // Parent user
        emailEnabled: true,
        smsEnabled: false,
        appointmentReminders: true,
        eventNotifications: true,
        daycareUpdates: true,
        systemAnnouncements: true
      }
    }),
    prisma.notificationSettings.upsert({
      where: { userId: users[2].id },
      update: {},
      create: {
        userId: users[2].id, // BHW user
        emailEnabled: true,
        smsEnabled: true,
        appointmentReminders: true,
        eventNotifications: false,
        daycareUpdates: false,
        systemAnnouncements: true
      }
    })
  ]);

  console.log('✅ Created notification settings');

  // Create broadcast messages
  await prisma.broadcastMessage.create({
    data: {
      title: 'System Maintenance Notice',
      message: 'The system will undergo maintenance on Sunday, 2:00 AM - 4:00 AM. Please save your work.',
      type: 'NOTIFICATION',
      targetRoles: ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BHW', 'DAYCARE_TEACHER', 'SK_CHAIRMAN'],
      status: 'SENT',
      recipientCount: 5,
      deliveredCount: 5,
      sentAt: new Date(),
      createdBy: users[0].id // System Admin
    }
  });

  console.log('✅ Created broadcast messages');

  // Create public content
  await Promise.all([
    // Features
    prisma.feature.create({
      data: {
        title: 'Health Services',
        description: 'Comprehensive healthcare management for the community',
        iconType: 'heart',
        stats: 'Active',
        sortOrder: 1
      }
    }),
    prisma.feature.create({
      data: {
        title: 'Daycare Management',
        description: 'Early childhood development and education programs',
        iconType: 'baby',
        stats: 'Active',
        sortOrder: 2
      }
    }),
    // Benefits
    prisma.benefit.create({
      data: {
        text: 'Digital health records accessible anytime',
        iconType: 'check',
        sortOrder: 1
      }
    }),
    prisma.benefit.create({
      data: {
        text: 'Streamlined daycare enrollment process',
        iconType: 'check',
        sortOrder: 2
      }
    }),
    // Testimonials
    prisma.testimonial.create({
      data: {
        name: 'Maria Santos',
        role: 'Barangay Health Worker',
        content: 'This system has made patient management so much easier and more organized.',
        rating: 5,
        sortOrder: 1
      }
    }),
    prisma.testimonial.create({
      data: {
        name: 'Ana Garcia',
        role: 'Daycare Teacher',
        content: 'The daycare management features help us track student progress effectively.',
        rating: 5,
        sortOrder: 2
      }
    }),
    // Service Features
    prisma.serviceFeature.create({
      data: {
        description: 'Real-time health monitoring and appointment scheduling',
        sortOrder: 1
      }
    }),
    prisma.serviceFeature.create({
      data: {
        description: 'Comprehensive daycare student progress tracking',
        sortOrder: 2
      }
    })
  ]);

  console.log('✅ Created public content (features, benefits, testimonials)');

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      barangayName: 'Barangay Binitayan',
      barangayAddress: 'Daraga, Albay, Philippines',
      barangayEmail: 'contact@barangaybinitayan.gov.ph',
      barangayContactNumber: '+63 XXX XXX XXXX',
      captainName: 'Juan Dela Cruz',
      systemName: 'Gabay Barangay',
      systemVersion: '1.0.0',
      maintenanceMode: false,
      allowRegistration: true,
      requireApproval: true
    }
  });

  console.log('✅ Created system settings');

  // Create audit logs
  await Promise.all([
    prisma.auditLog.create({
      data: {
        userId: users[0].id, // System Admin
        action: 'System initialization completed',
        entityType: 'SYSTEM',
        entityId: 'system-init',
        changes: {
          initialized: true,
          version: '1.0.0'
        }
      }
    }),
    prisma.auditLog.create({
      data: {
        userId: users[1].id, // Barangay Captain
        action: 'Created new announcement: Community Health Day',
        entityType: 'ANNOUNCEMENT',
        changes: {
          title: 'Community Health Day',
          category: 'Health'
        }
      }
    }),
    prisma.auditLog.create({
      data: {
        userId: users[2].id, // BHW
        action: 'Updated patient record: Ana Martinez',
        entityType: 'PATIENT',
        entityId: patients[0].id,
        changes: {
          bloodType: 'O+',
          updated: true
        }
      }
    })
  ]);

  console.log('✅ Created audit logs');

  // Create system backups
  await Promise.all([
    prisma.systemBackup.create({
      data: {
        backupType: 'SCHEDULED',
        filePath: 'backup_2024_01_15_daily.sql',
        fileSize: 2048576, // 2MB
        status: 'COMPLETED',
        initiatedBy: users[0].id, // System Admin
        startedAt: new Date('2024-01-15T02:00:00Z'),
        completedAt: new Date('2024-01-15T02:15:00Z'),
        notes: 'Daily automated backup completed successfully'
      }
    }),
    prisma.systemBackup.create({
      data: {
        backupType: 'MANUAL',
        filePath: 'backup_2024_01_20_manual.sql',
        fileSize: 2156789, // 2.1MB
        status: 'COMPLETED',
        initiatedBy: users[0].id, // System Admin
        startedAt: new Date('2024-01-20T10:30:00Z'),
        completedAt: new Date('2024-01-20T10:45:00Z'),
        notes: 'Manual backup before system update'
      }
    })
  ]);

  console.log('✅ Created system backups');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample Login Credentials:');
  console.log('System Admin: admin@theycare.com / password123');
  console.log('Barangay Captain: captain@theycare.com / password123');
  console.log('BHW: bhw@theycare.com / password123');
  console.log('Daycare Teacher: teacher@theycare.com / password123');
  console.log('SK Chairman: sk@theycare.com / password123');
  console.log('Parent/Resident: parent@theycare.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });