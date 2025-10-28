import { Router } from 'express';
import {
  // Notification Management
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  // Notification Preferences
  getNotificationPreferences,
  updateNotificationPreferences,
  // Broadcast Messages
  sendBroadcast,
  getBroadcastHistory
} from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== NOTIFICATION ROUTES ==========
router.post('/', authenticate, sendNotification);
router.get('/', authenticate, getUserNotifications);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

// ========== NOTIFICATION PREFERENCES ROUTES ==========
router.get('/preferences', authenticate, getNotificationPreferences);
router.put('/preferences', authenticate, updateNotificationPreferences);

// ========== BROADCAST ROUTES ==========
router.post('/broadcast', authenticate, sendBroadcast);
router.get('/broadcast/history', authenticate, getBroadcastHistory);

export default router;
