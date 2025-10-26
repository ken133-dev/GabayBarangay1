import { Router } from 'express';
import {
  getSystemOverview,
  getHealthServicesReport,
  getDaycareServicesReport,
  getSKEngagementReport,
  getDashboardStats,
  getTrendAnalytics,
  getParticipationMetrics
} from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== SYSTEM OVERVIEW ROUTES ==========
router.get(
  '/overview',
  authenticate,
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getSystemOverview
);

// ========== MODULE-SPECIFIC REPORTS ==========
router.get(
  '/health',
  authenticate,
  authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getHealthServicesReport
);

router.get(
  '/daycare',
  authenticate,
  authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getDaycareServicesReport
);

router.get(
  '/sk-engagement',
  authenticate,
  authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getSKEngagementReport
);

// ========== DASHBOARD & ANALYTICS ROUTES ==========
router.get('/dashboard-stats', authenticate, getDashboardStats);
router.get('/trends', authenticate, getTrendAnalytics);
router.get(
  '/participation',
  authenticate,
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getParticipationMetrics
);

export default router;
