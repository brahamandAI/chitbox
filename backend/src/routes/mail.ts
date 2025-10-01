import express from 'express';
import Database from '../database/connection';
import { verifyToken } from '../middleware/session';
import { MailService } from '../services/mailService';
import { sanitizeInput, validateEmailData, rateLimit } from '../middleware/validation';

const router = express.Router();
const mailService = new MailService();

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
        mm.body_text,
        mm.sent_at
      FROM mail_threads mt
      LEFT JOIN mail_messages mm ON mt.id = mm.thread_id
      WHERE mt.folder_id = $1 AND mt.user_id = $2
    `;

    const params: any[] = [folderId, req.user.id];

    if (search) {
      query += ` AND (mt.subject ILIKE $3 OR mm.from_email ILIKE $3 OR mm.body_text ILIKE $3)`;
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
          'SELECT id, filename, original_name, mime_type, file_size FROM attachments WHERE message_id = $1',
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

    // Create mail thread
    const threadResult = await Database.query(
      'INSERT INTO mail_threads (subject, folder_id, user_id) VALUES ($1, (SELECT id FROM folders WHERE user_id = $2 AND type = $3), $2) RETURNING id',
      [subject, req.user.id, 'sent']
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
      Array.isArray(to) ? to : [to],
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

    // Send email via SMTP
    try {
      await mailService.sendEmail({
        from: `${user.name} <${user.email}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
        subject,
        text: body.text || body,
        html: body.html || body,
        attachments: attachments || []
      });
    } catch (smtpError) {
      console.error('SMTP error:', smtpError);
      // Still save the message as sent in our database
    }

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

export default router;
