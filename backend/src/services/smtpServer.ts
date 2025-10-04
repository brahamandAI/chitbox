import { SMTPServer, SMTPServerSession, SMTPServerDataStream, SMTPServerAddress } from 'smtp-server';
import { simpleParser, ParsedMail, AddressObject } from 'mailparser';
import Database from '../database/connection';
import { Server } from 'socket.io';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface ParsedEmailData {
  from: EmailRecipient;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: Buffer;
  }>;
  messageId: string;
  date: Date;
}

export class SMTPServerService {
  private server: SMTPServer;
  private isRunning: boolean = false;
  private io: Server | null = null;

  constructor() {
    this.server = new SMTPServer({
      // SMTP server configuration
      banner: 'ChitBox SMTP Server',
      size: 10 * 1024 * 1024, // 10MB max message size
      
      // Authentication (optional - can be disabled for development)
      authOptional: true,
      
      // Connection handling
      onConnect: this.handleConnect.bind(this),
      onMailFrom: this.handleMailFrom.bind(this),
      onRcptTo: this.handleRcptTo.bind(this),
      onData: this.handleData.bind(this),
      onClose: this.handleClose.bind(this),
    });
  }

  private handleConnect(session: SMTPServerSession, callback: (err?: Error) => void): void {
    console.log(`📧 SMTP Connection from: ${session.remoteAddress}:${session.remotePort}`);
    callback(); // Accept all connections
  }

  private handleMailFrom(address: SMTPServerAddress, session: SMTPServerSession, callback: (err?: Error | null) => void): void {
    console.log(`📧 MAIL FROM: ${address.address}`);
    callback(); // Accept all senders
  }

  private handleRcptTo(address: SMTPServerAddress, session: SMTPServerSession, callback: (err?: Error | null) => void): void {
    console.log(`📧 RCPT TO: ${address.address}`);
    
    // Accept all recipients (both internal and external)
    // For internal users: store in database
    // For external users: we'll handle delivery later
    callback(); // Accept all recipients
  }

  private async handleData(stream: SMTPServerDataStream, session: SMTPServerSession, callback: (err?: Error) => void): Promise<void> {
    try {
      console.log('📧 Processing email data...');
      
      // Parse the email
      const parsed = await simpleParser(stream);
      
      // Process and store the email
      await this.processEmail(parsed, session);
      
      console.log('✅ Email processed successfully');
      callback(); // Success
    } catch (error) {
      console.error('❌ Error processing email:', error);
      callback(error as Error);
    }
  }

  private handleClose(session: SMTPServerSession): void {
    console.log(`📧 SMTP session closed: ${session.remoteAddress}`);
  }

  private handleError(err: Error): void {
    console.error('❌ SMTP Server error:', err);
  }

  private async validateRecipient(email: string): Promise<boolean> {
    try {
      const result = await Database.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error validating recipient:', error);
      return false;
    }
  }

  private async processEmail(parsed: ParsedMail, session: SMTPServerSession): Promise<void> {
    try {
      // Extract email data
      const emailData: ParsedEmailData = {
        from: {
          email: parsed.from?.value?.[0]?.address || parsed.from?.text || '',
          name: parsed.from?.value?.[0]?.name || ''
        },
        to: this.parseAddresses(parsed.to) || [],
        cc: this.parseAddresses(parsed.cc),
        bcc: this.parseAddresses(parsed.bcc),
        subject: parsed.subject || 'No Subject',
        text: parsed.text,
        html: parsed.html || undefined,
        attachments: parsed.attachments?.map(att => ({
          filename: att.filename || 'attachment',
          contentType: att.contentType || 'application/octet-stream',
          content: att.content
        })),
        messageId: parsed.messageId || '',
        date: parsed.date || new Date()
      };

      // Process each recipient
      for (const recipient of emailData.to) {
        console.log(`📧 Processing recipient: ${recipient.email}`);
        await this.processRecipient(emailData, recipient.email);
      }

      // Process CC recipients
      if (emailData.cc) {
        for (const recipient of emailData.cc) {
          await this.processRecipient(emailData, recipient.email);
        }
      }

      // Process BCC recipients
      if (emailData.bcc) {
        for (const recipient of emailData.bcc) {
          await this.processRecipient(emailData, recipient.email);
        }
      }

    } catch (error) {
      console.error('Error processing email:', error);
      throw error;
    }
  }

  private async processRecipient(emailData: ParsedEmailData, recipientEmail: string): Promise<void> {
    try {
      // Check if recipient is a registered user
      const userResult = await Database.query(
        'SELECT id FROM users WHERE email = $1',
        [recipientEmail]
      );

      if (userResult.rows.length > 0) {
        // Internal user - store in database
        console.log(`📧 Storing email for internal user: ${recipientEmail}`);
        await this.storeEmailForUser(emailData, recipientEmail);
      } else {
        // External user - log for now (you can implement external delivery later)
        console.log(`📧 External recipient: ${recipientEmail} - email would be delivered externally`);
        // TODO: Implement external email delivery (SMTP relay, etc.)
      }
    } catch (error) {
      console.error(`Error processing recipient ${recipientEmail}:`, error);
    }
  }

  private async storeEmailForUser(emailData: ParsedEmailData, userEmail: string): Promise<void> {
    try {
      // Get user ID
      const userResult = await Database.query(
        'SELECT id FROM users WHERE email = $1',
        [userEmail]
      );

      if (userResult.rows.length === 0) {
        console.log(`User not found for email: ${userEmail}`);
        return;
      }

      const userId = userResult.rows[0].id;

      // Get or create inbox folder
      const folderResult = await Database.query(
        'SELECT id FROM folders WHERE user_id = $1 AND type = $2',
        [userId, 'inbox']
      );

      let folderId = folderResult.rows[0]?.id;

      if (!folderId) {
        const newFolderResult = await Database.query(
          'INSERT INTO folders (user_id, name, type) VALUES ($1, $2, $3) RETURNING id',
          [userId, 'Inbox', 'inbox']
        );
        folderId = newFolderResult.rows[0].id;
      }

      // Create or find mail thread
      let threadResult = await Database.query(
        'SELECT id FROM mail_threads WHERE subject = $1 AND folder_id = $2 AND user_id = $3 ORDER BY created_at DESC LIMIT 1',
        [emailData.subject, folderId, userId]
      );

      let threadId = threadResult.rows[0]?.id;

      if (!threadId) {
        threadResult = await Database.query(
          'INSERT INTO mail_threads (subject, folder_id, user_id, is_read) VALUES ($1, $2, $3, $4) RETURNING id',
          [emailData.subject, folderId, userId, false]
        );
        threadId = threadResult.rows[0].id;
      }

      // Create mail message
      const messageResult = await Database.query(`
        INSERT INTO mail_messages (
          thread_id, from_email, from_name, to_emails, cc_emails, bcc_emails,
          subject, body_text, body_html, is_read, is_sent, sent_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        threadId,
        emailData.from.email,
        emailData.from.name,
        emailData.to.map(r => r.email),
        emailData.cc?.map(r => r.email) || [],
        emailData.bcc?.map(r => r.email) || [],
        emailData.subject,
        emailData.text,
        emailData.html,
        false, // is_read
        false, // is_sent (this is an incoming email)
        emailData.date
      ]);

      const messageId = messageResult.rows[0].id;

      // Store attachments if any
      if (emailData.attachments && emailData.attachments.length > 0) {
        for (const attachment of emailData.attachments) {
          await Database.query(`
            INSERT INTO attachments (message_id, filename, original_name, mime_type, file_size, file_path)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            messageId,
            attachment.filename,
            attachment.filename,
            attachment.contentType,
            attachment.content.length,
            '' // file_path - could store in filesystem if needed
          ]);
        }
      }

      // Send real-time notification
      if (this.io) {
        this.io.to(`user_${userId}`).emit('new_email', {
          folderId,
          email: {
            id: messageId,
            threadId,
            fromEmail: emailData.from.email,
            fromName: emailData.from.name,
            toEmails: emailData.to.map(r => r.email),
            ccEmails: emailData.cc?.map(r => r.email) || [],
            bccEmails: emailData.bcc?.map(r => r.email) || [],
            subject: emailData.subject,
            bodyText: emailData.text,
            bodyHtml: emailData.html,
            isRead: false,
            isSent: false,
            sentAt: emailData.date.toISOString(),
            createdAt: new Date().toISOString()
          }
        });
      }

      console.log(`✅ Email stored for user: ${userEmail}`);

    } catch (error) {
      console.error(`Error storing email for user ${userEmail}:`, error);
      throw error;
    }
  }

  public setSocketIO(io: Server): void {
    this.io = io;
  }

  private parseAddresses(addresses: AddressObject | AddressObject[] | undefined): Array<{email: string; name?: string}> | undefined {
    if (!addresses) return undefined;
    
    const addressArray = Array.isArray(addresses) ? addresses : [addresses];
    return addressArray.map(addr => {
      // Handle different formats of AddressObject
      if (typeof addr === 'string') {
        return { email: addr, name: '' };
      }
      
      // Extract email and name from AddressObject
      const email = (addr as any).address || (addr as any).value?.[0]?.address || '';
      const name = (addr as any).name || (addr as any).value?.[0]?.name || '';
      
      return { email, name };
    });
  }

  public async start(port: number = 2525): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  SMTP server is already running');
      return;
    }

    return new Promise((resolve, reject) => {
      this.server.listen(port, (err?: Error) => {
        if (err) {
          console.error('❌ Failed to start SMTP server:', err);
          reject(err);
        } else {
          this.isRunning = true;
          console.log(`✅ SMTP server started on port ${port}`);
          resolve();
        }
      });
    });
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️  SMTP server is not running');
      return;
    }

    return new Promise((resolve) => {
      this.server.close(() => {
        this.isRunning = false;
        console.log('✅ SMTP server stopped');
        resolve();
      });
    });
  }

  public isServerRunning(): boolean {
    return this.isRunning;
  }
}

export const smtpServer = new SMTPServerService();
