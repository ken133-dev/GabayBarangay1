import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ========== PUBLIC STATS ==========
export const getPublicStats = async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalStudents,
      totalEvents
    ] = await Promise.all([
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.patient.count(),
      prisma.daycareStudent.count(),
      prisma.event.count({ where: { status: 'PUBLISHED' } })
    ]);

    const stats = {
      communityMembers: totalUsers,
      healthRecords: totalPatients,
      daycareChildren: totalStudents,
      skEvents: totalEvents
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({ error: 'Failed to fetch public stats' });
  }
};

// ========== PUBLIC FEATURES ==========
export const getPublicFeatures = async (req: Request, res: Response) => {
  try {
    const features = [
      {
        title: 'Maternal Health Services',
        description: 'Comprehensive prenatal and postnatal care tracking, appointment scheduling, and health record management for expecting and new mothers.',
        iconType: 'heart',
        stats: 'Active'
      },
      {
        title: 'Daycare Management',
        description: 'Complete daycare operations including student registration, attendance tracking, progress reports, and learning materials management.',
        iconType: 'baby',
        stats: 'Active'
      },
      {
        title: 'SK Youth Engagement',
        description: 'Sangguniang Kabataan event management, youth program coordination, and community engagement activities for local youth development.',
        iconType: 'users',
        stats: 'Active'
      }
    ];

    res.json({ features });
  } catch (error) {
    console.error('Get public features error:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
};

// ========== PUBLIC BENEFITS ==========
export const getPublicBenefits = async (req: Request, res: Response) => {
  try {
    const benefits = [
      { text: 'Secure & Private', iconType: 'shield' },
      { text: 'Digital Records', iconType: 'fileText' },
      { text: '24/7 Access', iconType: 'calendar' },
      { text: 'Real-time Reports', iconType: 'barChart' }
    ];

    res.json({ benefits });
  } catch (error) {
    console.error('Get public benefits error:', error);
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
};

// ========== PUBLIC TESTIMONIALS ==========
export const getPublicTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = [
      {
        name: 'Barangay Captain',
        role: 'Local Government Leader',
        content: 'TheyCare Portal has significantly improved our community service delivery and administrative efficiency.',
        rating: 5
      },
      {
        name: 'Health Worker',
        role: 'Barangay Health Worker',
        content: 'Managing patient records and appointments has never been easier. This system saves us hours of paperwork.',
        rating: 5
      },
      {
        name: 'SK Chairman',
        role: 'Youth Leader',
        content: 'Our youth programs are now better organized and we can track participation more effectively.',
        rating: 5
      }
    ];

    res.json({ testimonials });
  } catch (error) {
    console.error('Get public testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

// ========== PUBLIC SERVICE FEATURES ==========
export const getPublicServiceFeatures = async (req: Request, res: Response) => {
  try {
    const features = [
      'Progressive Web App (PWA) technology for mobile-first experience',
      'Offline capability for uninterrupted service access',
      'Role-based access control for secure data management',
      'Real-time notifications and updates',
      'Digital certificate generation and validation',
      'Comprehensive reporting and analytics dashboard'
    ];

    res.json({ features });
  } catch (error) {
    console.error('Get public service features error:', error);
    res.status(500).json({ error: 'Failed to fetch service features' });
  }
};

// ========== PUBLIC ANNOUNCEMENTS ==========
export const getPublicAnnouncements = async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublic: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } }
        ]
      },
      orderBy: { publishedAt: 'desc' },
      take: 20
    });

    res.json({ announcements });
  } catch (error) {
    console.error('Get public announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};