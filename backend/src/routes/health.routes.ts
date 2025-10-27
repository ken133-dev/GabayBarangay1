import { Router } from 'express';
import {
  // Patient Management
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  // Appointment Management
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getMyAppointments,
  // Health Records
  createHealthRecord,
  getHealthRecords,
  getMyHealthRecords,
  // Immunization Records
  createImmunizationRecord,
  getImmunizationRecords,
  getMyImmunizationRecords,
  getImmunizationSchedule,
  getPatientImmunizationStatus,
  // Vaccination Management
  createVaccination,
  getVaccinations,
  getUpcomingVaccinations,
  // Certificate Management
  createCertificate,
  getCertificates
} from '../controllers/health.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== PATIENT ROUTES ==========
router.post('/patients', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), createPatient);
router.get('/patients', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN', 'PARENT_RESIDENT', 'BARANGAY_OFFICIAL'), getAllPatients);
router.get('/patients/:id', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN', 'PARENT_RESIDENT', 'BARANGAY_OFFICIAL'), getPatientById);
router.put('/patients/:id', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), updatePatient);
router.delete('/patients/:id', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), deletePatient);

// ========== APPOINTMENT ROUTES ==========
router.post('/appointments', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), createAppointment);
router.get('/appointments', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN', 'BARANGAY_OFFICIAL'), getAppointments);
router.get('/appointments/my', authenticate, authorize('PATIENT'), getMyAppointments);
router.get('/appointments/:id', authenticate, getAppointmentById);
router.put('/appointments/:id', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), updateAppointment);
router.patch('/appointments/:id/status', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), updateAppointmentStatus);
router.delete('/appointments/:id', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), deleteAppointment);

// ========== HEALTH RECORD ROUTES ==========
router.post('/records', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), createHealthRecord);
router.get('/records', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), getHealthRecords);
router.get('/records/my', authenticate, authorize('PATIENT'), getMyHealthRecords);

// ========== IMMUNIZATION RECORD ROUTES ==========
router.post('/immunization-records', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), createImmunizationRecord);
router.get('/immunization-records', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN', 'BARANGAY_OFFICIAL'), getImmunizationRecords);
router.get('/immunization-records/my', authenticate, authorize('PARENT_RESIDENT'), getMyImmunizationRecords);
router.get('/immunization-schedule', authenticate, getImmunizationSchedule);
router.get('/patients/:patientId/immunization-status', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN', 'BARANGAY_OFFICIAL'), getPatientImmunizationStatus);

// ========== VACCINATION ROUTES ==========
router.post('/vaccinations', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), createVaccination);
router.get('/vaccinations', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), getVaccinations);
router.get('/vaccinations/upcoming', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), getUpcomingVaccinations);

// ========== CERTIFICATE ROUTES ==========
router.post('/certificates', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'), createCertificate);
router.get('/certificates', authenticate, authorize('BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN', 'BARANGAY_OFFICIAL'), getCertificates);

export default router;
