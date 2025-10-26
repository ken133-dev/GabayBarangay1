import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

// ========== EVENT MANAGEMENT ==========

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const createdBy = req.user!.userId;
    const { eventDate, startTime, endTime, ...eventData } = req.body;

    // Combine date and time properly
    const eventDateTime = new Date(eventDate);
    const [startHour, startMinute] = startTime.split(':');
    const startDateTime = new Date(eventDateTime);
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

    let endDateTime = null;
    if (endTime) {
      const [endHour, endMinute] = endTime.split(':');
      endDateTime = new Date(eventDateTime);
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
    }

    const event = await prisma.event.create({
      data: {
        ...eventData,
        eventDate: eventDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        createdBy,
        status: eventData.status || 'DRAFT',
        publishedAt: eventData.status === 'PUBLISHED' ? new Date() : null
      }
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const getAllEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { status, category } = req.query;
    const userRoles = req.user?.roles || [];
    const userRole = userRoles[0] || 'VISITOR';

    // SK Officers and Admin can see all events, others only see published
    const where: any = {};

    if (status) {
      where.status = status;
    } else if (!['SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'].includes(userRole || '')) {
      where.status = { in: ['PUBLISHED', 'ONGOING', 'COMPLETED'] };
    }

    if (category) {
      where.category = category;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            registrations: true,
            attendanceRecords: true
          }
        }
      },
      orderBy: { eventDate: 'desc' }
    });

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getPublicEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { category, upcoming } = req.query;

    const where: any = {
      status: 'PUBLISHED'
    };

    if (category) {
      where.category = category;
    }

    if (upcoming === 'true') {
      where.eventDate = { gte: new Date() };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: { eventDate: 'asc' }
    });

    res.json({ events });
  } catch (error) {
    console.error('Get public events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        attendanceRecords: true,
        _count: {
          select: {
            registrations: true,
            attendanceRecords: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Fetch user details for attendance records
    const attendanceWithUsers = await Promise.all(
      event.attendanceRecords.map(async (record) => {
        const user = await prisma.user.findUnique({
          where: { id: record.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        });
        return {
          ...record,
          user
        };
      })
    );

    res.json({
      event: {
        ...event,
        attendanceRecords: attendanceWithUsers
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.eventDate && { eventDate: new Date(updateData.eventDate) }),
        ...(updateData.startTime && { startTime: new Date(updateData.startTime) }),
        ...(updateData.endTime && { endTime: new Date(updateData.endTime) })
      }
    });

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const updateEventStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData: any = { status };

    // Set publishedAt when publishing
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData
    });

    res.json({ message: `Event status updated to ${status}`, event });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ error: 'Failed to update event status' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.event.delete({
      where: { id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// ========== EVENT REGISTRATION ==========

export const registerForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.body;
    const userId = req.user!.userId;

    // Check if event exists and has capacity
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'PUBLISHED') {
      return res.status(400).json({ error: 'Event is not open for registration' });
    }

    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        status: 'APPROVED' // Auto-approve registrations
      },
      include: {
        event: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Successfully registered for event',
      registration
    });
  } catch (error: any) {
    console.error('Register for event error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    res.status(500).json({ error: 'Failed to register for event' });
  }
};

export const getEventRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true,
            roles: true
          }
        }
      },
      orderBy: { registeredAt: 'desc' }
    });

    res.json({ registrations });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const registrations = await prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: true
      },
      orderBy: { registeredAt: 'desc' }
    });

    res.json({ registrations });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

export const cancelRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = req.user!.userId;

    await prisma.eventRegistration.delete({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
};

// ========== EVENT ATTENDANCE ==========

export const recordAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, userId, remarks } = req.body;
    const recordedBy = req.user!.userId;

    // Check if user is registered for the event
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (!registration) {
      return res.status(400).json({ error: 'User is not registered for this event' });
    }

    // Check if attendance already recorded
    const existingAttendance = await prisma.eventAttendance.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendance already recorded' });
    }

    const attendance = await prisma.eventAttendance.create({
      data: {
        eventId,
        userId,
        recordedBy,
        remarks
      },
    });

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance
    });
  } catch (error: any) {
    console.error('Record attendance error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Attendance already recorded' });
    }
    res.status(500).json({ error: 'Failed to record attendance' });
  }
};

export const getEventAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;

    const attendance = await prisma.eventAttendance.findMany({
      where: { eventId },
      orderBy: { attendedAt: 'desc' }
    });

    // Fetch user details for each attendance record
    const attendanceWithUsers = await Promise.all(
      attendance.map(async (record) => {
        const user = await prisma.user.findUnique({
          where: { id: record.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roles: true
          }
        });
        return {
          ...record,
          user
        };
      })
    );

    res.json({ attendance: attendanceWithUsers });
  } catch (error) {
    console.error('Get event attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// ========== EVENT ANALYTICS ==========

export const getEventAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Calculate statistics
    const totalRegistrations = event._count.registrations;
    const totalAttendance = event._count.attendanceRecords;
    const attendanceRate = totalRegistrations > 0
      ? ((totalAttendance / totalRegistrations) * 100).toFixed(2)
      : '0';

    // Fetch user details for role breakdown
    const userIds = event.registrations.map(r => r.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, roles: true }
    });

    // Role breakdown
    const roleBreakdown = users.reduce((acc: any, user) => {
      user.roles.forEach(role => {
        acc[role] = (acc[role] || 0) + 1;
      });
      return acc;
    }, {});

    const analytics = {
      event: {
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
        status: event.status
      },
      stats: {
        totalRegistrations,
        totalAttendance,
        attendanceRate: `${attendanceRate}%`,
        capacity: event.maxParticipants || 'Unlimited',
        spotsRemaining: event.maxParticipants
          ? Math.max(0, event.maxParticipants - totalRegistrations)
          : 'Unlimited'
      },
      demographics: {
        roleBreakdown
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// ========== CERTIFICATES ==========

export const generateCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.params;
    const { attendeesOnly } = req.body;
    const issuedBy = req.user!.userId;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: true,
        attendanceRecords: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Determine who gets certificates - get user IDs
    const recipientIds = attendeesOnly
      ? event.attendanceRecords.map(a => a.userId)
      : event.registrations.map(r => r.userId);

    // Fetch user details
    const users = await prisma.user.findMany({
      where: { id: { in: recipientIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    // Generate certificates for each recipient
    const certificates = await Promise.all(
      users.map(user =>
        prisma.certificate.create({
          data: {
            certificateType: 'EVENT_PARTICIPATION',
            recipientName: `${user.firstName} ${user.lastName}`,
            issuedFor: `Participation in ${event.title}`,
            issuedBy,
            eventId,
            certificateData: {
              eventTitle: event.title,
              eventDate: event.eventDate,
              recipientEmail: user.email
            }
          }
        })
      )
    );

    res.status(201).json({
      message: `Generated ${certificates.length} certificates`,
      certificates
    });
  } catch (error) {
    console.error('Generate certificates error:', error);
    res.status(500).json({ error: 'Failed to generate certificates' });
  }
};
