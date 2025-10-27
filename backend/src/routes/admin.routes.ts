import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  updateUserRoles,
  getUserById,
  deleteUser,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== ADMIN STATS ==========
router.get('/stats', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  getAdminStats
);

// ========== USER MANAGEMENT ==========
router.post('/users', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  createUser
);

router.get('/users', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  getAllUsers
);

router.get('/users/:userId', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  getUserById
);

router.patch('/users/:userId/status', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  updateUserStatus
);

router.put('/users/:userId/role', 
  authenticate, 
  authorize('SYSTEM_ADMIN'), 
  updateUserRole
);

router.put('/users/:userId/roles', 
  authenticate, 
  authorize('SYSTEM_ADMIN'), 
  updateUserRoles
);

router.put('/users/:userId', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  updateUser
);

// ========== SYSTEM SETTINGS ==========
router.get('/settings', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'), 
  getSystemSettings
);

router.put('/settings', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'), 
  updateSystemSettings
);

// ========== ANNOUNCEMENTS ==========
router.get('/announcements', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  getAnnouncements
);

router.post('/announcements', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  createAnnouncement
);

router.put('/announcements/:id', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  updateAnnouncement
);

router.delete('/announcements/:id', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  deleteAnnouncement
);

// ========== ROLE MANAGEMENT ==========
router.get('/roles', 
  authenticate, 
  authorize('SYSTEM_ADMIN'), 
  getRoles
);

router.post('/roles', 
  authenticate, 
  authorize('SYSTEM_ADMIN'), 
  createRole
);

router.put('/roles/:roleId', 
  authenticate, 
  authorize('SYSTEM_ADMIN'), 
  updateRole
);

router.delete('/roles/:roleId', 
  authenticate, 
  authorize('SYSTEM_ADMIN'), 
  deleteRole
);

router.get('/permissions', 
  authenticate, 
  authorize('SYSTEM_ADMIN'), 
  getPermissions
);

export default router;