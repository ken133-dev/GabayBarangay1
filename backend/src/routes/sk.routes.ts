import { Router } from 'express';
import { getSKAnalytics } from '../controllers/sk.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// SK Analytics route
router.get('/analytics', authenticate, authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN', 'BARANGAY_OFFICIAL'), getSKAnalytics);

export default router;