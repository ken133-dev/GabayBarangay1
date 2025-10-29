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
router.post('/', authenticate, createEvent);
router.get('/', authenticate, getAllEvents);
router.get('/public', getPublicEvents);
router.get('/:id', authenticate, getEventById);
router.put('/:id', authenticate, updateEvent);
router.patch('/:id/status', authenticate, updateEventStatus);
router.delete('/:id', authenticate, deleteEvent);

// ========== EVENT REGISTRATION ROUTES ==========
router.post('/register', authenticate, registerForEvent);
router.get('/:eventId/registrations', authenticate, getEventRegistrations);
router.get('/registrations/my', authenticate, getMyRegistrations);
router.delete('/:eventId/registrations/cancel', authenticate, cancelRegistration);

// ========== EVENT ATTENDANCE ROUTES ==========
router.post('/attendance', authenticate, recordAttendance);
router.get('/:eventId/attendance', authenticate, getEventAttendance);

// ========== ANALYTICS & CERTIFICATES ROUTES ==========
router.get('/:eventId/analytics', authenticate, getEventAnalytics);
router.post('/:eventId/certificates', authenticate, generateCertificates);

export default router;
