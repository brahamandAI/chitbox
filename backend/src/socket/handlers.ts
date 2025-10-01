import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Database from '../database/connection';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userEmail?: string;
}

export function setupSocketHandlers(io: Server) {
  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // Verify user exists
      const userResult = await Database.query(
        'SELECT id, email, name FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return next(new Error('Authentication error: User not found'));
      }

      const user = userResult.rows[0];
      socket.userId = user.id;
      socket.userEmail = user.email;
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userEmail} connected with socket ${socket.id}`);

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Handle joining specific folder rooms for real-time updates
    socket.on('join_folder', (folderId: number) => {
      socket.join(`folder_${folderId}`);
      console.log(`User ${socket.userEmail} joined folder ${folderId}`);
    });

    // Handle leaving folder rooms
    socket.on('leave_folder', (folderId: number) => {
      socket.leave(`folder_${folderId}`);
      console.log(`User ${socket.userEmail} left folder ${folderId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (data: { threadId: number, folderId: number }) => {
      socket.to(`folder_${data.folderId}`).emit('user_typing', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        threadId: data.threadId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data: { threadId: number, folderId: number }) => {
      socket.to(`folder_${data.folderId}`).emit('user_typing', {
        userId: socket.userId,
        userEmail: socket.userEmail,
        threadId: data.threadId,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userEmail} disconnected`);
    });
  });

  // Function to notify users of new emails
  async function notifyNewEmail(userId: number, folderId: number, emailData: any) {
    io.to(`user_${userId}`).emit('new_email', {
      folderId,
      email: emailData
    });
  }

  // Function to notify users of email updates
  async function notifyEmailUpdate(userId: number, folderId: number, updateData: any) {
    io.to(`user_${userId}`).emit('email_updated', {
      folderId,
      update: updateData
    });
  }

  // Function to notify users of real-time typing
  async function notifyTyping(userId: number, folderId: number, typingData: any) {
    io.to(`folder_${folderId}`).emit('user_typing', {
      userId,
      ...typingData
    });
  }
}
