import { Router } from 'express';
// @ts-ignore
import multer from 'multer';
import path from 'path';
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
  deleteLearningMaterial,
  downloadLearningMaterial
} from '../controllers/daycare.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Configure multer for learning materials
// @ts-ignore
const learningMaterialUpload = multer({
  // @ts-ignore
  storage: multer.diskStorage({
    // @ts-ignore
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../uploads/learning-materials');
      cb(null, uploadPath);
    },
    // @ts-ignore
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = 'learning-material-' + uniqueSuffix + '-' + file.originalname;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  // @ts-ignore
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/mpeg'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  }
});

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
router.post('/learning-materials', learningMaterialUpload.single('file'), authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), createLearningMaterial);
router.get('/learning-materials', authenticate, getLearningMaterials);
router.get('/learning-materials/:id/download', authenticate, downloadLearningMaterial);
router.patch('/learning-materials/:id', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), updateLearningMaterial);
router.delete('/learning-materials/:id', authenticate, authorize('DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'), deleteLearningMaterial);

export default router;
