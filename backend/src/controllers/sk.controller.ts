import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSKAnalytics = async (req: Request, res: Response) => {
  try {
    const { range = '6months' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Get events in date range
    const events = await prisma.event.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        registrations: {
          include: {
            user: true
          }
        }
      }
    });

    // Calculate summary statistics
    const totalEvents = events.length;
    const completedEvents = events.filter(e => new Date(e.eventDate) < now).length;
    const totalRegistrations = events.reduce((sum, event) => sum + event.registrations.length, 0);
    const uniqueParticipants = new Set(events.flatMap(e => e.registrations.map(r => r.userId))).size;
    // Get actual attendance data
    const totalAttendance = await prisma.eventAttendance.count({
      where: {
        event: {
          createdAt: {
            gte: startDate,
            lte: now
          }
        }
      }
    });
    
    const averageAttendance = totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0;

    // Get actual user ages from registrations
    const userIds = [...new Set(events.flatMap(e => e.registrations.map(r => r.userId)))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { patients: { select: { dateOfBirth: true, gender: true } } }
    });

    const ageGroups = { '15-17': 0, '18-21': 0, '22-25': 0, '26-30': 0 };
    users.forEach(user => {
      if (user.patients.length > 0) {
        const age = new Date().getFullYear() - new Date(user.patients[0].dateOfBirth).getFullYear();
        if (age >= 15 && age <= 17) ageGroups['15-17']++;
        else if (age >= 18 && age <= 21) ageGroups['18-21']++;
        else if (age >= 22 && age <= 25) ageGroups['22-25']++;
        else if (age >= 26 && age <= 30) ageGroups['26-30']++;
      }
    });

    const byAgeGroup = Object.entries(ageGroups).map(([ageGroup, count]) => ({ ageGroup, count }));

    // Events by category
    const categoryCount = events.reduce((acc, event) => {
      const category = event.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count
    }));

    // Monthly trends
    const monthlyData = {} as Record<string, { participants: number; events: number }>;
    events.forEach(event => {
      const month = event.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { participants: 0, events: 0 };
      }
      monthlyData[month].events += 1;
      monthlyData[month].participants += event.registrations.length;
    });

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));

    // Top events
    const topEvents = events
      .sort((a, b) => b.registrations.length - a.registrations.length)
      .slice(0, 5)
      .map(event => ({
        title: event.title,
        participants: event.registrations.length,
        attendanceRate: `${Math.min(100, (event.registrations.length / Math.max(event.maxParticipants || 50, event.registrations.length)) * 100).toFixed(1)}%`
      }));

    // Calculate actual repeat vs new participants
    const participantEventCounts = events.reduce((acc, event) => {
      event.registrations.forEach(reg => {
        acc[reg.userId] = (acc[reg.userId] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const repeatParticipants = Object.values(participantEventCounts).filter(count => count > 1).length;
    const newParticipants = uniqueParticipants - repeatParticipants;
    const engagementScore = Math.min(100, Math.floor(averageAttendance + (repeatParticipants / Math.max(uniqueParticipants, 1)) * 30));

    const analytics = {
      summary: {
        totalEvents,
        totalParticipants: uniqueParticipants,
        averageAttendance,
        completedEvents
      },
      participation: {
        byAgeGroup,
        byGender: users.reduce((acc, user) => {
          if (user.patients.length > 0) {
            const gender = user.patients[0].gender;
            const existing = acc.find(g => g.gender === gender);
            if (existing) existing.count++;
            else acc.push({ gender, count: 1 });
          }
          return acc;
        }, [] as { gender: string; count: number }[]),
        monthlyTrends
      },
      events: {
        byCategory,
        topEvents
      },
      engagement: {
        repeatParticipants,
        newParticipants,
        engagementScore
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching SK analytics:', error);
    res.status(500).json({ error: 'Failed to fetch SK analytics' });
  }
};