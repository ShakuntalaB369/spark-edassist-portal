import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Otp } from '../models/Otp.js';
import { otpService } from '../services/otpService.js';
import { emailService } from '../services/emailService.js';

export const sendOtp = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check resend cooldown limit
    const cooldownRemaining = await otpService.checkCooldown(normalizedEmail);
    if (cooldownRemaining > 0) {
      return res.status(429).json({
        success: false,
        error: 'OTP_COOLDOWN',
        message: 'Please wait before requesting another verification code.'
      });
    }

    // 2. Generate secure 6-digit OTP
    const otp = otpService.generateOtp();
    const otpHash = otpService.hashOtp(otp);

    // 3. Save OTP in db (invalidates previous ones automatically due to unique email index upsert)
    await otpService.saveOtp(normalizedEmail, otpHash);

    // 4. Dispatch verification code via email provider
    try {
      await emailService.sendOtpEmail(normalizedEmail, otp);
    } catch (smtpError) {
      console.error('SMTP Delivery Failure:', smtpError);
      
      // Clean up saved OTP on email send failure so cooldown is reset
      await Otp.deleteOne({ email: normalizedEmail });
      
      return res.status(500).json({
        success: false,
        error: 'EMAIL_SEND_FAILED',
        message: 'Unable to send the verification email. Please try again.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code sent successfully.'
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to send verification code. Please try again.'
    });
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { name, email, otp } = req.body;

    if (!name || !email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and verification code are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Retrieve OTP document
    const record = await Otp.findOne({ email: normalizedEmail });
    if (!record) {
      return res.status(400).json({
        success: false,
        error: 'OTP_EXPIRED',
        message: 'This verification code has expired. Please request a new code.'
      });
    }

    // 2. Increment and enforce maximum attempt limits
    record.attempts += 1;
    await record.save();

    if (record.attempts > 5) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({
        success: false,
        error: 'OTP_ATTEMPTS_EXCEEDED',
        message: 'Too many incorrect attempts. Please request a new code.'
      });
    }

    // 3. Validate code hash
    const submittedHash = otpService.hashOtp(otp.trim());
    if (submittedHash !== record.otpHash) {
      if (record.attempts === 5) {
        await Otp.deleteOne({ email: normalizedEmail });
        return res.status(400).json({
          success: false,
          error: 'OTP_ATTEMPTS_EXCEEDED',
          message: 'Too many incorrect attempts. Please request a new code.'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'INVALID_OTP',
        message: 'Incorrect verification code.'
      });
    }

    // 4. Successful match: delete OTP document
    await Otp.deleteOne({ email: normalizedEmail });

    // 5. Create or update student account
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        emailVerified: true
      });
    } else {
      user.emailVerified = true;
      if (name) user.name = name.trim();
      await user.save();
    }

    // 6. Generate authenticated session token
    const secret = process.env.JWT_SECRET || 'spark_jwt_secret';
    const token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: true,
        ageGroup: user.ageGroup,
        country: user.country,
        profileImage: user.profileImage
      },
      token
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to verify OTP. Please try again.'
    });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, ageGroup, country, profileImage } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name.trim();
    if (ageGroup) user.ageGroup = ageGroup;
    if (country) user.country = country;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        ageGroup: user.ageGroup,
        country: user.country,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update profile.'
    });
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Verify token with Google's userinfo endpoint (for access tokens) or tokeninfo (for ID tokens)
    let response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    let payload;

    if (response.ok) {
      payload = await response.json();
    } else {
      // Fallback to tokeninfo for ID tokens
      response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      if (!response.ok) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Google authentication token'
        });
      }
      payload = await response.json();
      
      // Check if the aud matches GOOGLE_CLIENT_ID if it is set in env
      if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        return res.status(401).json({
          success: false,
          message: 'Token client ID mismatch'
        });
      }
    }

    const { email, name, picture } = payload;
    const normalizedEmail = email.trim().toLowerCase();

    // Find or create the user
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        emailVerified: true,
        profileImage: picture
      });
    } else {
      user.emailVerified = true;
      if (picture && !user.profileImage) {
        user.profileImage = picture;
      }
      await user.save();
    }

    // Generate authenticated session token
    const secret = process.env.JWT_SECRET || 'spark_jwt_secret';
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Google Authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: true,
        ageGroup: user.ageGroup,
        country: user.country,
        profileImage: user.profileImage
      },
      token: jwtToken
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to authenticate with Google. Please try again.'
    });
  }
};

