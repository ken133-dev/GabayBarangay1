import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

// ========== REGISTRATION MANAGEMENT ==========

export const createDaycareRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const parentId = req.user!.userId;
    const registrationData = req.body;

    const registration = await prisma.daycareRegistration.create({
      data: {
        ...registrationData,
        parentId,
        childDateOfBirth: new Date(registrationData.childDateOfBirth)
      },
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Daycare registration submitted successfully. Pending approval.',
      registration
    });
  } catch (error) {
    console.error('Create daycare registration error:', error);
    res.status(500).json({ error: 'Failed to create registration' });
  }
};

export const getDaycareRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const where = status ? { status: status as any } : {};

    const registrations = await prisma.daycareRegistration.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            contactNumber: true
          }
        },
        student: true
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json({ registrations });
  } catch (error) {
    console.error('Get daycare registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response) => {
  try {
    const parentId = req.user!.userId;

    const registrations = await prisma.daycareRegistration.findMany({
      where: { parentId },
      include: {
        student: {
          include: {
            attendanceRecords: {
              orderBy: { date: 'desc' },
              take: 10
            },
            progressReports: {
              orderBy: { generatedAt: 'desc' }
            }
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json({ registrations });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

export const approveRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes, allergies, medicalConditions } = req.body;
    const reviewedBy = req.user!.userId;

    // Get the registration
    const registration = await prisma.daycareRegistration.findUnique({
      where: { id }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    if (registration.status !== 'PENDING') {
      return res.status(400).json({ error: 'Registration already processed' });
    }

    // Update registration and create student
    const [updatedRegistration, student] = await prisma.$transaction([
      prisma.daycareRegistration.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy,
          notes
        }
      }),
      prisma.daycareStudent.create({
        data: {
          registrationId: id,
          firstName: registration.childFirstName,
          lastName: registration.childLastName,
          middleName: registration.childMiddleName,
          dateOfBirth: registration.childDateOfBirth,
          gender: registration.childGender,
          address: registration.address,
          emergencyContact: registration.emergencyContact,
          allergies: allergies || null,
          medicalConditions: medicalConditions || null
        }
      })
    ]);

    res.json({
      message: 'Registration approved and student enrolled successfully',
      registration: updatedRegistration,
      student
    });
  } catch (error) {
    console.error('Approve registration error:', error);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
};

export const rejectRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const reviewedBy = req.user!.userId;

    const registration = await prisma.daycareRegistration.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy,
        notes
      }
    });

    res.json({
      message: 'Registration rejected',
      registration
    });
  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({ error: 'Failed to reject registration' });
  }
};

// ========== STUDENT MANAGEMENT ==========

export const getDaycareStudents = async (req: AuthRequest, res: Response) => {
  try {
    const students = await prisma.daycareStudent.findMany({
      include: {
        registration: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                contactNumber: true
              }
            }
          }
        },
        _count: {
          select: {
            attendanceRecords: true,
            progressReports: true
          }
        }
      },
      orderBy: { enrollmentDate: 'desc' }
    });

    res.json({ students });
  } catch (error) {
    console.error('Get daycare students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.daycareStudent.findUnique({
      where: { id },
      include: {
        registration: {
          include: {
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                contactNumber: true
              }
            }
          }
        },
        attendanceRecords: {
          orderBy: { date: 'desc' },
          take: 30
        },
        progressReports: {
          orderBy: { generatedAt: 'desc' }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ student });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

// ========== ATTENDANCE MANAGEMENT ==========

export const recordAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, date, status, timeIn, timeOut, remarks } = req.body;
    const recordedBy = req.user!.userId;

    const attendance = await prisma.attendanceRecord.create({
      data: {
        studentId,
        date: new Date(date),
        status,
        timeIn: timeIn ? new Date(timeIn) : null,
        timeOut: timeOut ? new Date(timeOut) : null,
        remarks,
        recordedBy
      },
      include: {
        student: true
      }
    });

    res.status(201).json({ message: 'Attendance recorded successfully', attendance });
  } catch (error) {
    console.error('Record attendance error:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, date, startDate, endDate } = req.query;

    let where: any = {};

    if (studentId) {
      where.studentId = studentId as string;
    }

    if (date) {
      const queryDate = new Date(date as string);
      where.date = queryDate;
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const attendance = await prisma.attendanceRecord.findMany({
      where,
      include: {
        student: true
      },
      orderBy: { date: 'desc' }
    });

    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

export const updateAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, timeIn, timeOut, remarks } = req.body;

    const attendance = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(timeIn && { timeIn: new Date(timeIn) }),
        ...(timeOut && { timeOut: new Date(timeOut) }),
        ...(remarks !== undefined && { remarks })
      },
      include: {
        student: true
      }
    });

    res.json({ message: 'Attendance updated successfully', attendance });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
};

// ========== PROGRESS REPORTS ==========

export const createProgressReport = async (req: AuthRequest, res: Response) => {
  try {
    const {
      studentId,
      reportingPeriod,
      academicPerformance,
      socialBehavior,
      physicalDevelopment,
      emotionalDevelopment,
      recommendations
    } = req.body;
    const generatedBy = req.user!.userId;

    const report = await prisma.progressReport.create({
      data: {
        studentId,
        reportingPeriod,
        academicPerformance,
        socialBehavior,
        physicalDevelopment,
        emotionalDevelopment,
        recommendations,
        generatedBy
      },
      include: {
        student: {
          include: {
            registration: {
              include: {
                parent: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Progress report created successfully',
      report
    });
  } catch (error) {
    console.error('Create progress report error:', error);
    res.status(500).json({ error: 'Failed to create progress report' });
  }
};

export const getProgressReports = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.query;

    const where = studentId ? { studentId: studentId as string } : {};

    const reports = await prisma.progressReport.findMany({
      where,
      include: {
        student: {
          include: {
            registration: {
              include: {
                parent: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });

    res.json({ reports });
  } catch (error) {
    console.error('Get progress reports error:', error);
    res.status(500).json({ error: 'Failed to fetch progress reports' });
  }
};

export const getMyChildrenProgressReports = async (req: AuthRequest, res: Response) => {
  try {
    const parentId = req.user!.userId;

    // Get all students whose parent is this user
    const students = await prisma.daycareStudent.findMany({
      where: {
        registration: {
          parentId
        }
      },
      include: {
        progressReports: {
          orderBy: { generatedAt: 'desc' }
        }
      }
    });

    res.json({ students });
  } catch (error) {
    console.error('Get my children progress reports error:', error);
    res.status(500).json({ error: 'Failed to fetch progress reports' });
  }
};

// ========== LEARNING MATERIALS ==========

export const createLearningMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      fileUrl,
      fileType,
      category,
      isPublic
    } = req.body;
    const uploadedBy = req.user!.userId;

    const material = await prisma.learningMaterial.create({
      data: {
        title,
        description,
        fileUrl,
        fileType,
        category,
        isPublic: isPublic !== false,
        uploadedBy
      }
    });

    res.status(201).json({
      message: 'Learning material uploaded successfully',
      material
    });
  } catch (error) {
    console.error('Create learning material error:', error);
    res.status(500).json({ error: 'Failed to upload learning material' });
  }
};

export const getLearningMaterials = async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;
    const userRoles = req.user!.roles || [];
    const userRole = userRoles[0] || 'VISITOR';

    // Parents can only see public materials
    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    // If user is not staff/teacher/admin, only show public materials
    if (!['DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'].includes(userRole)) {
      where.isPublic = true;
    }

    const materials = await prisma.learningMaterial.findMany({
      where,
      orderBy: { uploadedAt: 'desc' }
    });

    res.json({ materials });
  } catch (error) {
    console.error('Get learning materials error:', error);
    res.status(500).json({ error: 'Failed to fetch learning materials' });
  }
};

export const updateLearningMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const material = await prisma.learningMaterial.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Learning material updated successfully',
      material
    });
  } catch (error) {
    console.error('Update learning material error:', error);
    res.status(500).json({ error: 'Failed to update learning material' });
  }
};

export const deleteLearningMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.learningMaterial.delete({
      where: { id }
    });

    res.json({ message: 'Learning material deleted successfully' });
  } catch (error) {
    console.error('Delete learning material error:', error);
    res.status(500).json({ error: 'Failed to delete learning material' });
  }
};
