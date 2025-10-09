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
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (this.isProduction) {
      // Production: Use local Postfix SMTP server
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // Use TLS
        // No authentication needed for local Postfix
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        }
      });
    } else {
      // Development: Use local SMTP test server
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: parseInt(process.env.SMTP_SERVER_PORT || '2525'),
        secure: false,
        ignoreTLS: true,
      });
    }
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
        })),
        // Professional headers to avoid spam filters
        headers: {
          'X-Mailer': 'ChitBox Mail System',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Report-Abuse': `Please report abuse to ${process.env.ADMIN_EMAIL || 'admin@chitbox.co'}`,
          'List-Unsubscribe': `<mailto:unsubscribe@chitbox.co>`,
          'Return-Path': process.env.SMTP_FROM || 'noreply@chitbox.co',
          'Reply-To': options.from,
          'Message-ID': `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@chitbox.co>`,
          'Date': new Date().toUTCString()
        },
        // DKIM and SPF compliance
        dkim: this.isProduction && process.env.DKIM_PRIVATE_KEY ? {
          domainName: 'chitbox.co',
          keySelector: 'default',
          privateKey: process.env.DKIM_PRIVATE_KEY
        } : undefined,
        // Ensure proper encoding
        encoding: 'utf8',
        // Add tracking pixel for delivery confirmation (optional)
        list: {
          unsubscribe: 'https://chitbox.co/unsubscribe'
        }
      };

      const serverType = this.isProduction ? 'production SMTP server' : 'local SMTP server';
      console.log(`📧 Sending email via ${serverType}...`);
      console.log(`📤 From: ${options.from}`);
      console.log(`📥 To: ${options.to}`);
      console.log(`📋 Subject: ${options.subject}`);
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      console.log('📊 Response:', info.response);
      
      return info;
    } catch (error) {
      console.error('❌ Error sending email:', error);
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
