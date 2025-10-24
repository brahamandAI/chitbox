import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import Database from '../database/connection';
import { AIService } from './aiService';

export class ImapService {
  private imap: Imap;
  private aiService: AIService;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.aiService = new AIService();
    
    this.imap = new Imap({
      user: process.env.IMAP_USER || 'bhargav@chitbox.co',
      password: process.env.IMAP_PASSWORD || '',
      host: process.env.IMAP_HOST || 'imap.gmail.com',
      port: parseInt(process.env.IMAP_PORT || '993'),
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      keepalive: {
        interval: 10000,
        idleInterval: 300000,
        forceNoop: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.imap.once('ready', () => {
      console.log('📧 IMAP connection ready');
      this.openInbox();
    });

    this.imap.once('error', (err: Error) => {
      console.error('❌ IMAP connection error:', err);
    });

    this.imap.once('end', () => {
      console.log('📧 IMAP connection ended');
    });

    this.imap.on('mail', () => {
      console.log('📬 New email received, processing...');
      this.processNewEmails();
    });
  }

  private openInbox() {
    this.imap.openBox('INBOX', true, (err: Error, box: Imap.Box) => {
      if (err) {
        console.error('❌ Error opening inbox:', err);
        return;
      }
      console.log(`📂 Inbox opened, ${box.messages.total} total messages`);
      
      // Process any existing unread emails
      this.processNewEmails();
    });
  }

  private async processNewEmails() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('🔄 Processing new emails...');

    try {
      // Search for unread emails
      this.imap.search(['UNSEEN'], (err: Error, results: number[]) => {
        if (err) {
          console.error('❌ Error searching emails:', err);
          this.isProcessing = false;
          return;
        }

        if (results.length === 0) {
          console.log('📭 No new emails found');
          this.isProcessing = false;
          return;
        }

        console.log(`📬 Found ${results.length} new emails`);

        // Fetch the emails
        const fetch = this.imap.fetch(results, {
          bodies: '',
          markSeen: true
        });

        fetch.on('message', (msg: Imap.ImapMessage) => {
          let buffer = '';

          msg.on('body', (stream: NodeJS.ReadableStream) => {
            stream.on('data', (chunk: Buffer) => {
              buffer += chunk.toString('utf8');
            });

            stream.once('end', async () => {
              try {
                const parsed = await simpleParser(buffer);
                await this.processEmail(parsed);
              } catch (parseError) {
                console.error('❌ Error parsing email:', parseError);
              }
            });
          });

          msg.once('attributes', (attrs: Imap.ImapMessageAttributes) => {
            // Mark as seen
            this.imap.addFlags(attrs.uid, ['\\Seen'], (err: Error) => {
              if (err) {
                console.error('❌ Error marking email as seen:', err);
              }
            });
          });
        });

        fetch.once('error', (err: Error) => {
          console.error('❌ Error fetching emails:', err);
          this.isProcessing = false;
        });

        fetch.once('end', () => {
          console.log('✅ Finished processing emails');
          this.isProcessing = false;
        });
      });
    } catch (error) {
      console.error('❌ Error in processNewEmails:', error);
      this.isProcessing = false;
    }
  }

  private async processEmail(email: ParsedMail) {
    try {
      console.log(`📧 Processing email: ${email.subject}`);

      // Extract recipient email (should be a ChitBox user)
      const toEmails = email.to ? (Array.isArray(email.to) ? email.to : [email.to]) : [];
      let recipientEmail: string | undefined;
      for (const to of toEmails) {
        const address = (to as any).address;
        if (address && address.endsWith('@chitbox.co')) {
          recipientEmail = address;
          break;
        }
      }

      if (!recipientEmail) {
        console.log('📧 Email not for ChitBox user, skipping');
        return;
      }

      // Check if recipient exists in database
      const userResult = await Database.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [recipientEmail]
      );

      if (userResult.rows.length === 0) {
        console.log(`📧 Recipient ${recipientEmail} not found in database`);
        return;
      }

      const user = userResult.rows[0];

      // Get or create inbox folder
      let folderResult = await Database.query(
        'SELECT id FROM folders WHERE user_id = $1 AND type = $2',
        [user.id, 'inbox']
      );

      if (folderResult.rows.length === 0) {
        folderResult = await Database.query(
          'INSERT INTO folders (user_id, name, type) VALUES ($1, $2, $3) RETURNING id',
          [user.id, 'Inbox', 'inbox']
        );
      }

      const folderId = folderResult.rows[0].id;

      // Create thread
      const threadResult = await Database.query(
        'INSERT INTO mail_threads (subject, folder_id, user_id, is_read, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $5) RETURNING id',
        [email.subject || 'No Subject', folderId, user.id, false, new Date()]
      );

      const threadId = threadResult.rows[0].id;

      // Create message
      const messageResult = await Database.query(
        `INSERT INTO mail_messages (
          thread_id, from_email, from_name, to_emails, subject, body_text, body_html, 
          is_read, is_sent, sent_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          threadId,
          email.from?.value[0]?.address || 'unknown@example.com',
          email.from?.value[0]?.name || 'Unknown Sender',
          [recipientEmail],
          email.subject || 'No Subject',
          email.text || (email.html ? email.html.replace(/<[^>]*>/g, '') : '') || '',
          email.html || '',
          false,
          false,
          email.date || new Date(),
          new Date()
        ]
      );

      const messageId = messageResult.rows[0].id;

      // Process attachments if any
      if (email.attachments && email.attachments.length > 0) {
        for (const attachment of email.attachments) {
          if (attachment.content) {
            await Database.query(
              `INSERT INTO attachments (message_id, filename, original_name, mime_type, file_size, file_path)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                messageId,
                attachment.filename || 'attachment',
                attachment.filename || 'attachment',
                attachment.contentType || 'application/octet-stream',
                attachment.size || 0,
                null // We're not storing file content in this simple implementation
              ]
            );
          }
        }
      }

      console.log(`✅ Email processed and saved: ${email.subject}`);
      
      // Emit real-time notification
      const io = require('../socket/handlers').getIO();
      if (io) {
        io.to(`user_${user.id}`).emit('new_email', {
          folderId,
          email: {
            id: threadId,
            subject: email.subject || 'No Subject',
            fromEmail: email.from?.value[0]?.address,
            fromName: email.from?.value[0]?.name,
            isRead: false,
            createdAt: new Date()
          }
        });
      }

    } catch (error) {
      console.error('❌ Error processing email:', error);
    }
  }

  // Start IMAP monitoring
  startMonitoring(): void {
    if (this.processingInterval) return;
    
    console.log('🚀 Starting IMAP monitoring...');
    
    try {
      this.imap.connect();
    } catch (error) {
      console.error('❌ Error connecting to IMAP:', error);
    }
    
    // Also process emails periodically as backup
    this.processingInterval = setInterval(() => {
      if (this.imap.state === 'authenticated') {
        this.processNewEmails();
      }
    }, 60000); // Check every minute
  }

  // Stop IMAP monitoring
  stopMonitoring(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    if (this.imap.state === 'authenticated') {
      this.imap.end();
    }
    
    console.log('⏹️ IMAP monitoring stopped');
  }
}

// Export singleton instance
export const imapService = new ImapService();
