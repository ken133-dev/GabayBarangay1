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
  getCertificates,
  downloadCertificate
} from '../controllers/health.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// ========== PATIENT ROUTES ==========
router.post('/patients', authenticate, createPatient);
router.get('/patients', authenticate, getAllPatients);
router.get('/patients/:id', authenticate, getPatientById);
router.put('/patients/:id', authenticate, updatePatient);
router.delete('/patients/:id', authenticate, deletePatient);

// ========== APPOINTMENT ROUTES ==========
router.post('/appointments', authenticate, createAppointment);
router.get('/appointments', authenticate, getAppointments);
router.get('/appointments/my', authenticate, getMyAppointments);
router.get('/appointments/:id', authenticate, getAppointmentById);
router.put('/appointments/:id', authenticate, updateAppointment);
router.patch('/appointments/:id/status', authenticate, updateAppointmentStatus);
router.delete('/appointments/:id', authenticate, deleteAppointment);

// ========== HEALTH RECORD ROUTES ==========
router.post('/records', authenticate, createHealthRecord);
router.get('/records', authenticate, getHealthRecords);
router.get('/records/my', authenticate, getMyHealthRecords);

// ========== IMMUNIZATION RECORD ROUTES ==========
router.post('/immunization-records', authenticate, createImmunizationRecord);
router.get('/immunization-records', authenticate, getImmunizationRecords);
router.get('/immunization-records/my', authenticate, getMyImmunizationRecords);
router.get('/immunization-schedule', authenticate, getImmunizationSchedule);
router.get('/patients/:patientId/immunization-status', authenticate, getPatientImmunizationStatus);

// ========== VACCINATION ROUTES ==========
router.post('/vaccinations', authenticate, createVaccination);
router.get('/vaccinations', authenticate, getVaccinations);
router.get('/vaccinations/upcoming', authenticate, getUpcomingVaccinations);

// ========== CERTIFICATE ROUTES ==========
router.post('/certificates', authenticate, createCertificate);
router.get('/certificates', authenticate, getCertificates);
router.get('/certificates/:id/download', authenticate, downloadCertificate);

export default router;
