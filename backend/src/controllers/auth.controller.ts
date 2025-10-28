import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendOTP, verifyOTP } from '../services/otp.service';

// Type for role selection from Prisma query
type RoleSelect = {
  name: string;
  displayName: string;
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      middleName,
      contactNumber,
      address,
      role
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (roles will be assigned by admin)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        middleName,
        contactNumber,
        address,
        status: 'PENDING' // Account needs approval
      }
    });

    res.status(201).json({
      message: 'Registration successful. Account pending approval.',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Account is not active',
        status: user.status
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token with multi-role support
    const roleNames = user.roles.map((r: RoleSelect) => r.name);
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: roleNames[0] || 'VISITOR',
      roles: roleNames
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleNames[0] || 'VISITOR',
        roles: roleNames,
        status: user.status,
        otpEnabled: user.otpEnabled
      },
      requiresOTP: user.otpEnabled
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format response to match frontend expectations
    const roleNames = user.roles.map((r: RoleSelect) => r.name);
    const response = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      contactNumber: user.contactNumber,
      address: user.address,
      role: roleNames[0] || 'VISITOR',
      roles: roleNames,
      status: user.status,
      otpEnabled: user.otpEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({ user: response });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { firstName, lastName, middleName, contactNumber, address, otpEnabled } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        middleName,
        contactNumber,
        address,
        otpEnabled
      },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    // Format response to match frontend expectations
    const roleNames = user.roles.map((r: RoleSelect) => r.name);
    const response = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      contactNumber: user.contactNumber,
      address: user.address,
      role: roleNames[0] || 'VISITOR',
      roles: roleNames,
      status: user.status,
      otpEnabled: user.otpEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({ user: response });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const sendLoginOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Account is not active',
        status: user.status
      });
    }

    // Check if user has a contact number
    if (!user.contactNumber) {
      return res.status(400).json({ error: 'No contact number found. Please update your profile.' });
    }

    // Send OTP using Telerivet with user's actual phone number
    const otpResult = await sendOTP(user.contactNumber);

    if (!otpResult.success) {
      return res.status(400).json({ error: otpResult.error });
    }

    res.json({
      message: 'OTP sent successfully. SMS may take 2-5 minutes to arrive.',
      requiresOTP: true,
      phoneNumber: user.contactNumber.replace(/\d(?=\d{4})/g, '*'), // Mask phone number for security
      estimatedDelivery: '2-5 minutes',
      expiryTime: '15 minutes'
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    if (error.code === 'P1001') {
      return res.status(503).json({ error: 'Database connection failed. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.contactNumber) {
      return res.status(404).json({ error: 'User not found or no contact number' });
    }

    // Send new OTP
    const otpResult = await sendOTP(user.contactNumber);

    if (!otpResult.success) {
      return res.status(400).json({ error: otpResult.error });
    }

    res.json({
      message: 'New OTP sent successfully. SMS may take 2-5 minutes to arrive.',
      estimatedDelivery: '2-5 minutes'
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

export const verifyLoginOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP using user's actual phone number from database
    const verifyResult = await verifyOTP(user.contactNumber!, otp);

    if (!verifyResult.success) {
      return res.status(401).json({ error: verifyResult.error });
    }

    // Generate token with multi-role support
    const roleNames = user.roles.map((r: RoleSelect) => r.name);
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: roleNames[0] || 'VISITOR',
      roles: roleNames
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleNames[0] || 'VISITOR',
        roles: roleNames,
        status: user.status
      }
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    if (error.code === 'P1001') {
      return res.status(503).json({ error: 'Database connection failed. Please try again later.' });
    }
    res.status(500).json({ error: 'OTP verification failed' });
  }
};