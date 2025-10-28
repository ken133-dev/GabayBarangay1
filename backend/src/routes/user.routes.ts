import { Router } from 'express';
import { getAllUsers, updateUserStatus } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getAllUsers);
router.patch('/:userId/status', authenticate, updateUserStatus);

export default router;
