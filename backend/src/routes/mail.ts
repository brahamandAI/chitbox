import express from 'express';
import Database from '../database/connection';
import { verifyToken } from '../middleware/session';
import { MailService } from '../services/mailService';
import { EmailQueueService } from '../services/emailQueue';
import { sanitizeInput, validateEmailData, rateLimit } from '../middleware/validation';
import { Server as SocketIOServer } from 'socket.io';

const router = express.Router();
const mailService = new MailService();
const emailQueue = new EmailQueueService();

// Store Socket.IO instance
let io: SocketIOServer | null = null;

// Function to set Socket.IO instance
export function setSocketIO(socketIO: SocketIOServer) {
  io = socketIO;
}

// Helper function to save incoming emails
async function saveIncomingEmail({
  from_email,
  from_name,
  to_email,
  to_name,
  subject,
  body_text,
  body_html,
  cc = [],
  bcc = [],
  attachments = []
}: {
  from_email: string;
  from_name: string;
  to_email: string;
  to_name: string;
  subject: string;
  body_text: string;
  body_html?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: any[];
}) {
  // Get or create inbox folder for recipient
  let folderResult = await Database.query(
    'SELECT id FROM folders WHERE user_id = (SELECT id FROM users WHERE email = $1) AND type = $2',
    [to_email, 'inbox']
  );

  let folderId = folderResult.rows[0]?.id;

  if (!folderId) {
    // Get user ID first
    const userResult = await Database.query('SELECT id FROM users WHERE email = $1', [to_email]);
    if (userResult.rows.length === 0) return; // User doesn't exist
    
    const userId = userResult.rows[0].id;
    const newFolderResult = await Database.query(
      'INSERT INTO folders (user_id, name, type) VALUES ($1, $2, $3) RETURNING id',
      [userId, 'Inbox', 'inbox']
    );
    folderId = newFolderResult.rows[0].id;
  }

  // Get user ID for the recipient
  const userResult = await Database.query('SELECT id FROM users WHERE email = $1', [to_email]);
  const userId = userResult.rows[0].id;

  // Create mail thread in recipient's inbox
  const threadResult = await Database.query(
    'INSERT INTO mail_threads (subject, folder_id, user_id, is_read) VALUES ($1, $2, $3, $4) RETURNING id',
    [subject, folderId, userId, false]
  );

  const threadId = threadResult.rows[0].id;

  // Create mail message in recipient's inbox
  const messageResult = await Database.query(`
    INSERT INTO mail_messages (
      thread_id, from_email, from_name, to_emails, cc_emails, bcc_emails,
      subject, body_text, body_html, is_sent, sent_at, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id
  `, [
    threadId,
    from_email,
    from_name,
    [to_email],
    cc,
    bcc,
    subject,
    body_text,
    body_html,
    false, // This is received email, not sent
    new Date(),
    new Date()
  ]);

  const messageId = messageResult.rows[0].id;

  // Handle attachments if any
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      await Database.query(`
        INSERT INTO attachments (message_id, filename, original_name, mime_type, file_size, file_path)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        messageId,
        attachment.filename,
        attachment.originalName,
        attachment.mimeType,
        attachment.fileSize,
        attachment.filePath
      ]);
    }
  }

  // Emit Socket.IO notification for new email
  if (io) {
    io.to(`user_${userId}`).emit('new_email', {
      folderId,
      threadId,
      messageId,
      fromEmail: from_email,
      fromName: from_name,
      subject,
      preview: body_text.substring(0, 100)
    });
    console.log(`📬 Notification sent to user ${userId} for new email`);
  }

  return { threadId, messageId };
}

// Get all folders for a user
router.get('/folders', verifyToken, async (req: any, res) => {
  try {
    const folders = await Database.query(
      'SELECT id, name, type, created_at FROM folders WHERE user_id = $1 ORDER BY type, name',
      [req.user.id]
    );

    res.json({ folders: folders.rows });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mail threads for a folder
router.get('/threads/:folderId', verifyToken, async (req: any, res) => {
  try {
    const { folderId } = req.params;
    const { page = 1, limit = 20, search = '' } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT 
        mt.id,
        mt.subject,
        mt.is_read,
        mt.is_starred,
        mt.is_important,
        mt.created_at,
        mt.updated_at,
        mm.from_email,
        mm.from_name,
        mm.to_emails,
        mm.body_text,
        mm.sent_at,
        mm.is_sent
      FROM mail_threads mt
      INNER JOIN mail_messages mm ON mt.id = mm.thread_id
      WHERE mt.folder_id = $1 AND mt.user_id = $2
      AND mm.id = (
        SELECT MAX(id) FROM mail_messages mm2 
        WHERE mm2.thread_id = mt.id
      )
    `;

    const params: any[] = [folderId, req.user.id];

    if (search) {
      query += ` AND (mt.subject ILIKE $3 OR mm.from_email ILIKE $3 OR mm.to_emails::text ILIKE $3 OR mm.body_text ILIKE $3)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY mt.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string), offset);

    const threads = await Database.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) FROM mail_threads mt
      WHERE mt.folder_id = $1 AND mt.user_id = $2
    `;
    const countParams: any[] = [folderId, req.user.id];

    if (search) {
      countQuery += ` AND (mt.subject ILIKE $3)`;
      countParams.push(`%${search}%`);
    }

    const countResult = await Database.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      threads: threads.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages in a thread
router.get('/threads/:threadId/messages', verifyToken, async (req: any, res) => {
  try {
    const { threadId } = req.params;

    const messages = await Database.query(`
      SELECT 
        mm.id,
        mm.from_email,
        mm.from_name,
        mm.to_emails,
        mm.cc_emails,
        mm.bcc_emails,
        mm.subject,
        mm.body_text,
        mm.body_html,
        mm.is_read,
        mm.is_draft,
        mm.is_sent,
        mm.sent_at,
        mm.created_at
      FROM mail_messages mm
      WHERE mm.thread_id = $1
      ORDER BY mm.created_at ASC
    `, [threadId]);

    // Get attachments for each message
    const messagesWithAttachments = await Promise.all(
      messages.rows.map(async (message: any) => {
        const attachments = await Database.query(
          'SELECT id, filename, original_name, mime_type, file_size, file_path FROM attachments WHERE message_id = $1',
          [message.id]
        );
        return { ...message, attachments: attachments.rows };
      })
    );

    res.json({ messages: messagesWithAttachments });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send email
router.post('/send', verifyToken, sanitizeInput, rateLimit(20, 300000), validateEmailData, async (req: any, res) => {
  try {
    const { to, cc, bcc, subject, body, attachments } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'To, subject, and body are required' });
    }

    // Get user's email
    const userResult = await Database.query(
      'SELECT email, name FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const recipients = Array.isArray(to) ? to : [to];

    // Send email to each recipient
    for (const recipientEmail of recipients) {
      // Check if recipient is a ChitBox user
      const recipientResult = await Database.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [recipientEmail]
      );

      if (recipientResult.rows.length > 0) {
        // Recipient is a ChitBox user - save in their inbox
        const recipient = recipientResult.rows[0];
        await saveIncomingEmail({
          from_email: user.email,
          from_name: user.name,
          to_email: recipient.email,
          to_name: recipient.name,
          subject,
          body_text: body.text || body,
          body_html: body.html || body,
          cc: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
          bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
          attachments: attachments || []
        });
      } else {
        // External recipient - queue for SMTP delivery
        console.log(`📬 Queueing email for external recipient: ${recipientEmail}`);
        await emailQueue.queueEmail({
          from_email: user.email,
          from_name: user.name,
          to_email: recipientEmail,
          subject,
          body_text: body.text || body,
          body_html: body.html || body,
          cc_emails: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
          bcc_emails: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
          attachments: attachments || []
        });
      }
    }

    // Get or create sent folder
    let folderResult = await Database.query(
      'SELECT id FROM folders WHERE user_id = $1 AND type = $2',
      [req.user.id, 'sent']
    );

    let folderId = folderResult.rows[0]?.id;

    if (!folderId) {
      const newFolderResult = await Database.query(
        'INSERT INTO folders (user_id, name, type) VALUES ($1, $2, $3) RETURNING id',
        [req.user.id, 'Sent', 'sent']
      );
      folderId = newFolderResult.rows[0].id;
    }

    // Create mail thread
    const threadResult = await Database.query(
      'INSERT INTO mail_threads (subject, folder_id, user_id) VALUES ($1, $2, $3) RETURNING id',
      [subject, folderId, req.user.id]
    );

    const threadId = threadResult.rows[0].id;

    // Create mail message
    const messageResult = await Database.query(`
      INSERT INTO mail_messages (
        thread_id, from_email, from_name, to_emails, cc_emails, bcc_emails,
        subject, body_text, body_html, is_sent, sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [
      threadId,
      user.email,
      user.name,
      recipients,
      cc ? (Array.isArray(cc) ? cc : [cc]) : [],
      bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
      subject,
      body.text || body,
      body.html || body,
      true,
      new Date()
    ]);

    const messageId = messageResult.rows[0].id;

    // Handle attachments if any
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        await Database.query(`
          INSERT INTO attachments (message_id, filename, original_name, mime_type, file_size, file_path)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          messageId,
          attachment.filename,
          attachment.originalName,
          attachment.mimeType,
          attachment.fileSize,
          attachment.filePath
        ]);
      }
    }

    // Email queue will handle external delivery automatically
    console.log('📬 External emails queued for delivery');

    res.json({ 
      message: 'Email sent successfully',
      threadId,
      messageId
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save draft
router.post('/drafts', verifyToken, async (req: any, res) => {
  try {
    const { to, cc, bcc, subject, body, threadId } = req.body;

    // Get user's email
    const userResult = await Database.query(
      'SELECT email, name FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];

    let messageId;

    if (threadId) {
      // Update existing draft
      const result = await Database.query(`
        UPDATE mail_messages 
        SET to_emails = $1, cc_emails = $2, bcc_emails = $3, subject = $4, body_text = $5, body_html = $6
        WHERE thread_id = $7 AND is_draft = true
        RETURNING id
      `, [
        Array.isArray(to) ? to : (to ? [to] : []),
        cc ? (Array.isArray(cc) ? cc : [cc]) : [],
        bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
        subject,
        body.text || body,
        body.html || body,
        threadId
      ]);

      messageId = result.rows[0]?.id;
    } else {
      // Create new draft thread and message
      const threadResult = await Database.query(
        'INSERT INTO mail_threads (subject, folder_id, user_id) VALUES ($1, (SELECT id FROM folders WHERE user_id = $2 AND type = $3), $2) RETURNING id',
        [subject || 'Draft', req.user.id, 'drafts']
      );

      const newThreadId = threadResult.rows[0].id;

      const messageResult = await Database.query(`
        INSERT INTO mail_messages (
          thread_id, from_email, from_name, to_emails, cc_emails, bcc_emails,
          subject, body_text, body_html, is_draft
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `, [
        newThreadId,
        user.email,
        user.name,
        Array.isArray(to) ? to : (to ? [to] : []),
        cc ? (Array.isArray(cc) ? cc : [cc]) : [],
        bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [],
        subject,
        body.text || body,
        body.html || body,
        true
      ]);

      messageId = messageResult.rows[0].id;
    }

    res.json({ 
      message: 'Draft saved successfully',
      messageId
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete thread (permanently)
router.delete('/threads/:threadId', verifyToken, async (req: any, res) => {
  try {
    const { threadId } = req.params;

    // Check if thread belongs to user
    const threadResult = await Database.query(
      'SELECT id FROM mail_threads WHERE id = $1 AND user_id = $2',
      [threadId, req.user.id]
    );

    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Delete thread (cascade will delete messages and attachments)
    await Database.query(
      'DELETE FROM mail_threads WHERE id = $1 AND user_id = $2',
      [threadId, req.user.id]
    );

    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark thread as read/unread
router.patch('/threads/:threadId/read', verifyToken, async (req: any, res) => {
  try {
    const { threadId } = req.params;
    const { isRead } = req.body;

    await Database.query(
      'UPDATE mail_threads SET is_read = $1 WHERE id = $2 AND user_id = $3',
      [isRead, threadId, req.user.id]
    );

    res.json({ message: 'Thread updated successfully' });
  } catch (error) {
    console.error('Update thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Star/unstar thread
router.patch('/threads/:threadId/star', verifyToken, async (req: any, res) => {
  try {
    const { threadId } = req.params;
    const { isStarred } = req.body;

    await Database.query(
      'UPDATE mail_threads SET is_starred = $1 WHERE id = $2 AND user_id = $3',
      [isStarred, threadId, req.user.id]
    );

    res.json({ message: 'Thread updated successfully' });
  } catch (error) {
    console.error('Update thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attachment content
router.get('/attachments/:attachmentId', verifyToken, async (req: any, res) => {
  try {
    const { attachmentId } = req.params;

    // Get attachment info and verify user access
    const attachmentResult = await Database.query(`
      SELECT 
        a.id, a.filename, a.original_name, a.mime_type, a.file_size, a.file_path,
        mm.thread_id, mt.user_id
      FROM attachments a
      INNER JOIN mail_messages mm ON a.message_id = mm.id
      INNER JOIN mail_threads mt ON mm.thread_id = mt.id
      WHERE a.id = $1 AND mt.user_id = $2
    `, [attachmentId, req.user.id]);

    if (attachmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = attachmentResult.rows[0];

    // For now, we're not storing file content in the database
    // This endpoint is ready for when you implement file storage
    res.json({
      id: attachment.id,
      filename: attachment.filename || attachment.original_name,
      mimeType: attachment.mime_type,
      fileSize: attachment.file_size,
      message: 'Attachment metadata retrieved. File content storage not implemented yet.'
    });

  } catch (error) {
    console.error('Get attachment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
