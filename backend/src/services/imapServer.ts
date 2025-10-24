import net from 'net';
import Database from '../database/connection';

export class IMAPServerService {
  private server: net.Server;
  private isRunning: boolean = false;
  private port: number;

  constructor(port: number = 143) {
    this.port = port;
    this.server = net.createServer(this.handleConnection.bind(this));
  }

  private handleConnection(socket: net.Socket): void {
    console.log(`📧 IMAP Connection from: ${socket.remoteAddress}:${socket.remotePort}`);
    
    let isAuthenticated = false;
    let currentUser: any = null;

    // Send IMAP banner
    socket.write('* OK ChitBox IMAP Server ready\r\n');

    socket.on('data', async (data) => {
      try {
        const command = data.toString().trim();
        console.log(`📧 IMAP Command: ${command}`);

        if (command.startsWith('CAPABILITY')) {
          socket.write('* CAPABILITY IMAP4rev1 AUTH=PLAIN\r\n');
          socket.write('A001 OK Capability completed\r\n');
        } else if (command.startsWith('LOGIN')) {
          const [, , username, password] = command.split(' ');
          
          // Authenticate user against database
          const userResult = await Database.query(
            'SELECT id, email, name FROM users WHERE email = $1',
            [username]
          );

          if (userResult.rows.length === 0) {
            socket.write('A002 NO Authentication failed\r\n');
          } else {
            isAuthenticated = true;
            currentUser = userResult.rows[0];
            console.log(`✅ IMAP Auth successful for user: ${currentUser.email}`);
            socket.write('A002 OK Authentication successful\r\n');
          }
        } else if (command.startsWith('SELECT') && isAuthenticated) {
          const [, mailbox] = command.split(' ');
          console.log(`📧 IMAP SELECT: ${mailbox} for user ${currentUser.email}`);
          
          // Get folder
          let folderResult = await Database.query(
            'SELECT id FROM folders WHERE user_id = $1 AND name = $2',
            [currentUser.id, mailbox]
          );

          let folderId = folderResult.rows[0]?.id;

          if (!folderId && mailbox.toLowerCase() === 'inbox') {
            // Create inbox if it doesn't exist
            folderResult = await Database.query(
              'INSERT INTO folders (user_id, name, type) VALUES ($1, $2, $3) RETURNING id',
              [currentUser.id, 'Inbox', 'inbox']
            );
            folderId = folderResult.rows[0].id;
          }

          if (!folderId) {
            socket.write('A003 NO Mailbox not found\r\n');
          } else {
            // Get message count
            const messageCountResult = await Database.query(
              'SELECT COUNT(*) as count FROM mail_threads WHERE folder_id = $1',
              [folderId]
            );

            const messageCount = parseInt(messageCountResult.rows[0].count);

            // Get unseen count
            const unseenCountResult = await Database.query(
              'SELECT COUNT(*) as count FROM mail_threads WHERE folder_id = $1 AND is_read = false',
              [folderId]
            );

            const unseenCount = parseInt(unseenCountResult.rows[0].count);

            socket.write(`* ${messageCount} EXISTS\r\n`);
            socket.write(`* 0 RECENT\r\n`);
            socket.write(`* OK [UNSEEN ${unseenCount}] Message ${unseenCount} is first unseen\r\n`);
            socket.write(`* OK [UIDVALIDITY 1] UIDs valid\r\n`);
            socket.write(`* OK [UIDNEXT ${messageCount + 1}] Predicted next UID\r\n`);
            socket.write(`* FLAGS (\\Answered \\Flagged \\Deleted \\Seen \\Draft)\r\n`);
            socket.write(`* OK [PERMANENTFLAGS (\\Answered \\Flagged \\Deleted \\Seen \\Draft)] Limited\r\n`);
            socket.write('A003 OK [READ-WRITE] SELECT completed\r\n');
          }
        } else if (command.startsWith('LIST') && isAuthenticated) {
          console.log(`📧 IMAP LIST for user ${currentUser.email}`);
          
          // Get user's folders
          const foldersResult = await Database.query(
            'SELECT name, type FROM folders WHERE user_id = $1 ORDER BY type, name',
            [currentUser.id]
          );

          for (const folder of foldersResult.rows) {
            const attributes = folder.type === 'inbox' ? '(\\HasNoChildren \\Inbox)' : '(\\HasNoChildren)';
            socket.write(`* LIST ${attributes} "/" "${folder.name}"\r\n`);
          }

          socket.write('A004 OK LIST completed\r\n');
        } else if (command.startsWith('FETCH') && isAuthenticated) {
          console.log(`📧 IMAP FETCH for user ${currentUser.email}`);
          
          // Get messages
          const threadsResult = await Database.query(`
            SELECT 
              mt.id,
              mt.subject,
              mt.is_read,
              mt.is_starred,
              mt.created_at,
              mm.from_email,
              mm.from_name,
              mm.body_text,
              mm.body_html
            FROM mail_threads mt
            INNER JOIN mail_messages mm ON mt.id = mm.thread_id
            WHERE mt.user_id = $1
            ORDER BY mt.created_at DESC
            LIMIT 10
          `, [currentUser.id]);

          for (let i = 0; i < threadsResult.rows.length; i++) {
            const thread = threadsResult.rows[i];
            const uid = i + 1;
            const messageText = this.buildRFC2822Message(thread);
            const flags = thread.is_read ? '\\Seen' : '';
            
            socket.write(`* ${uid} FETCH (UID ${uid} FLAGS (${flags}) RFC822.SIZE ${messageText.length} ENVELOPE ("${new Date(thread.created_at).toUTCString()}" "${thread.subject || 'No Subject'}" (("${thread.from_name || ''}" NIL "${thread.from_name || ''}" "${thread.from_email}")) (("${thread.from_name || ''}" NIL "${thread.from_name || ''}" "${thread.from_email}")) (("${thread.from_name || ''}" NIL "${thread.from_name || ''}" "${thread.from_email}")) (("user" NIL "user" "user@chitbox.co")) NIL NIL NIL NIL))\r\n`);
          }

          socket.write('A005 OK FETCH completed\r\n');
        } else if (command.startsWith('SEARCH') && isAuthenticated) {
          console.log(`📧 IMAP SEARCH for user ${currentUser.email}`);
          
          // Get all message UIDs
          const threadsResult = await Database.query(
            'SELECT id FROM mail_threads WHERE user_id = $1 ORDER BY created_at DESC',
            [currentUser.id]
          );

          const uids = threadsResult.rows.map((row: any, index: number) => index + 1);
          socket.write(`* SEARCH ${uids.join(' ')}\r\n`);
          socket.write('A006 OK SEARCH completed\r\n');
        } else if (command.startsWith('LOGOUT')) {
          socket.write('* BYE ChitBox IMAP Server logging out\r\n');
          socket.write('A007 OK LOGOUT completed\r\n');
          socket.end();
        } else {
          socket.write('A000 NO Command not implemented\r\n');
        }
      } catch (error) {
        console.error('❌ IMAP Command error:', error);
        socket.write('A000 NO Internal error\r\n');
      }
    });

    socket.on('close', () => {
      console.log(`📧 IMAP session closed: ${socket.remoteAddress}`);
    });

    socket.on('error', (err) => {
      console.error('❌ IMAP Socket error:', err);
    });
  }

  private buildRFC2822Message(thread: any): string {
    const headers = [
      `From: ${thread.from_name} <${thread.from_email}>`,
      `To: user@chitbox.co`,
      `Subject: ${thread.subject || 'No Subject'}`,
      `Date: ${new Date(thread.created_at).toUTCString()}`,
      `Message-ID: <${thread.id}@chitbox.co>`,
      `Content-Type: text/plain; charset=utf-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      thread.body_text || 'No content'
    ];

    return headers.join('\r\n');
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  IMAP server is already running');
      return;
    }

    return new Promise((resolve, reject) => {
      this.server.listen(this.port, (err?: Error) => {
        if (err) {
          console.error('❌ Failed to start IMAP server:', err);
          reject(err);
        } else {
          this.isRunning = true;
          console.log(`✅ IMAP server started on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️  IMAP server is not running');
      return;
    }

    return new Promise((resolve) => {
      this.server.close(() => {
        this.isRunning = false;
        console.log('✅ IMAP server stopped');
        resolve();
      });
    });
  }

  public isServerRunning(): boolean {
    return this.isRunning;
  }
}

export const imapServer = new IMAPServerService();