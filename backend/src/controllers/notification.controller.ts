import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

// ========== NOTIFICATION MANAGEMENT ==========

export const sendNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, type, title, message, metadata } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId,
        type: type || 'IN_APP',
        title,
        message,
        metadata
      },
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
    });

    res.status(201).json({
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { unreadOnly, limit } = req.query;

    const where: any = { userId };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: limit ? parseInt(limit as string) : undefined
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to mark this notification as read' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      message: 'Notification marked as read',
      notification: updatedNotification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      message: 'All notifications marked as read',
      count: result.count
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this notification' });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// ========== NOTIFICATION PREFERENCES ==========

export const getNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId }
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId,
          emailEnabled: true,
          smsEnabled: false,
          appointmentReminders: true,
          eventNotifications: true,
          daycareUpdates: true,
          systemAnnouncements: true
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
};

export const updateNotificationPreferences = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const {
      emailEnabled,
      smsEnabled,
      appointmentReminders,
      eventNotifications,
      daycareUpdates,
      systemAnnouncements
    } = req.body;

    // Check if settings exist
    const existingSettings = await prisma.notificationSettings.findUnique({
      where: { userId }
    });

    let settings;

    if (existingSettings) {
      settings = await prisma.notificationSettings.update({
        where: { userId },
        data: {
          ...(emailEnabled !== undefined && { emailEnabled }),
          ...(smsEnabled !== undefined && { smsEnabled }),
          ...(appointmentReminders !== undefined && { appointmentReminders }),
          ...(eventNotifications !== undefined && { eventNotifications }),
          ...(daycareUpdates !== undefined && { daycareUpdates }),
          ...(systemAnnouncements !== undefined && { systemAnnouncements })
        }
      });
    } else {
      settings = await prisma.notificationSettings.create({
        data: {
          userId,
          emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
          smsEnabled: smsEnabled !== undefined ? smsEnabled : false,
          appointmentReminders: appointmentReminders !== undefined ? appointmentReminders : true,
          eventNotifications: eventNotifications !== undefined ? eventNotifications : true,
          daycareUpdates: daycareUpdates !== undefined ? daycareUpdates : true,
          systemAnnouncements: systemAnnouncements !== undefined ? systemAnnouncements : true
        }
      });
    }

    res.json({
      message: 'Notification preferences updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
};

// ========== BROADCAST MESSAGES ==========

export const sendBroadcast = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user!.userId;
    const { title, message, targetRoles, scheduledFor } = req.body;

    // Create broadcast message record
    const broadcast = await prisma.broadcastMessage.create({
      data: {
        senderId,
        title,
        message,
        targetRoles: targetRoles || [],
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null
      }
    });

    // Get all users matching target roles
    const where: any = {};
    if (targetRoles && targetRoles.length > 0) {
      where.role = { in: targetRoles };
    }
    where.status = 'ACTIVE'; // Only send to active users

    const targetUsers = await prisma.user.findMany({
      where,
      select: { id: true }
    });

    // Create notifications for all target users
    const notifications = await Promise.all(
      targetUsers.map(user =>
        prisma.notification.create({
          data: {
            userId: user.id,
            type: 'IN_APP',
            title,
            message,
            metadata: {
              broadcastId: broadcast.id,
              isBroadcast: true
            }
          }
        })
      )
    );

    res.status(201).json({
      message: `Broadcast sent to ${notifications.length} users`,
      broadcast,
      recipientCount: notifications.length
    });
  } catch (error) {
    console.error('Send broadcast error:', error);
    res.status(500).json({ error: 'Failed to send broadcast' });
  }
};

export const getBroadcastHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { limit } = req.query;

    const broadcasts = await prisma.broadcastMessage.findMany({
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      take: limit ? parseInt(limit as string) : 50
    });

    res.json({ broadcasts });
  } catch (error) {
    console.error('Get broadcast history error:', error);
    res.status(500).json({ error: 'Failed to fetch broadcast history' });
  }
};

// ========== AUTOMATED NOTIFICATIONS ==========

export const sendAppointmentReminder = async (appointmentId: string) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        healthWorker: true
      }
    });

    if (!appointment || !appointment.patient.userId) {
      return;
    }

    await prisma.notification.create({
      data: {
        userId: appointment.patient.userId!,
        type: 'IN_APP',
        title: 'Appointment Reminder',
        message: `You have an upcoming ${appointment.appointmentType} appointment tomorrow at ${new Date(appointment.appointmentDate).toLocaleTimeString()}.`,
        metadata: {
          type: 'APPOINTMENT_REMINDER',
          appointmentId: appointment.id,
          appointmentDate: appointment.appointmentDate
        }
      }
    });
  } catch (error) {
    console.error('Send appointment reminder error:', error);
  }
};

export const sendEventReminder = async (eventId: string, userId: string) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return;
    }

    await prisma.notification.create({
      data: {
        userId,
        type: 'IN_APP',
        title: 'Event Reminder',
        message: `Reminder: "${event.title}" is happening tomorrow at ${new Date(event.startTime).toLocaleTimeString()}. Location: ${event.location}`,
        metadata: {
          type: 'EVENT_REMINDER',
          eventId: event.id,
          eventDate: event.eventDate
        }
      }
    });
  } catch (error) {
    console.error('Send event reminder error:', error);
  }
};

export const sendRegistrationApprovalNotification = async (userId: string, type: 'DAYCARE' | 'EVENT', entityId: string, status: string) => {
  try {
    const title = type === 'DAYCARE' ? 'Daycare Registration Update' : 'Event Registration Update';
    const message = status === 'APPROVED'
      ? `Your ${type.toLowerCase()} registration has been approved!`
      : `Your ${type.toLowerCase()} registration status has been updated to ${status}.`;

    await prisma.notification.create({
      data: {
        userId,
        type: 'IN_APP',
        title,
        message,
        metadata: {
          type: `${type}_REGISTRATION_STATUS`,
          entityId,
          status
        }
      }
    });
  } catch (error) {
    console.error('Send registration approval notification error:', error);
  }
};

export const sendDaycareProgressReportNotification = async (studentId: string, reportId: string) => {
  try {
    const report = await prisma.progressReport.findUnique({
      where: { id: reportId },
      include: {
        student: {
          include: {
            registration: true
          }
        }
      }
    });

    if (!report || !report.student.registration.parentId) {
      return;
    }

    await prisma.notification.create({
      data: {
        userId: report.student.registration.parentId,
        type: 'IN_APP',
        title: 'New Progress Report Available',
        message: `A new progress report for ${report.student.firstName} ${report.student.lastName} is now available for ${report.reportingPeriod}.`,
        metadata: {
          type: 'PROGRESS_REPORT',
          reportId: report.id,
          studentId: report.studentId
        }
      }
    });
  } catch (error) {
    console.error('Send progress report notification error:', error);
  }
};
