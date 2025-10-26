import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifyServiceSid) {
  throw new Error('Twilio credentials not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID');
}

const client = twilio(accountSid, authToken);

// Store verification attempts to prevent abuse (in production, use Redis or database)
const verificationAttempts = new Map<string, { attempts: number; lastAttempt: Date; blockedUntil?: Date }>();

// Rate limiting: max 3 attempts per phone number per hour
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

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

    // Send verification code using Twilio Verify
    await client.verify.v2.services(verifyServiceSid)
      .verifications
      .create({
        to: formattedNumber,
        channel: 'sms',
        locale: 'en'
      });

    // Record the attempt
    recordAttempt(formattedNumber);

    return { success: true };

  } catch (error: any) {
    console.error('Error sending OTP:', error);

    if (error.code === 60200) {
      return { success: false, error: 'Invalid phone number' };
    } else if (error.code === 60203) {
      return { success: false, error: 'Phone number is not reachable' };
    } else if (error.code === 60212) {
      return { success: false, error: 'Too many requests to this phone number' };
    }

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

    // Verify the code using Twilio Verify
    const verification = await client.verify.v2.services(verifyServiceSid)
      .verificationChecks
      .create({
        to: formattedNumber,
        code: code
      });

    // Record the attempt
    recordAttempt(formattedNumber);

    if (verification.status === 'approved') {
      // Clear attempts on successful verification
      verificationAttempts.delete(formattedNumber);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid verification code' };
    }

  } catch (error: any) {
    console.error('Error verifying OTP:', error);

    if (error.code === 60202) {
      return { success: false, error: 'Verification code has expired' };
    } else if (error.code === 60201) {
      return { success: false, error: 'Invalid verification code' };
    }

    return { success: false, error: 'Failed to verify code. Please try again.' };
  }
};

export const cleanupExpiredAttempts = (): void => {
  const now = new Date();
  for (const [phoneNumber, attempts] of verificationAttempts.entries()) {
    // Remove entries older than 24 hours
    if (now.getTime() - attempts.lastAttempt.getTime() > 24 * 60 * 60 * 1000) {
      verificationAttempts.delete(phoneNumber);
    }
  }
};

// Clean up expired attempts every 30 minutes
setInterval(cleanupExpiredAttempts, CLEANUP_INTERVAL);