import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

// ========== SYSTEM OVERVIEW ==========

export const getSystemOverview = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Date filters
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate as string);
      dateFilter.lte = new Date(endDate as string);
    }

    // Get counts from all modules
    const [
      totalUsers,
      activeUsers,
      totalPatients,
      totalAppointments,
      completedAppointments,
      totalDaycareStudents,
      pendingDaycareRegistrations,
      totalEvents,
      publishedEvents,
      totalEventRegistrations,
      totalEventAttendance
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.patient.count(),
      prisma.appointment.count(startDate && endDate ? { where: { appointmentDate: dateFilter } } : undefined),
      prisma.appointment.count({
        where: {
          status: 'COMPLETED',
          ...(startDate && endDate && { appointmentDate: dateFilter })
        }
      }),
      prisma.daycareStudent.count(),
      prisma.daycareRegistration.count({ where: { status: 'PENDING' } }),
      prisma.event.count(startDate && endDate ? { where: { eventDate: dateFilter } } : undefined),
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.eventRegistration.count(),
      prisma.eventAttendance.count()
    ]);

    // Calculate key metrics
    const appointmentCompletionRate = totalAppointments > 0
      ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
      : '0';

    const eventAttendanceRate = totalEventRegistrations > 0
      ? ((totalEventAttendance / totalEventRegistrations) * 100).toFixed(2)
      : '0';

    const overview = {
      summary: {
        totalUsers,
        activeUsers,
        userActivationRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : '0'
      },
      healthServices: {
        totalPatients,
        totalAppointments,
        completedAppointments,
        appointmentCompletionRate: `${appointmentCompletionRate}%`
      },
      daycareServices: {
        totalStudents: totalDaycareStudents,
        pendingRegistrations: pendingDaycareRegistrations
      },
      skEngagement: {
        totalEvents,
        publishedEvents,
        totalRegistrations: totalEventRegistrations,
        totalAttendance: totalEventAttendance,
        attendanceRate: `${eventAttendanceRate}%`
      },
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      }
    };

    res.json({ overview });
  } catch (error) {
    console.error('Get system overview error:', error);
    res.status(500).json({ error: 'Failed to fetch system overview' });
  }
};

// ========== HEALTH SERVICES REPORT ==========

export const getHealthServicesReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate as string);
      dateFilter.lte = new Date(endDate as string);
    }

    // Get all appointments with filters
    const appointments = await prisma.appointment.findMany({
      where: startDate && endDate ? { appointmentDate: dateFilter } : {},
      include: {
        patient: true
      }
    });

    // Appointment statistics by type
    const appointmentsByType = appointments.reduce((acc: any, apt) => {
      acc[apt.appointmentType] = (acc[apt.appointmentType] || 0) + 1;
      return acc;
    }, {});

    // Appointment statistics by status
    const appointmentsByStatus = appointments.reduce((acc: any, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    // Monthly appointment trends
    const monthlyAppointments: any = {};
    appointments.forEach(apt => {
      const month = new Date(apt.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyAppointments[month] = (monthlyAppointments[month] || 0) + 1;
    });

    // Vaccinations
    const totalVaccinations = await prisma.vaccination.count(
      startDate && endDate ? { where: { dateGiven: dateFilter } } : undefined
    );

    const vaccinations = await prisma.vaccination.findMany({
      where: startDate && endDate ? { dateGiven: dateFilter } : undefined,
      include: {
        patient: true
      }
    });

    // Vaccination by type
    const vaccinationsByType = vaccinations.reduce((acc: any, vac) => {
      acc[vac.vaccineName] = (acc[vac.vaccineName] || 0) + 1;
      return acc;
    }, {});

    // Patient demographics
    const allPatients = await prisma.patient.findMany({
      select: {
        gender: true,
        bloodType: true,
        dateOfBirth: true
      }
    });

    const patientsByGender = allPatients.reduce((acc: any, patient) => {
      acc[patient.gender] = (acc[patient.gender] || 0) + 1;
      return acc;
    }, {});

    const patientsByBloodType = allPatients.reduce((acc: any, patient) => {
      if (patient.bloodType) {
        acc[patient.bloodType] = (acc[patient.bloodType] || 0) + 1;
      }
      return acc;
    }, {});

    const report = {
      summary: {
        totalPatients: allPatients.length,
        totalAppointments: appointments.length,
        totalVaccinations,
        completedAppointments: appointmentsByStatus['COMPLETED'] || 0,
        pendingAppointments: appointmentsByStatus['SCHEDULED'] || 0,
        cancelledAppointments: appointmentsByStatus['CANCELLED'] || 0
      },
      appointments: {
        byType: appointmentsByType,
        byStatus: appointmentsByStatus,
        monthlyTrend: monthlyAppointments
      },
      vaccinations: {
        total: totalVaccinations,
        byType: vaccinationsByType
      },
      demographics: {
        byGender: patientsByGender,
        byBloodType: patientsByBloodType
      },
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      }
    };

    res.json({ report });
  } catch (error) {
    console.error('Get health services report error:', error);
    res.status(500).json({ error: 'Failed to fetch health services report' });
  }
};

// ========== DAYCARE SERVICES REPORT ==========

export const getDaycareServicesReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate as string);
      dateFilter.lte = new Date(endDate as string);
    }

    // Get all students and registrations
    const students = await prisma.daycareStudent.findMany({
      include: {
        registration: true,
        attendanceRecords: startDate && endDate ? {
          where: { date: dateFilter }
        } : true,
        progressReports: true
      }
    });

    const registrations = await prisma.daycareRegistration.findMany({
      where: startDate && endDate ? { submittedAt: dateFilter } : {}
    });

    // Registration statistics
    const registrationsByStatus = registrations.reduce((acc: any, reg) => {
      acc[reg.status] = (acc[reg.status] || 0) + 1;
      return acc;
    }, {});

    // Monthly registration trends
    const monthlyRegistrations: any = {};
    registrations.forEach(reg => {
      const month = new Date(reg.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyRegistrations[month] = (monthlyRegistrations[month] || 0) + 1;
    });

    // Attendance statistics
    const allAttendance = await prisma.attendanceRecord.findMany({
      where: startDate && endDate ? { date: dateFilter } : {}
    });

    const attendanceByStatus = allAttendance.reduce((acc: any, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});

    const totalAttendanceRecords = allAttendance.length;
    const presentRecords = attendanceByStatus['PRESENT'] || 0;
    const attendanceRate = totalAttendanceRecords > 0
      ? ((presentRecords / totalAttendanceRecords) * 100).toFixed(2)
      : '0';

    // Age group distribution
    const ageGroups = students.reduce((acc: any, student) => {
      const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();
      let group = '';
      if (age < 1) group = '0-1 years';
      else if (age < 2) group = '1-2 years';
      else if (age < 3) group = '2-3 years';
      else if (age < 4) group = '3-4 years';
      else group = '4+ years';

      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {});

    // Gender distribution
    const studentsByGender = students.reduce((acc: any, student) => {
      acc[student.gender] = (acc[student.gender] || 0) + 1;
      return acc;
    }, {});

    // Progress reports count
    const totalProgressReports = await prisma.progressReport.count(
      startDate && endDate ? { where: { generatedAt: dateFilter } } : undefined
    );

    const report = {
      summary: {
        totalStudents: students.length,
        totalRegistrations: registrations.length,
        approvedRegistrations: registrationsByStatus['APPROVED'] || 0,
        pendingRegistrations: registrationsByStatus['PENDING'] || 0,
        attendanceRate: `${attendanceRate}%`,
        totalProgressReports
      },
      registrations: {
        byStatus: registrationsByStatus,
        monthlyTrend: monthlyRegistrations
      },
      attendance: {
        byStatus: attendanceByStatus,
        totalRecords: totalAttendanceRecords,
        rate: `${attendanceRate}%`
      },
      demographics: {
        byAgeGroup: ageGroups,
        byGender: studentsByGender
      },
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      }
    };

    res.json({ report });
  } catch (error) {
    console.error('Get daycare services report error:', error);
    res.status(500).json({ error: 'Failed to fetch daycare services report' });
  }
};

// ========== SK ENGAGEMENT REPORT ==========

export const getSKEngagementReport = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate as string);
      dateFilter.lte = new Date(endDate as string);
    }

    // Get all events with registrations and attendance
    const events = await prisma.event.findMany({
      where: startDate && endDate ? { eventDate: dateFilter } : {},
      include: {
        registrations: true,
        attendanceRecords: true,
        _count: {
          select: {
            registrations: true,
            attendanceRecords: true
          }
        }
      }
    });

    // Event statistics by status
    const eventsByStatus = events.reduce((acc: any, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {});

    // Event statistics by category
    const eventsByCategory = events.reduce((acc: any, event) => {
      if (event.category) {
        acc[event.category] = (acc[event.category] || 0) + 1;
      }
      return acc;
    }, {});

    // Monthly event trends
    const monthlyEvents: any = {};
    events.forEach(event => {
      const month = new Date(event.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyEvents[month] = (monthlyEvents[month] || 0) + 1;
    });

    // Calculate participation metrics
    const totalRegistrations = events.reduce((sum, event) => sum + event._count.registrations, 0);
    const totalAttendance = events.reduce((sum, event) => sum + event._count.attendanceRecords, 0);

    const attendanceRate = totalRegistrations > 0
      ? ((totalAttendance / totalRegistrations) * 100).toFixed(2)
      : '0';

    // Event-by-event analysis
    const eventAnalysis = events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.eventDate,
      category: event.category,
      status: event.status,
      registrations: event._count.registrations,
      attendance: event._count.attendanceRecords,
      attendanceRate: event._count.registrations > 0
        ? ((event._count.attendanceRecords / event._count.registrations) * 100).toFixed(2) + '%'
        : '0%',
      capacity: event.maxParticipants,
      utilizationRate: event.maxParticipants
        ? ((event._count.registrations / event.maxParticipants) * 100).toFixed(2) + '%'
        : 'N/A'
    }));

    // Sort by attendance rate
    eventAnalysis.sort((a, b) => {
      const rateA = parseFloat(a.attendanceRate) || 0;
      const rateB = parseFloat(b.attendanceRate) || 0;
      return rateB - rateA;
    });

    const report = {
      summary: {
        totalEvents: events.length,
        publishedEvents: eventsByStatus['PUBLISHED'] || 0,
        completedEvents: eventsByStatus['COMPLETED'] || 0,
        totalRegistrations,
        totalAttendance,
        overallAttendanceRate: `${attendanceRate}%`
      },
      events: {
        byStatus: eventsByStatus,
        byCategory: eventsByCategory,
        monthlyTrend: monthlyEvents
      },
      participation: {
        totalRegistrations,
        totalAttendance,
        attendanceRate: `${attendanceRate}%`,
        averageRegistrationsPerEvent: events.length > 0
          ? (totalRegistrations / events.length).toFixed(2)
          : '0',
        averageAttendancePerEvent: events.length > 0
          ? (totalAttendance / events.length).toFixed(2)
          : '0'
      },
      topEvents: eventAnalysis.slice(0, 10),
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'All time'
      }
    };

    res.json({ report });
  } catch (error) {
    console.error('Get SK engagement report error:', error);
    res.status(500).json({ error: 'Failed to fetch SK engagement report' });
  }
};

// ========== DASHBOARD STATS (Role-Based) ==========

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    let stats: any = {};

    // Common stats for all users
    stats.notifications = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    // Role-specific stats
    switch (userRole) {
      case 'SYSTEM_ADMIN':
      case 'BARANGAY_CAPTAIN':
      case 'BARANGAY_OFFICIAL':
        // Full system overview
        const [users, patients, students, events, pendingRegistrations] = await Promise.all([
          prisma.user.count({ where: { status: 'PENDING' } }),
          prisma.patient.count(),
          prisma.daycareStudent.count(),
          prisma.event.count({ where: { status: 'PUBLISHED' } }),
          prisma.daycareRegistration.count({ where: { status: 'PENDING' } })
        ]);

        stats.pendingUsers = users;
        stats.totalPatients = patients;
        stats.totalStudents = students;
        stats.activeEvents = events;
        stats.pendingDaycareRegistrations = pendingRegistrations;
        break;

      case 'BHW':
      case 'BHW_COORDINATOR':
        // Health services stats
        const [todayAppointments, pendingAppointments, totalPatients] = await Promise.all([
          prisma.appointment.count({
            where: {
              appointmentDate: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999))
              }
            }
          }),
          prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
          prisma.patient.count()
        ]);

        stats.todayAppointments = todayAppointments;
        stats.pendingAppointments = pendingAppointments;
        stats.totalPatients = totalPatients;
        break;

      case 'DAYCARE_STAFF':
      case 'DAYCARE_TEACHER':
        // Daycare stats
        const [totalDaycareStudents, todayAttendance, pendingDaycareRegs] = await Promise.all([
          prisma.daycareStudent.count(),
          prisma.attendanceRecord.count({
            where: {
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999))
              },
              status: 'PRESENT'
            }
          }),
          prisma.daycareRegistration.count({ where: { status: 'PENDING' } })
        ]);

        stats.totalStudents = totalDaycareStudents;
        stats.todayAttendance = todayAttendance;
        stats.pendingRegistrations = pendingDaycareRegs;
        break;

      case 'SK_OFFICER':
      case 'SK_CHAIRMAN':
        // SK engagement stats
        const [upcomingEvents, totalEventRegs, publishedEventsCount] = await Promise.all([
          prisma.event.count({
            where: {
              eventDate: { gte: new Date() },
              status: 'PUBLISHED'
            }
          }),
          prisma.eventRegistration.count(),
          prisma.event.count({ where: { status: 'PUBLISHED' } })
        ]);

        stats.upcomingEvents = upcomingEvents;
        stats.totalRegistrations = totalEventRegs;
        stats.publishedEvents = publishedEventsCount;
        break;

      case 'PARENT_RESIDENT':
        // Parent stats
        const myRegistrations = await prisma.daycareRegistration.count({
          where: { parentId: userId }
        });
        const myEventRegs = await prisma.eventRegistration.count({
          where: { userId }
        });

        stats.myDaycareRegistrations = myRegistrations;
        stats.myEventRegistrations = myEventRegs;
        break;

      case 'PATIENT':
        // Patient stats
        const myAppointments = await prisma.appointment.count({
          where: {
            patient: {
              userId
            }
          }
        });

        stats.myAppointments = myAppointments;
        break;
    }

    res.json({ stats, role: userRole });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// ========== TREND ANALYTICS ==========

export const getTrendAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { months = 6 } = req.query;
    const monthsCount = parseInt(months as string);

    // Calculate start date (X months ago)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    // Get data for each month
    const trends: any = {};

    for (let i = 0; i < monthsCount; i++) {
      const monthStart = new Date(startDate);
      monthStart.setMonth(startDate.getMonth() + i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthKey = monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      const [appointments, students, events, registrations] = await Promise.all([
        prisma.appointment.count({
          where: {
            appointmentDate: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.daycareStudent.count({
          where: {
            enrollmentDate: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.event.count({
          where: {
            eventDate: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.eventRegistration.count({
          where: {
            registeredAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        })
      ]);

      trends[monthKey] = {
        appointments,
        daycareEnrollments: students,
        events,
        eventRegistrations: registrations
      };
    }

    res.json({ trends, months: monthsCount });
  } catch (error) {
    console.error('Get trend analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch trend analytics' });
  }
};

// ========== PARTICIPATION METRICS ==========

export const getParticipationMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalResidents,
      healthServiceUsers,
      daycareParents,
      eventParticipants
    ] = await Promise.all([
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.patient.count({ where: { userId: { not: null } } }),
      prisma.daycareRegistration.count({ where: { status: 'APPROVED' } }),
      prisma.eventRegistration.count()
    ]);

    // Calculate unique event participants
    const uniqueEventParticipants = await prisma.eventRegistration.groupBy({
      by: ['userId'],
      _count: true
    });

    const metrics = {
      totalActiveResidents: totalResidents,
      healthServices: {
        participants: healthServiceUsers,
        participationRate: totalResidents > 0
          ? ((healthServiceUsers / totalResidents) * 100).toFixed(2) + '%'
          : '0%'
      },
      daycareServices: {
        participants: daycareParents,
        participationRate: totalResidents > 0
          ? ((daycareParents / totalResidents) * 100).toFixed(2) + '%'
          : '0%'
      },
      skEngagement: {
        totalRegistrations: eventParticipants,
        uniqueParticipants: uniqueEventParticipants.length,
        participationRate: totalResidents > 0
          ? ((uniqueEventParticipants.length / totalResidents) * 100).toFixed(2) + '%'
          : '0%'
      },
      overall: {
        engagedResidents: new Set([
          ...Array.from({ length: healthServiceUsers }),
          ...Array.from({ length: daycareParents }),
          ...uniqueEventParticipants.map(() => null)
        ]).size,
        engagementScore: '0%' // Placeholder for more complex calculation
      }
    };

    res.json({ metrics });
  } catch (error) {
    console.error('Get participation metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch participation metrics' });
  }
};
