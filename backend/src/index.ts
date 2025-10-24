import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from './database/connection';
import mailRoutes, { setSocketIO } from './routes/mail';
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';
import { setupSocketHandlers } from './socket/handlers';
import { smtpServer } from './services/smtpServer';
import { EmailQueueService } from './services/emailQueue';
import { imapServer } from './services/imapServer';

dotenv.config();

const app = express();
const server = createServer(app);

// Parse CORS origins (supports comma-separated list or single origin)
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ["https://chitbox.co"];

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3005;
const SMTP_PORT = parseInt(process.env.SMTP_SERVER_PORT || '2525');

// Middleware
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Pass Socket.IO to mail routes for real-time notifications
setSocketIO(io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await Database.testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start SMTP server
    smtpServer.setSocketIO(io);
    await smtpServer.start(SMTP_PORT);

    // Initialize email queue service
    const emailQueue = new EmailQueueService();

    server.listen(PORT, () => {
      console.log(`🚀 ChitBox Backend running on port ${PORT}`);
      console.log(`📧 SMTP server running on port ${SMTP_PORT}`);
      console.log(`🔌 Socket.IO server ready for real-time updates`);
      
      // Start email queue processor
      emailQueue.startProcessing();
      console.log(`📬 Email queue processor started`);
      
      // Start IMAP server for email client access
      imapServer.start().then(() => {
        console.log(`📧 IMAP server started`);
      }).catch((err) => {
        console.error('Failed to start IMAP server:', err);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await smtpServer.stop();
  await imapServer.stop();
  await Database.close();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await smtpServer.stop();
  await imapServer.stop();
  await Database.close();
  server.close(() => {
    console.log('Process terminated');
  });
});

startServer();
