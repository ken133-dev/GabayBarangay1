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
router.get('/health', authenticate, getHealthReport);
router.get('/health/stats', authenticate, getHealthStats);
router.get('/daycare', authenticate, getDaycareReport);
router.get('/sk', authenticate, getSKReport);

// ========== CROSS-MODULE ANALYTICS ==========
router.get('/cross-module', authenticate, getCrossModuleAnalytics);



export default router;
