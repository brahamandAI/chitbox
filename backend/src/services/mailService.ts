import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Database from '../database/connection';

dotenv.config();

export interface EmailOptions {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Use only local SMTP server for all emails
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: parseInt(process.env.SMTP_SERVER_PORT || '2525'),
      secure: false,
      ignoreTLS: true,
      // No auth needed for local server
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: options.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          path: att.path,
          content: att.content,
          contentType: att.contentType
        }))
      };

      console.log('📧 Sending email via local SMTP server...');
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return false;
    }
  }


  // Method to receive emails (this would typically be implemented with IMAP)
  async receiveEmails(): Promise<void> {
    // This is a placeholder for IMAP integration
    // In a real implementation, you would use a library like 'imap' or 'node-imap'
    console.log('Email receiving functionality would be implemented here with IMAP');
  }
}
