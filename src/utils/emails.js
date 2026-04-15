import { fileURLToPath } from 'url';
import path from 'path';
import pug from 'pug';
import { htmlToText } from 'html-to-text';
// import { Resend } from 'resend';
import nodemailer from 'nodemailer';
// import AppError from './AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const resend = new Resend(process.env.RESEND_API_KEY);

const _transporter = nodemailer.createTransport(
  process.env.NODE_ENV === 'production'
    ? {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
      }
    : {
        host: process.env.EMAIL_DEV_HOST || 'sandbox.smtp.mailtrap.io',
        port: parseInt(process.env.EMAIL_DEV_PORT, 10) || 587,
        auth: {
          user: process.env.EMAIL_DEV_USERNAME,
          pass: process.env.EMAIL_DEV_PASSWORD,
        },
      },
);

export class EmailServices {
  constructor(user, url) {
    this.to = user.email;
    this.userName = user.name;
    this.url = url;
    this.from = process.env.EMAIL_FROM || 'Clinic-System <noreply@resend.dev>';
  }

  async sendEmail({ subject, template }) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        userName: this.userName,
        url: this.url,
        subject,
      },
    );

    await _transporter.sendMail({
      // ← use _transporter, not this.createTransport()
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    });
  }

  sendEmailVerification() {
    return this.sendEmail({
      subject: 'Email Verification',
      template: 'email-verification',
    });
  }

  sendWelcomeEmail() {
    return this.sendEmail({
      subject: 'Welcome to Health-Care Family',
      template: 'welcome',
    });
  }

  sendPasswordRest() {
    return this.sendEmail({
      subject: 'Your password reset token',
      template: 'password-reset',
    });
  }

  sendPasswordResetSuccess() {
    return this.sendEmail({
      subject: 'Your password has successfully reset',
      template: 'password-reset-success',
    });
  }
}
