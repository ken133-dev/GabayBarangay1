import { Router } from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs
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
router.get('/users', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  getAllUsers
);

router.patch('/users/:userId/status', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'), 
  updateUserStatus
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

// ========== AUDIT LOGS ==========
router.get('/audit-logs', 
  authenticate, 
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'), 
  getAuditLogs
);

export default router;