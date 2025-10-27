import { Router } from 'express';
import {
  // Registration Management
  createDaycareRegistration,
  getDaycareRegistrations,
  getMyRegistrations,
  approveRegistration,
  rejectRegistration,
  // Student Management
  getDaycareStudents,
  getStudentById,
  // Attendance Management
  recordAttendance,
  getAttendance,
  updateAttendance,
  // Progress Reports
  createProgressReport,
  getProgressReports,
  getMyChildrenProgressReports,
  // Learning Materials
  createLearningMaterial,
  getLearningMaterials,
  updateLearningMaterial,
  deleteLearningMaterial
} from '../controllers/daycare.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== REGISTRATION ROUTES ==========
router.post('/registrations', authenticate, authorize('PARENT_RESIDENT', 'SYSTEM_ADMIN'), createDaycareRegistration);
router.get('/registrations', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN', 'BARANGAY_OFFICIAL'), getDaycareRegistrations);
router.get('/registrations/my', authenticate, authorize('PARENT_RESIDENT'), getMyRegistrations);
router.patch('/registrations/:id/approve', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), approveRegistration);
router.patch('/registrations/:id/reject', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), rejectRegistration);

// ========== STUDENT ROUTES ==========
router.get('/students', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN', 'BARANGAY_OFFICIAL'), getDaycareStudents);
router.get('/students/:id', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN', 'PARENT_RESIDENT', 'BARANGAY_OFFICIAL'), getStudentById);

// ========== ATTENDANCE ROUTES ==========
router.post('/attendance', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), recordAttendance);
router.get('/attendance', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN', 'BARANGAY_OFFICIAL'), getAttendance);
router.patch('/attendance/:id', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), updateAttendance);

// ========== PROGRESS REPORT ROUTES ==========
router.post('/progress-reports', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), createProgressReport);
router.get('/progress-reports', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN', 'BARANGAY_OFFICIAL'), getProgressReports);
router.get('/progress-reports/my', authenticate, authorize('PARENT_RESIDENT'), getMyChildrenProgressReports);

// ========== LEARNING MATERIAL ROUTES ==========
router.post('/learning-materials', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), createLearningMaterial);
router.get('/learning-materials', authenticate, getLearningMaterials);
router.patch('/learning-materials/:id', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), updateLearningMaterial);
router.delete('/learning-materials/:id', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), deleteLearningMaterial);

export default router;
