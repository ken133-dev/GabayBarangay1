# SMS OTP Setup Guide

This guide explains how to set up SMS OTP (One-Time Password) verification for the Gabay Barangay portal using Twilio's Verify API.

## Prerequisites

1. A Twilio account (sign up at [twilio.com](https://twilio.com))
2. A phone number purchased from Twilio (or use a trial number)

## Setup Steps

### 1. Create a Twilio Verify Service

1. Log in to your [Twilio Console](https://console.twilio.com)
2. Navigate to **Verify** > **Services** in the left sidebar
3. Click **Create new service**
4. Enter a **Friendly Name** (e.g., "Gabay Barangay OTP")
5. Click **Create**

### 2. Get Your Service SID

After creating the service:
1. Copy the **Service SID** from the service details page
2. This will be your `TWILIO_VERIFY_SERVICE_SID`

### 3. Configure Environment Variables

Update your `.env` file with the following Twilio credentials:

```bash
# Twilio Configuration (for SMS OTP using Verify API)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_VERIFY_SERVICE_SID=your-twilio-verify-service-sid
```

You can find your Account SID and Auth Token in the [Twilio Console Dashboard](https://console.twilio.com).

### 4. Test the Setup

1. Start your backend server
2. Register a new user with a valid Philippine phone number (e.g., +639XXXXXXXXX or 09XXXXXXXXX)
3. Try logging in - you should receive an OTP via SMS
4. Enter the OTP to complete login

## How It Works

### Registration
- Users must provide a contact number during registration
- The number is stored in the database for OTP delivery

### Login Flow
1. User enters email and password
2. System validates credentials
3. If valid, sends OTP to user's registered phone number
4. User enters the 6-digit OTP code
5. System verifies the code with Twilio
6. If valid, user is logged in and receives a JWT token

### Security Features
- Rate limiting: Maximum 3 OTP requests per phone number per hour
- Automatic cleanup of expired verification attempts
- Philippine phone number validation
- OTP codes expire after 10 minutes (Twilio default)

## Troubleshooting

### Common Issues

**"Twilio credentials not configured"**
- Ensure all three environment variables are set correctly

**"Invalid Philippine phone number format"**
- Philippine numbers should be in format: +639XXXXXXXXX or 09XXXXXXXXX

**"Too many attempts. Please wait X minutes"**
- Rate limiting is active. Wait for the cooldown period to expire

**OTP not received**
- Check that your Twilio account has sufficient balance
- Verify the phone number format is correct
- Check Twilio logs in the console for delivery status

### Testing with Trial Account

Twilio trial accounts can only send SMS to verified phone numbers:
1. Go to **Phone Numbers** > **Verified Caller IDs**
2. Add your test phone number
3. Use that number for testing

## Production Considerations

1. **Use a database/Redis** for OTP storage instead of in-memory Maps
2. **Implement proper logging** for security auditing
3. **Add monitoring** for OTP delivery success rates
4. **Consider SMS delivery fallbacks** (email, push notifications)
5. **Regular security audits** of the OTP implementation

## API Endpoints

- `POST /auth/send-otp` - Send OTP to user's phone
- `POST /auth/verify-otp` - Verify OTP and complete login

Both endpoints require the user's email address.