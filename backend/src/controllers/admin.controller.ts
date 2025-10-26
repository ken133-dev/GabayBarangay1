import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

// ========== ADMIN STATS ==========
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalPatients,
      totalStudents,
      totalEvents,
      recentActivities
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.patient.count(),
      prisma.daycareStudent.count(),
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalPatients,
      totalStudents,
      totalEvents,
      recentActivities: recentActivities.map(log => ({
        id: log.id,
        action: log.action,
        user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
        timestamp: formatTimeAgo(log.timestamp),
        type: getActivityType(log.action)
      }))
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

// Helper function to determine activity type
const getActivityType = (action: string): 'success' | 'warning' | 'info' => {
  if (action.toLowerCase().includes('suspend') || action.toLowerCase().includes('delete')) {
    return 'warning';
  }
  if (action.toLowerCase().includes('create') || action.toLowerCase().includes('approve')) {
    return 'success';
  }
  return 'info';
};

// ========== USER MANAGEMENT ==========
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { status, role, search } = req.query;
    
    const where: any = {};
    
    if (status) where.status = status;
    if (role) where.roles = { has: role };
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        status: true,
        createdAt: true,
        contactNumber: true,
        address: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        status: true
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated user status to ${status}`,
        entityType: 'USER',
        entityId: userId,
        changes: { status }
      }
    });

    res.json({ user, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = [
      'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL',
      'BHW', 'BHW_COORDINATOR', 'DAYCARE_STAFF', 'DAYCARE_TEACHER',
      'SK_OFFICER', 'SK_CHAIRMAN', 'PARENT_RESIDENT', 'VISITOR'
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roles: [role as any] },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        status: true
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated user role to ${role}`,
        entityType: 'USER',
        entityId: userId,
        changes: { role }
      }
    });

    res.json({ user, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const updateUserRoles = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    const validRoles = [
      'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL',
      'BHW', 'BHW_COORDINATOR', 'DAYCARE_STAFF', 'DAYCARE_TEACHER',
      'SK_OFFICER', 'SK_CHAIRMAN', 'PARENT_RESIDENT', 'VISITOR'
    ];

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'Roles must be a non-empty array' });
    }

    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roles: roles as any[] },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        status: true
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated user roles to ${roles.join(', ')}`,
        entityType: 'USER',
        entityId: userId,
        changes: { roles }
      }
    });

    res.json({ user, message: 'User roles updated successfully' });
  } catch (error) {
    console.error('Update user roles error:', error);
    res.status(500).json({ error: 'Failed to update user roles' });
  }
};

// ========== SYSTEM SETTINGS ==========
export const getSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.systemSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          barangayName: 'Barangay Binitayan',
          barangayAddress: 'Daraga, Albay, Philippines',
          barangayEmail: 'contact@barangaybinitayan.gov.ph',
          barangayContactNumber: '+63 XXX XXX XXXX',
          systemName: 'Gabay Barangay',
          systemVersion: '1.0.0',
          maintenanceMode: false,
          allowRegistration: true,
          requireApproval: true
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
};

export const updateSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updateData = req.body;

    // Get existing settings or create if none exist
    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          barangayName: 'Barangay Binitayan',
          barangayAddress: 'Daraga, Albay, Philippines',
          barangayEmail: 'contact@barangaybinitayan.gov.ph',
          barangayContactNumber: '+63 XXX XXX XXXX',
          systemName: 'Gabay Barangay',
          systemVersion: '1.0.0',
          maintenanceMode: false,
          allowRegistration: true,
          requireApproval: true
        }
      });
    }

    // Update settings
    const updatedSettings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: updateData
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'Updated system settings',
        entityType: 'SYSTEM',
        entityId: settings.id,
        changes: updateData
      }
    });

    res.json({ settings: updatedSettings, message: 'System settings updated successfully' });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
};

// ========== ANNOUNCEMENTS ==========
export const getAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category, priority, isPublic, expiresAt } = req.body;

    const createData: any = {
      title,
      content,
      category,
      priority: priority || 'NORMAL',
      isPublic: isPublic !== undefined ? isPublic : true,
      publishedBy: req.user!.userId
    };

    // Handle expiresAt field - convert to Date or set to null
    if (expiresAt && expiresAt.trim() !== '') {
      createData.expiresAt = new Date(expiresAt);
    }

    const announcement = await prisma.announcement.create({
      data: createData
    });

    res.status(201).json({ announcement, message: 'Announcement created successfully' });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, isPublic, expiresAt } = req.body;

    const updateData: any = {
      title,
      content,
      category,
      priority,
      isPublic
    };

    // Handle expiresAt field - convert to Date or set to null
    if (expiresAt && expiresAt.trim() !== '') {
      updateData.expiresAt = new Date(expiresAt);
    } else {
      updateData.expiresAt = null;
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData
    });

    res.json({ announcement, message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({
      where: { id }
    });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

// ========== AUDIT LOGS ==========
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, action, entityType } = req.query;
    
    const where: any = {};
    if (action) where.action = { contains: action as string, mode: 'insensitive' };
    if (entityType) where.entityType = entityType;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({ 
      logs, 
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};