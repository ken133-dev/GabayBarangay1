import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { hashPassword } from '../utils/password';

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
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, contactNumber, address, roles, otpEnabled } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'First name, last name, email, and at least one role are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate roles
    const validRoles = [
      'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL',
      'BHW', 'BHW_COORDINATOR', 'DAYCARE_STAFF', 'DAYCARE_TEACHER',
      'SK_OFFICER', 'SK_CHAIRMAN', 'PARENT_RESIDENT', 'VISITOR'
    ];

    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
    }

    // Create the user with a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Temp!2025';
    const hashedPassword = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        contactNumber,
        address,
        roles: {
          connect: roles.map(roleName => ({ name: roleName }))
        },
        otpEnabled: otpEnabled || false,
        status: 'ACTIVE' // New users are active by default
      },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Created new user: ${firstName} ${lastName} (${email})`,
        entityType: 'USER',
        entityId: user.id,
        changes: { created: true, roles }
      }
    });

    res.status(201).json({ user, message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

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
      include: {
        roles: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform users to include role names as strings
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      contactNumber: user.contactNumber,
      address: user.address,
      status: user.status,
      createdAt: user.createdAt,
      roles: user.roles.map(r => r.name)
    }));

    res.json({ users: transformedUsers });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, middleName, email, contactNumber, address, otpEnabled } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use by another user' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        middleName,
        email,
        contactNumber,
        address,
        otpEnabled
      },
      include: {
        roles: {
          select: {
            name: true
          }
        }
      }
    });

    // Transform user to include role names as strings
    const transformedUser = {
      ...user,
      roles: user.roles.map(r => r.name)
    };

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated user details: ${firstName} ${lastName} (${email})`,
        entityType: 'USER',
        entityId: userId,
        changes: { firstName, lastName, email, contactNumber, address, otpEnabled }
      }
    });

    res.json({ user: transformedUser, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
      include: {
        roles: {
          select: {
            name: true
          }
        }
      }
    });

    // Transform user to include role names as strings
    const transformedUser = {
      ...user,
      roles: user.roles.map(r => r.name)
    };

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

    res.json({ user: transformedUser, message: 'User status updated successfully' });
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
      data: { 
        roles: {
          set: [], // Clear existing roles
          connect: [{ name: role }] // Connect the new role
        }
      },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
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
      data: {
        roles: {
          set: roles.map(roleName => ({ name: roleName }))
        }
      },
      include: {
        roles: {
          select: {
            name: true
          }
        }
      }
    });

    // Transform user to include role names as strings
    const transformedUser = {
      ...user,
      roles: user.roles.map(r => r.name)
    };

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

    res.json({ user: transformedUser, message: 'User roles updated successfully' });
  } catch (error) {
    console.error('Update user roles error:', error);
    res.status(500).json({ error: 'Failed to update user roles' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          select: {
            name: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform user to include role names as strings
    const transformedUser = {
      ...user,
      roles: user.roles.map(r => r.name)
    };

    res.json({ user: transformedUser });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Prevent deleting own account
    if (req.user!.userId === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Get user info before deletion for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Deleted user: ${user.firstName} ${user.lastName} (${user.email})`,
        entityType: 'USER',
        entityId: userId,
        changes: { deleted: true }
      }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
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

// ========== ROLE MANAGEMENT ==========
export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    // Validate required fields
    if (!name || !displayName || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Name, display name, and permissions are required' });
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }

    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description,
        permissions: permissions as any[]
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Created new role: ${displayName}`,
        entityType: 'ROLE',
        entityId: role.id,
        changes: { created: true, permissions }
      }
    });

    res.status(201).json({ role, message: 'Role created successfully' });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { roleId } = req.params;
    const { displayName, description, permissions, isActive } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Allow updating system roles but prevent changing their name or system status
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (isActive !== undefined && !existingRole.isSystem) {
      // Only allow changing active status for non-system roles
      updateData.isActive = isActive;
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated role: ${role.displayName}`,
        entityType: 'ROLE',
        entityId: roleId,
        changes: updateData
      }
    });

    res.json({ role, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const { roleId } = req.params;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { users: true }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(400).json({ error: 'System roles cannot be deleted' });
    }

    // Check if role is assigned to users
    if (role.users.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to users. Remove all users from this role first.' 
      });
    }

    await prisma.role.delete({
      where: { id: roleId }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Deleted role: ${role.displayName}`,
        entityType: 'ROLE',
        entityId: roleId,
        changes: { deleted: true }
      }
    });

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};

export const getPermissions = async (req: AuthRequest, res: Response) => {
  try {
    // Get all permissions from the enum
    const permissions = [
      // User Management
      { name: 'USER_CREATE', category: 'User Management', description: 'Create new user accounts' },
      { name: 'USER_READ', category: 'User Management', description: 'View user information' },
      { name: 'USER_UPDATE', category: 'User Management', description: 'Update user information' },
      { name: 'USER_DELETE', category: 'User Management', description: 'Delete user accounts' },
      { name: 'USER_SUSPEND', category: 'User Management', description: 'Suspend/unsuspend users' },
      { name: 'USER_APPROVE', category: 'User Management', description: 'Approve pending user accounts' },
      
      // Role Management
      { name: 'ROLE_CREATE', category: 'Role Management', description: 'Create new roles' },
      { name: 'ROLE_READ', category: 'Role Management', description: 'View roles and permissions' },
      { name: 'ROLE_UPDATE', category: 'Role Management', description: 'Update role permissions' },
      { name: 'ROLE_DELETE', category: 'Role Management', description: 'Delete roles' },
      
      // Health Services
      { name: 'PATIENT_CREATE', category: 'Health Services', description: 'Create patient records' },
      { name: 'PATIENT_READ', category: 'Health Services', description: 'View patient information' },
      { name: 'PATIENT_UPDATE', category: 'Health Services', description: 'Update patient records' },
      { name: 'PATIENT_DELETE', category: 'Health Services', description: 'Delete patient records' },
      { name: 'APPOINTMENT_MANAGE', category: 'Health Services', description: 'Manage appointments' },
      { name: 'IMMUNIZATION_MANAGE', category: 'Health Services', description: 'Manage immunization records' },
      
      // Daycare Management
      { name: 'DAYCARE_STUDENT_MANAGE', category: 'Daycare Management', description: 'Manage daycare students' },
      { name: 'DAYCARE_ATTENDANCE_MANAGE', category: 'Daycare Management', description: 'Manage attendance records' },
      { name: 'DAYCARE_REPORTS', category: 'Daycare Management', description: 'Generate daycare reports' },
      
      // SK Management
      { name: 'EVENT_MANAGE', category: 'SK Management', description: 'Create and manage events' },
      { name: 'EVENT_ATTENDANCE', category: 'SK Management', description: 'Manage event attendance' },
      
      // System Administration
      { name: 'SYSTEM_SETTINGS', category: 'System Administration', description: 'Manage system settings' },
      { name: 'AUDIT_LOGS', category: 'System Administration', description: 'View audit logs' },
      { name: 'ANNOUNCEMENTS_MANAGE', category: 'System Administration', description: 'Manage announcements' },
      
      // Reports
      { name: 'REPORTS_VIEW', category: 'Reports', description: 'View system reports' },
      { name: 'REPORTS_GENERATE', category: 'Reports', description: 'Generate reports' }
    ];

    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};