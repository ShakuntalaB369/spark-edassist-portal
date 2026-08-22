import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export const emailService = {
  sendOtpEmail: async (email, otp) => {
    const from = process.env.SMTP_FROM || 'SPARK Assessment Portal <onboarding@resend.dev>';
    const subject = 'Your SPARK Verification Code';
    const text = `SPARK\nAssessment Portal\n\nHello,\n\nYour verification code is:\n\n${otp}\n\nThis code expires in 5 minutes.\n\nIf you did not request this code, you can safely ignore this email.\n\nDo not share this code with anyone.\n\nRegards,\nSPARK Assessment Portal`;

    // Use Resend HTTP API if configured (recommended for Render/production)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Resend Free Tier requires sending from onboarding@resend.dev unless a custom domain is verified
      const senderEmail = from.includes('yourdomain.com') ? 'onboarding@resend.dev' : from;
      
      const { error } = await resend.emails.send({
        from: senderEmail,
        to: email,
        subject,
        text
      });

      if (error) {
        throw new Error(`Resend email delivery failed: ${error.message}`);
      }
      return;
    }

    // Fallback to standard SMTP (local development)
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new Error('Email credentials missing (neither RESEND_API_KEY nor SMTP credentials provided)');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const mailOptions = {
      from,
      to: email,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
  }
};

export default emailService;
