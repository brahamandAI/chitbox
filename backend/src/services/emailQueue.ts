import nodemailer from 'nodemailer';
import Database from '../database/connection';

export interface QueuedEmail {
  id?: number;
  from_email: string;
  from_name: string;
  to_email: string;
  subject: string;
  body_text: string;
  body_html?: string;
  cc_emails?: string[];
  bcc_emails?: string[];
  attachments?: any[];
  status: 'pending' | 'sent' | 'failed' | 'retrying';
  attempts: number;
  max_attempts: number;
  last_attempt?: Date;
  error_message?: string;
  created_at: Date;
  sent_at?: Date;
}

export class EmailQueueService {
  private transporter: nodemailer.Transporter;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize SMTP transporter - use local Postfix with opportunistic TLS
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '25'),
      secure: false, // Use STARTTLS instead of implicit TLS
      requireTLS: true, // Upgrade to TLS when available
      // No authentication needed for local Postfix
      tls: {
        rejectUnauthorized: false,
        ciphers: 'HIGH:!aNULL:!MD5'
      }
    });
  }

  // Add email to queue
  async queueEmail(emailData: Omit<QueuedEmail, 'id' | 'status' | 'attempts' | 'max_attempts' | 'created_at'>): Promise<number> {
    try {
      const result = await Database.query(`
        INSERT INTO email_queue (
          from_email, from_name, to_email, subject, body_text, body_html,
          cc_emails, bcc_emails, attachments, status, attempts, max_attempts, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `, [
        emailData.from_email,
        emailData.from_name,
        emailData.to_email,
        emailData.subject,
        emailData.body_text,
        emailData.body_html,
        emailData.cc_emails || [],
        emailData.bcc_emails || [],
        JSON.stringify(emailData.attachments || []),
        'pending',
        0,
        3, // Max 3 attempts
        new Date()
      ]);

      const emailId = result.rows[0].id;
      console.log(`📬 Email queued with ID: ${emailId}`);
      
      // Trigger immediate processing for faster delivery
      if (!this.isProcessing) {
        setImmediate(() => this.processQueue());
      }
      
      return emailId;
    } catch (error) {
      console.error('Error queueing email:', error);
      throw error;
    }
  }

  // Process email queue
  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('🔄 Processing email queue...');

    try {
      // Get pending emails
      const pendingEmails = await Database.query(`
        SELECT * FROM email_queue 
        WHERE status IN ('pending', 'retrying') 
        AND attempts < max_attempts
        AND (last_attempt IS NULL OR last_attempt < NOW() - INTERVAL '5 minutes')
        ORDER BY created_at ASC
        LIMIT 10
      `);

      for (const email of pendingEmails.rows) {
        await this.processEmail(email);
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Process individual email
  private async processEmail(email: QueuedEmail): Promise<void> {
    try {
      console.log(`📤 Processing email ID: ${email.id} to ${email.to_email}`);

      // Update attempt count
      await Database.query(`
        UPDATE email_queue 
        SET attempts = attempts + 1, last_attempt = NOW()
        WHERE id = $1
      `, [email.id]);

      // Prepare email with proper headers to avoid spam
      const mailOptions = {
        from: `"${email.from_name}" <${email.from_email}>`,
        to: email.to_email,
        cc: email.cc_emails?.join(', '),
        bcc: email.bcc_emails?.join(', '),
        subject: email.subject,
        text: email.body_text,
        html: email.body_html,
        headers: {
          'X-Mailer': 'ChitBox Mail System v1.0',
          'X-Priority': '3',
          'Importance': 'normal',
          'Message-ID': `<${Date.now()}.${Math.random().toString(36).substring(7)}.${email.id}@mail.chitbox.co>`,
          'Date': new Date().toUTCString(),
          'Return-Path': `<${email.from_email}>`,
          'Reply-To': `"${email.from_name}" <${email.from_email}>`,
          'List-Unsubscribe': `<mailto:unsubscribe@chitbox.co?subject=Unsubscribe>`,
          'X-Entity-Ref-ID': `chitbox-${email.id}`,
          'Precedence': 'bulk',
          'Auto-Submitted': 'auto-generated'
        },
        encoding: 'utf8',
        messageId: `<${Date.now()}.${Math.random().toString(36).substring(7)}.${email.id}@mail.chitbox.co>`
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      
      // Mark as sent
      await Database.query(`
        UPDATE email_queue 
        SET status = 'sent', sent_at = NOW(), error_message = NULL
        WHERE id = $1
      `, [email.id]);

      console.log(`✅ Email ${email.id} sent successfully: ${info.messageId}`);
    } catch (error) {
      console.error(`❌ Failed to send email ${email.id}:`, error);
      
      // Update error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      await Database.query(`
        UPDATE email_queue 
        SET error_message = $1
        WHERE id = $2
      `, [errorMessage, email.id]);

      // Check if max attempts reached
      const updatedEmail = await Database.query(`
        SELECT attempts, max_attempts FROM email_queue WHERE id = $1
      `, [email.id]);

      if (updatedEmail.rows[0].attempts >= updatedEmail.rows[0].max_attempts) {
        await Database.query(`
          UPDATE email_queue 
          SET status = 'failed'
          WHERE id = $1
        `, [email.id]);
        console.log(`💀 Email ${email.id} marked as failed after max attempts`);
      } else {
        await Database.query(`
          UPDATE email_queue 
          SET status = 'retrying'
          WHERE id = $1
        `, [email.id]);
        console.log(`🔄 Email ${email.id} marked for retry`);
      }
    }
  }

  // Start queue processor
  startProcessing(): void {
    if (this.processingInterval) return;
    
    console.log('🚀 Starting email queue processor...');
    // Process immediately on startup
    this.processQueue();
    
    // Then process every 5 seconds for fast delivery
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 5000); // Process every 5 seconds for faster delivery
  }

  // Stop queue processor
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('⏹️ Email queue processor stopped');
    }
  }

  // Get queue status
  async getQueueStatus(): Promise<any> {
    const stats = await Database.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM email_queue 
      GROUP BY status
    `);

    return stats.rows.reduce((acc: any, row: any) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});
  }
}
