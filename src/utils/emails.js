import { Resend } from 'resend';
import { fileURLToPath } from 'url';
import path from 'path';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailServices {
  constructor(user, url) {
    this.to = user.email;
    this.userName = user.name;
    this.url = url;
    this.from = `Physio Egypt <noreply@${process.env.EMAIL_DOMAIN}>`;
  }

  async sendEmail({ subject, template }) {
    const html = pug.renderFile(
      path.join(__dirname, '../views/emails', `${template}.pug`),
      {
        userName: this.userName,
        url: this.url,
        subject,
      },
    );

    const { error } = await resend.emails.send({
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    });

    if (error) {
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  sendEmailVerification() {
    return this.sendEmail({
      subject: 'تفعيل البريد الإلكتروني',
      template: 'email-verification',
    });
  }

  sendWelcomeEmail() {
    return this.sendEmail({
      subject: 'مرحباً بك في Physio Egypt',
      template: 'welcome',
    });
  }

  sendPasswordRest() {
    return this.sendEmail({
      subject: 'إعادة تعيين كلمة المرور',
      template: 'password-reset',
    });
  }

  sendPasswordResetSuccess() {
    return this.sendEmail({
      subject: 'تم إعادة تعيين كلمة المرور بنجاح',
      template: 'password-reset-success',
    });
  }
}
