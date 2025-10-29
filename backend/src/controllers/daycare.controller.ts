import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { generateCertificatePDF } from '../utils/certificateGenerator';

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
    const { studentId, attendanceDate, date, status, timeIn, timeOut, remarks, notes } = req.body;
    const recordedBy = req.user!.userId;

    // Use attendanceDate if provided, otherwise fall back to date
    const attendanceDay = attendanceDate || date;
    
    if (!attendanceDay) {
      return res.status(400).json({ error: 'Attendance date is required' });
    }

    // Check if attendance already exists for this student and date
    const existingAttendance = await prisma.attendanceRecord.findFirst({
      where: {
        studentId,
        date: new Date(attendanceDay)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendance already recorded for this student on this date. Use update instead.' });
    }

    // Parse time strings and combine with date
    let timeInDate = null;
    let timeOutDate = null;
    
    if (timeIn && timeIn !== '') {
      if (timeIn.includes(':')) {
        const [hours, minutes] = timeIn.split(':');
        const baseDate = new Date(attendanceDay);
        timeInDate = new Date(baseDate);
        timeInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        timeInDate = new Date(timeIn);
      }
    }
    
    if (timeOut && timeOut !== '') {
      if (timeOut.includes(':')) {
        const [hours, minutes] = timeOut.split(':');
        const baseDate = new Date(attendanceDay);
        timeOutDate = new Date(baseDate);
        timeOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        timeOutDate = new Date(timeOut);
      }
    }

    const attendance = await prisma.attendanceRecord.create({
      data: {
        studentId,
        date: new Date(attendanceDay),
        status,
        timeIn: timeInDate,
        timeOut: timeOutDate,
        remarks: remarks || notes || null,
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

    // Get existing record to get the date
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: { id }
    });

    if (!existingRecord) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Parse time strings and combine with existing date
    let timeInDate = null;
    let timeOutDate = null;
    
    if (timeIn !== undefined) {
      if (timeIn && timeIn !== '') {
        if (timeIn.includes(':')) {
          const [hours, minutes] = timeIn.split(':');
          const baseDate = new Date(existingRecord.date);
          timeInDate = new Date(baseDate);
          timeInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          timeInDate = new Date(timeIn);
        }
      }
    }
    
    if (timeOut !== undefined) {
      if (timeOut && timeOut !== '') {
        if (timeOut.includes(':')) {
          const [hours, minutes] = timeOut.split(':');
          const baseDate = new Date(existingRecord.date);
          timeOutDate = new Date(baseDate);
          timeOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        } else {
          timeOutDate = new Date(timeOut);
        }
      }
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (timeIn !== undefined) updateData.timeIn = timeInDate;
    if (timeOut !== undefined) updateData.timeOut = timeOutDate;
    if (remarks !== undefined) updateData.remarks = remarks;

    const attendance = await prisma.attendanceRecord.update({
      where: { id },
      data: updateData,
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

// ========== LEARNING MATERIALS ==========

export const createLearningMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      title,
      description,
      category,
      isPublic
    } = req.body;
    const uploadedBy = req.user!.userId;

    // Create file URL
    const fileUrl = `/uploads/learning-materials/${file.filename}`;

    const material = await prisma.learningMaterial.create({
      data: {
        title,
        description,
        fileUrl,
        fileType: file.mimetype,
        category,
        isPublic: isPublic === 'true',
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

    // Get user information for uploadedBy
    const userIds = materials.map(m => m.uploadedBy);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.id] = `${user.firstName} ${user.lastName}`;
      return acc;
    }, {} as Record<string, string>);

    // Format the response to match frontend expectations
    const formattedMaterials = materials.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description,
      fileUrl: material.fileUrl,
      fileType: material.fileType,
      category: material.category,
      uploadedBy: userMap[material.uploadedBy] || 'Unknown',
      uploadedAt: material.uploadedAt,
      isPublic: material.isPublic
    }));

    res.json({ materials: formattedMaterials });
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

    // First get the material to get the file path
    const material = await prisma.learningMaterial.findUnique({
      where: { id }
    });

    if (!material) {
      return res.status(404).json({ error: 'Learning material not found' });
    }

    // Delete the file from disk
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../uploads/learning-materials', material.fileUrl.split('/').pop());

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.learningMaterial.delete({
      where: { id }
    });

    res.json({ message: 'Learning material deleted successfully' });
  } catch (error) {
    console.error('Delete learning material error:', error);
    res.status(500).json({ error: 'Failed to delete learning material' });
  }
};

// ========== REGISTRATION UPDATES ==========

export const updateDaycareRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date if provided
    if (updateData.childDateOfBirth) {
      updateData.childDateOfBirth = new Date(updateData.childDateOfBirth);
    }

    const registration = await prisma.daycareRegistration.update({
      where: { id },
      data: updateData,
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

    res.json({
      message: 'Registration updated successfully',
      registration
    });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Failed to update registration' });
  }
};

export const deleteDaycareRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if registration exists
    const registration = await prisma.daycareRegistration.findUnique({
      where: { id },
      include: {
        student: true
      }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // If there's an associated student, delete related records first
    if (registration.student) {
      const studentId = registration.student.id;
      
      // Delete attendance records first
      await prisma.attendanceRecord.deleteMany({
        where: { studentId }
      });
      
      // Delete progress reports
      await prisma.progressReport.deleteMany({
        where: { studentId }
      });
      
      // Now delete the student
      await prisma.daycareStudent.delete({
        where: { id: studentId }
      });
    }

    // Delete the registration
    await prisma.daycareRegistration.delete({
      where: { id }
    });

    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Delete registration error:', error);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
};

export const downloadLearningMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const material = await prisma.learningMaterial.findUnique({
      where: { id }
    });

    if (!material) {
      return res.status(404).json({ error: 'Learning material not found' });
    }

    // Check permissions - only staff can download private materials
    const userRoles = req.user!.roles || [];
    const userRole = userRoles[0] || 'VISITOR';

    if (!material.isPublic && !['DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../uploads/learning-materials', material.fileUrl.split('/').pop());

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Use res.download to handle headers automatically
    const filename = material.fileUrl.split('/').pop() || 'download';
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download file' });
        }
      }
    });

  } catch (error) {
    console.error('Download learning material error:', error);
    res.status(500).json({ error: 'Failed to download learning material' });
  }
};

// ========== CERTIFICATE MANAGEMENT ==========

export const createDaycareCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const {
      studentId,
      certificateType,
      certificateNumber,
      purpose,
      achievements,
      recommendations,
      expiryDate,
      issuedBy
    } = req.body;

    const student = await prisma.daycareStudent.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        certificateType,
        recipientName: `${student.firstName} ${student.lastName}`,
        issuedFor: purpose || certificateType,
        issuedBy,
        certificateData: {
          certificateNumber,
          purpose,
          achievements,
          recommendations,
          expiryDate: expiryDate ? new Date(expiryDate) : null
        }
      },
      include: {
        student: true
      }
    });

    res.status(201).json({ message: 'Certificate generated successfully', certificate });
  } catch (error) {
    console.error('Create daycare certificate error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

export const getDaycareCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.query;

    const where = studentId ? { studentId: studentId as string } : { studentId: { not: null } };

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        student: true
      },
      orderBy: { issuedDate: 'desc' }
    });

    const transformedCertificates = certificates.map(cert => {
      const data = cert.certificateData as any;
      return {
        id: cert.id,
        certificateType: cert.certificateType,
        issuedDate: cert.issuedDate,
        issuedBy: cert.issuedBy,
        student: cert.student,
        certificateNumber: data?.certificateNumber || 'N/A',
        purpose: data?.purpose || cert.issuedFor,
        achievements: data?.achievements,
        recommendations: data?.recommendations,
        expiryDate: data?.expiryDate
      };
    });

    res.json({ certificates: transformedCertificates });
  } catch (error) {
    console.error('Get daycare certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

export const downloadDaycareCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        student: true
      }
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const data = certificate.certificateData as any;
    const certificateData = {
      recipientName: certificate.recipientName,
      certificateType: certificate.certificateType,
      issuedFor: certificate.issuedFor,
      issuedDate: certificate.issuedDate.toISOString(),
      issuedBy: certificate.issuedBy,
      certificateNumber: data?.certificateNumber,
      purpose: data?.purpose,
      achievements: data?.achievements,
      recommendations: data?.recommendations,
      studentInfo: certificate.student
    };

    const pdfBuffer = await generateCertificatePDF(certificateData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="daycare-certificate-${certificate.recipientName.replace(/\s+/g, '-')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download daycare certificate error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};
