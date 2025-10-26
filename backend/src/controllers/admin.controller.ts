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
      totalEvents
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.patient.count(),
      prisma.daycareStudent.count(),
      prisma.event.count({ where: { status: 'PUBLISHED' } })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalPatients,
      totalStudents,
      totalEvents
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

// ========== USER MANAGEMENT ==========
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { status, role, search } = req.query;
    
    const where: any = {};
    
    if (status) where.status = status;
    if (role) where.role = role;
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
        role: true,
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
        role: true,
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

// ========== SYSTEM SETTINGS ==========
export const getSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    // For now, return default settings since we don't have a settings table
    const settings = {
      barangayName: 'Barangay Binitayan',
      barangayAddress: 'Daraga, Albay, Philippines',
      barangayEmail: 'contact@barangaybinitayan.gov.ph',
      barangayContactNumber: '+63 XXX XXX XXXX',
      systemName: 'TheyCare Portal',
      systemVersion: '1.0.0',
      maintenanceMode: false,
      allowRegistration: true,
      requireApproval: true
    };

    res.json({ settings });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
};

export const updateSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'Updated system settings',
        entityType: 'SYSTEM',
        changes: settings
      }
    });

    res.json({ settings, message: 'System settings updated successfully' });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
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