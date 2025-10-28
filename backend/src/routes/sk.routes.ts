import { Router } from 'express';
import { getSKAnalytics } from '../controllers/sk.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// SK Analytics route
router.get('/analytics', authenticate, getSKAnalytics);

export default router;