import { Router } from 'express';
import {
  // Event Management
  createEvent,
  getAllEvents,
  getPublicEvents,
  getEventById,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  // Event Registration
  registerForEvent,
  getEventRegistrations,
  getMyRegistrations,
  cancelRegistration,
  // Event Attendance
  recordAttendance,
  getEventAttendance,
  // Analytics & Certificates
  getEventAnalytics,
  generateCertificates
} from '../controllers/event.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== EVENT MANAGEMENT ROUTES ==========
router.post('/', authenticate, authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'), createEvent);
router.get('/', authenticate, getAllEvents);
router.get('/public', getPublicEvents);
router.get('/:id', authenticate, getEventById);
router.put('/:id', authenticate, authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'), updateEvent);
router.patch('/:id/status', authenticate, authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'), updateEventStatus);
router.delete('/:id', authenticate, authorize('SK_CHAIRMAN', 'SYSTEM_ADMIN'), deleteEvent);

// ========== EVENT REGISTRATION ROUTES ==========
router.post('/register', authenticate, registerForEvent);
router.get('/:eventId/registrations', authenticate, authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'), getEventRegistrations);
router.get('/registrations/my', authenticate, getMyRegistrations);
router.delete('/:eventId/registrations/cancel', authenticate, cancelRegistration);

// ========== EVENT ATTENDANCE ROUTES ==========
router.post('/attendance', authenticate, authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'), recordAttendance);
router.get('/:eventId/attendance', authenticate, authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'), getEventAttendance);

// ========== ANALYTICS & CERTIFICATES ROUTES ==========
router.get('/:eventId/analytics', authenticate, authorize('SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'), getEventAnalytics);
router.post('/:eventId/certificates', authenticate, authorize('SK_CHAIRMAN', 'SYSTEM_ADMIN'), generateCertificates);

export default router;
