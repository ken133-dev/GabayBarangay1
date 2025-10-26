import { Router } from 'express';
import {
  getHealthReport,
  getDaycareReport,
  getSKReport,
  getCrossModuleAnalytics,
  getHealthStats
} from '../controllers/reports.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== MODULE-SPECIFIC REPORTS ==========
router.get(
  '/health',
  authenticate,
  authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getHealthReport
);

router.get(
  '/health/stats',
  authenticate,
  authorize('BHW_COORDINATOR', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getHealthStats
);

router.get(
  '/daycare',
  authenticate,
  authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getDaycareReport
);

router.get(
  '/sk',
  authenticate,
  authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getSKReport
);

// ========== CROSS-MODULE ANALYTICS ==========
router.get(
  '/cross-module',
  authenticate,
  authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'),
  getCrossModuleAnalytics
);



export default router;
