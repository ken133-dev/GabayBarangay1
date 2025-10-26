import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

// ========== PATIENT MANAGEMENT ==========

export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const patientData = req.body;

    const patient = await prisma.patient.create({
      data: {
        ...patientData,
        dateOfBirth: new Date(patientData.dateOfBirth)
      }
    });

    res.status(201).json({ message: 'Patient created successfully', patient });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
};

export const getAllPatients = async (req: AuthRequest, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            appointments: true,
            healthRecords: true,
            vaccinations: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ patients });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

export const getPatientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 10
        },
        healthRecords: {
          orderBy: { recordDate: 'desc' },
          take: 10
        },
        vaccinations: {
          orderBy: { dateGiven: 'desc' }
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ patient });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
};

export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...updateData,
        ...(updateData.dateOfBirth && { dateOfBirth: new Date(updateData.dateOfBirth) })
      }
    });

    res.json({ message: 'Patient updated successfully', patient });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
};

export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.patient.delete({
      where: { id }
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
};

// ========== APPOINTMENT MANAGEMENT ==========

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, appointmentDate, appointmentType, notes } = req.body;
    const healthWorkerId = req.user!.userId;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        healthWorkerId,
        appointmentDate: new Date(appointmentDate),
        appointmentType,
        notes
      },
      include: {
        patient: true,
        healthWorker: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({ message: 'Appointment created successfully', appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: true,
        healthWorker: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { appointmentDate: 'desc' }
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        healthWorker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes })
      },
      include: {
        patient: true
      }
    });

    res.json({ message: 'Appointment status updated', appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Find patient linked to this user
    const patient = await prisma.patient.findFirst({
      where: { userId }
    });

    if (!patient) {
      return res.json({ appointments: [] });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        healthWorker: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { appointmentDate: 'desc' }
    });

    res.json({ appointments });
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// ========== HEALTH RECORDS ==========

export const createHealthRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, recordDate, diagnosis, treatment, medications, vitalSigns, notes } = req.body;

    const healthRecord = await prisma.healthRecord.create({
      data: {
        patientId,
        recordDate: new Date(recordDate),
        diagnosis,
        treatment,
        medications,
        vitalSigns,
        notes
      },
      include: {
        patient: true
      }
    });

    res.status(201).json({ message: 'Health record created successfully', healthRecord });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({ error: 'Failed to create health record' });
  }
};

export const getHealthRecords = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.query;

    const where = patientId ? { patientId: patientId as string } : {};

    const healthRecords = await prisma.healthRecord.findMany({
      where,
      include: {
        patient: true
      },
      orderBy: { recordDate: 'desc' }
    });

    res.json({ healthRecords });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
};

export const getMyHealthRecords = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Find patient linked to this user
    const patient = await prisma.patient.findFirst({
      where: { userId }
    });

    if (!patient) {
      return res.json({ healthRecords: [] });
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { recordDate: 'desc' }
    });

    res.json({ healthRecords, patient });
  } catch (error) {
    console.error('Get my health records error:', error);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
};

// ========== VACCINATION MANAGEMENT ==========

export const createVaccination = async (req: AuthRequest, res: Response) => {
  try {
    const {
      patientId,
      vaccineName,
      vaccineType,
      dosage,
      dateGiven,
      nextDueDate,
      administeredBy,
      batchNumber,
      notes
    } = req.body;

    const vaccination = await prisma.vaccination.create({
      data: {
        patientId,
        vaccineName,
        vaccineType,
        dosage,
        dateGiven: new Date(dateGiven),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        administeredBy,
        batchNumber,
        notes
      },
      include: {
        patient: true
      }
    });

    res.status(201).json({ message: 'Vaccination record created successfully', vaccination });
  } catch (error) {
    console.error('Create vaccination error:', error);
    res.status(500).json({ error: 'Failed to create vaccination record' });
  }
};

export const getVaccinations = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.query;

    const where = patientId ? { patientId: patientId as string } : {};

    const vaccinations = await prisma.vaccination.findMany({
      where,
      include: {
        patient: true
      },
      orderBy: { dateGiven: 'desc' }
    });

    res.json({ vaccinations });
  } catch (error) {
    console.error('Get vaccinations error:', error);
    res.status(500).json({ error: 'Failed to fetch vaccinations' });
  }
};

export const getUpcomingVaccinations = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();

    const vaccinations = await prisma.vaccination.findMany({
      where: {
        nextDueDate: {
          gte: today
        }
      },
      include: {
        patient: true
      },
      orderBy: { nextDueDate: 'asc' }
    });

    res.json({ vaccinations });
  } catch (error) {
    console.error('Get upcoming vaccinations error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming vaccinations' });
  }
};
