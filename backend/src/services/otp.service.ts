const telerivetApiKey = process.env.TELERIVET_API_KEY;
const telerivetProjectId = process.env.TELERIVET_PROJECT_ID;
const telerivetApiUrl = 'https://api.telerivet.com/v1';

if (!telerivetApiKey || !telerivetProjectId) {
  throw new Error('Telerivet credentials not configured. Please set TELERIVET_API_KEY and TELERIVET_PROJECT_ID');
}

// Store verification attempts and OTP codes (in production, use Redis or database)
const verificationAttempts = new Map<string, { attempts: number; lastAttempt: Date; blockedUntil?: Date }>();
const otpStorage = new Map<string, { code: string; expiresAt: Date }>();

// Rate limiting: max 3 attempts per phone number per hour
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes
const OTP_EXPIRY = 15 * 60 * 1000; // 15 minutes (extended for Telerivet free plan)

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // If it starts with 0, replace with +63 (Philippines)
  if (cleaned.startsWith('0')) {
    return `+63${cleaned.slice(1)}`;
  }

  // If it doesn't start with +, assume it's Philippine number
  if (!cleaned.startsWith('+')) {
    return `+63${cleaned}`;
  }

  return phoneNumber;
};

export const isValidPhilippineNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  // Philippine mobile numbers are 10 digits (excluding country code)
  // Format: +63XXXXXXXXXX or 09XXXXXXXXX
  return /^(\+63|0)?9\d{9}$/.test(phoneNumber) && cleaned.length >= 10;
};

export const checkRateLimit = (phoneNumber: string): { allowed: boolean; waitTime?: number } => {
  const now = new Date();
  const attempts = verificationAttempts.get(phoneNumber);

  if (!attempts) {
    return { allowed: true };
  }

  // Check if blocked
  if (attempts.blockedUntil && now < attempts.blockedUntil) {
    const waitTime = Math.ceil((attempts.blockedUntil.getTime() - now.getTime()) / 1000 / 60);
    return { allowed: false, waitTime };
  }

  // Reset attempts if more than an hour has passed
  if (now.getTime() - attempts.lastAttempt.getTime() > BLOCK_DURATION) {
    verificationAttempts.delete(phoneNumber);
    return { allowed: true };
  }

  if (attempts.attempts >= MAX_ATTEMPTS) {
    const blockedUntil = new Date(now.getTime() + BLOCK_DURATION);
    attempts.blockedUntil = blockedUntil;
    const waitTime = Math.ceil(BLOCK_DURATION / 1000 / 60);
    return { allowed: false, waitTime };
  }

  return { allowed: true };
};

export const recordAttempt = (phoneNumber: string): void => {
  const now = new Date();
  const attempts = verificationAttempts.get(phoneNumber) || { attempts: 0, lastAttempt: now };

  attempts.attempts += 1;
  attempts.lastAttempt = now;

  verificationAttempts.set(phoneNumber, attempts);
};

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate phone number
    if (!isValidPhilippineNumber(phoneNumber)) {
      return { success: false, error: 'Invalid Philippine phone number format' };
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);

    // Check rate limiting
    const rateLimitCheck = checkRateLimit(formattedNumber);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: `Too many attempts. Please wait ${rateLimitCheck.waitTime} minutes before trying again.`
      };
    }

    // Generate OTP code
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY);

    // Store OTP
    otpStorage.set(formattedNumber, { code: otpCode, expiresAt });

    // Send SMS using Telerivet API
    const response = await fetch(`${telerivetApiUrl}/projects/${telerivetProjectId}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(telerivetApiKey + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to_number: formattedNumber,
        content: `Your Gabay Barangay verification code is: ${otpCode}. This code will expire in 15 minutes. SMS may take 2-5 minutes to arrive.`
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any;
      console.error('EngageSpark API error:', response.status, errorData);
      
      // Handle Telerivet error codes
      if (response.status === 401) {
        return { success: false, error: 'Invalid API key' };
      } else if (response.status === 403) {
        return { success: false, error: 'Access denied' };
      } else if (response.status === 404) {
        return { success: false, error: 'Project not found' };
      } else {
        return { success: false, error: errorData?.error || 'Failed to send verification code. Please try again.' };
      }
    }

    // Record the attempt
    recordAttempt(formattedNumber);

    return { success: true };

  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return { success: false, error: 'Failed to send verification code. Please try again.' };
  }
};

export const verifyOTP = async (phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);

    // Check rate limiting
    const rateLimitCheck = checkRateLimit(formattedNumber);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: `Too many attempts. Please wait ${rateLimitCheck.waitTime} minutes before trying again.`
      };
    }

    // Get stored OTP
    const storedOtp = otpStorage.get(formattedNumber);
    if (!storedOtp) {
      return { success: false, error: 'No verification code found. Please request a new code.' };
    }

    // Check if OTP has expired
    if (new Date() > storedOtp.expiresAt) {
      otpStorage.delete(formattedNumber);
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    // Record the attempt
    recordAttempt(formattedNumber);

    // Verify the code
    if (storedOtp.code === code) {
      // Clear stored OTP and attempts on successful verification
      otpStorage.delete(formattedNumber);
      verificationAttempts.delete(formattedNumber);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid verification code' };
    }

  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: 'Failed to verify code. Please try again.' };
  }
};

export const cleanupExpiredAttempts = (): void => {
  const now = new Date();
  
  // Clean up expired verification attempts
  for (const [phoneNumber, attempts] of verificationAttempts.entries()) {
    // Remove entries older than 24 hours
    if (now.getTime() - attempts.lastAttempt.getTime() > 24 * 60 * 60 * 1000) {
      verificationAttempts.delete(phoneNumber);
    }
  }
  
  // Clean up expired OTP codes
  for (const [phoneNumber, otp] of otpStorage.entries()) {
    if (now > otp.expiresAt) {
      otpStorage.delete(phoneNumber);
    }
  }
};

// Clean up expired attempts every 30 minutes
setInterval(cleanupExpiredAttempts, CLEANUP_INTERVAL);