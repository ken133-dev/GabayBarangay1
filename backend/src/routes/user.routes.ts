import { Router } from 'express';
import { getAllUsers, updateUserStatus } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'), getAllUsers);
router.patch('/:userId/status', authenticate, authorize('SYSTEM_ADMIN'), updateUserStatus);

export default router;
