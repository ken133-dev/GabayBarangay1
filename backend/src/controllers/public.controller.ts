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
    const features = await prisma.feature.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ features });
  } catch (error) {
    console.error('Get public features error:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
};

// ========== PUBLIC BENEFITS ==========
export const getPublicBenefits = async (req: Request, res: Response) => {
  try {
    const benefits = await prisma.benefit.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ benefits });
  } catch (error) {
    console.error('Get public benefits error:', error);
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
};

// ========== PUBLIC TESTIMONIALS ==========
export const getPublicTestimonials = async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ testimonials });
  } catch (error) {
    console.error('Get public testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

// ========== PUBLIC SERVICE FEATURES ==========
export const getPublicServiceFeatures = async (req: Request, res: Response) => {
  try {
    const serviceFeatures = await prisma.serviceFeature.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    const features = serviceFeatures.map(sf => sf.description);

    res.json({ features });
  } catch (error) {
    console.error('Get public service features error:', error);
    res.status(500).json({ error: 'Failed to fetch service features' });
  }
};

// ========== PUBLIC CONTACT INFORMATION ==========
export const getPublicContactInfo = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSettings.findFirst();

    const contactInfo = {
      barangayName: settings?.barangayName || 'Barangay Binitayan',
      address: settings?.barangayAddress || 'Daraga, Albay, Philippines',
      phone: settings?.barangayContactNumber || '+63 XXX XXX XXXX',
      email: settings?.barangayEmail || 'contact@barangaybinitayan.gov.ph',
      hours: 'Mon - Fri: 8am - 5pm, Sat: 8am - 12pm'
    };

    res.json({ contactInfo });
  } catch (error) {
    console.error('Get public contact info error:', error);
    res.status(500).json({ error: 'Failed to fetch contact information' });
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