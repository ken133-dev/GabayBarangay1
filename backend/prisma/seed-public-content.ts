import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting public content seeding...');

  // Seed Features
  console.log('📋 Creating features...');
  await Promise.all([
    prisma.feature.upsert({
      where: { id: 'feature-health' },
      update: {},
      create: {
        id: 'feature-health',
        title: 'Maternal Health Services',
        description: 'Comprehensive prenatal and postnatal care tracking, appointment scheduling, and health record management for expecting and new mothers.',
        iconType: 'heart',
        stats: 'Active',
        sortOrder: 1
      }
    }),
    prisma.feature.upsert({
      where: { id: 'feature-daycare' },
      update: {},
      create: {
        id: 'feature-daycare',
        title: 'Daycare Management',
        description: 'Complete daycare operations including student registration, attendance tracking, progress reports, and learning materials management.',
        iconType: 'baby',
        stats: 'Active',
        sortOrder: 2
      }
    }),
    prisma.feature.upsert({
      where: { id: 'feature-sk' },
      update: {},
      create: {
        id: 'feature-sk',
        title: 'SK Youth Engagement',
        description: 'Sangguniang Kabataan event management, youth program coordination, and community engagement activities for local youth development.',
        iconType: 'users',
        stats: 'Active',
        sortOrder: 3
      }
    })
  ]);
  console.log('✅ Created features');

  // Seed Benefits
  console.log('🛡️ Creating benefits...');
  await Promise.all([
    prisma.benefit.upsert({
      where: { id: 'benefit-secure' },
      update: {},
      create: {
        id: 'benefit-secure',
        text: 'Secure & Private',
        iconType: 'shield',
        sortOrder: 1
      }
    }),
    prisma.benefit.upsert({
      where: { id: 'benefit-digital' },
      update: {},
      create: {
        id: 'benefit-digital',
        text: 'Digital Records',
        iconType: 'fileText',
        sortOrder: 2
      }
    }),
    prisma.benefit.upsert({
      where: { id: 'benefit-access' },
      update: {},
      create: {
        id: 'benefit-access',
        text: '24/7 Access',
        iconType: 'calendar',
        sortOrder: 3
      }
    }),
    prisma.benefit.upsert({
      where: { id: 'benefit-reports' },
      update: {},
      create: {
        id: 'benefit-reports',
        text: 'Real-time Reports',
        iconType: 'barChart',
        sortOrder: 4
      }
    })
  ]);
  console.log('✅ Created benefits');

  // Seed Testimonials
  console.log('💬 Creating testimonials...');
  await Promise.all([
    prisma.testimonial.upsert({
      where: { id: 'testimonial-captain' },
      update: {},
      create: {
        id: 'testimonial-captain',
        name: 'Barangay Captain',
        role: 'Local Government Leader',
        content: 'TheyCare Portal has significantly improved our community service delivery and administrative efficiency.',
        rating: 5,
        sortOrder: 1
      }
    }),
    prisma.testimonial.upsert({
      where: { id: 'testimonial-bhw' },
      update: {},
      create: {
        id: 'testimonial-bhw',
        name: 'Health Worker',
        role: 'Barangay Health Worker',
        content: 'Managing patient records and appointments has never been easier. This system saves us hours of paperwork.',
        rating: 5,
        sortOrder: 2
      }
    }),
    prisma.testimonial.upsert({
      where: { id: 'testimonial-sk' },
      update: {},
      create: {
        id: 'testimonial-sk',
        name: 'SK Chairman',
        role: 'Youth Leader',
        content: 'Our youth programs are now better organized and we can track participation more effectively.',
        rating: 5,
        sortOrder: 3
      }
    })
  ]);
  console.log('✅ Created testimonials');

  // Seed Service Features
  console.log('⚙️ Creating service features...');
  await Promise.all([
    prisma.serviceFeature.upsert({
      where: { id: 'service-pwa' },
      update: {},
      create: {
        id: 'service-pwa',
        description: 'Progressive Web App (PWA) technology for mobile-first experience',
        sortOrder: 1
      }
    }),
    prisma.serviceFeature.upsert({
      where: { id: 'service-offline' },
      update: {},
      create: {
        id: 'service-offline',
        description: 'Offline capability for uninterrupted service access',
        sortOrder: 2
      }
    }),
    prisma.serviceFeature.upsert({
      where: { id: 'service-rbac' },
      update: {},
      create: {
        id: 'service-rbac',
        description: 'Role-based access control for secure data management',
        sortOrder: 3
      }
    }),
    prisma.serviceFeature.upsert({
      where: { id: 'service-notifications' },
      update: {},
      create: {
        id: 'service-notifications',
        description: 'Real-time notifications and updates',
        sortOrder: 4
      }
    }),
    prisma.serviceFeature.upsert({
      where: { id: 'service-certificates' },
      update: {},
      create: {
        id: 'service-certificates',
        description: 'Digital certificate generation and validation',
        sortOrder: 5
      }
    }),
    prisma.serviceFeature.upsert({
      where: { id: 'service-analytics' },
      update: {},
      create: {
        id: 'service-analytics',
        description: 'Comprehensive reporting and analytics dashboard',
        sortOrder: 6
      }
    })
  ]);
  console.log('✅ Created service features');

  console.log('\n🎉 Public content seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('   Features: 3');
  console.log('   Benefits: 4');
  console.log('   Testimonials: 3');
  console.log('   Service Features: 6');
}

main()
  .catch((e) => {
    console.error('❌ Public content seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });