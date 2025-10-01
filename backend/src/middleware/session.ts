import { Request, Response, NextFunction } from 'express';
import Database from '../database/connection';
import jwt from 'jsonwebtoken';

// Simple in-memory cache for user sessions (to reduce DB queries)
const userCache = new Map<number, { user: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Enhanced token verification with session management
export const verifyToken = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Check cache first
    const cached = userCache.get(decoded.userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      req.user = cached.user;
      return next();
    }

    // Verify user exists and get fresh data
    const userResult = await Database.query(
      'SELECT id, email, name, age, profession, interests, country, newsletter FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      userCache.delete(decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    
    // Update cache
    userCache.set(decoded.userId, { user, timestamp: Date.now() });

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Create user session
export const createSession = async (userId: number, token: string): Promise<void> => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await Database.query(
      'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (session_token) DO UPDATE SET expires_at = $3',
      [userId, token, expiresAt]
    );
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

// Clean up expired sessions
export const cleanupExpiredSessions = async (): Promise<void> => {
  try {
    const result = await Database.query(
      'DELETE FROM user_sessions WHERE expires_at < NOW()'
    );
    console.log(`Cleaned up ${result.rowCount} expired sessions`);
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
};

// Logout user (invalidate session)
export const logoutUser = async (token: string): Promise<void> => {
  try {
    // Decode token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Clear cache
    userCache.delete(decoded.userId);
    
    // Delete session from database
    await Database.query(
      'DELETE FROM user_sessions WHERE session_token = $1',
      [token]
    );
  } catch (error) {
    console.error('Error logging out user:', error);
    throw error;
  }
};

// Get active sessions for a user
export const getUserSessions = async (userId: number): Promise<any[]> => {
  try {
    const result = await Database.query(
      'SELECT id, session_token, expires_at, created_at FROM user_sessions WHERE user_id = $1 AND expires_at > NOW() ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    throw error;
  }
};

// Invalidate all sessions for a user (except current one)
export const invalidateAllOtherSessions = async (userId: number, currentToken: string): Promise<void> => {
  try {
    await Database.query(
      'DELETE FROM user_sessions WHERE user_id = $1 AND session_token != $2',
      [userId, currentToken]
    );
  } catch (error) {
    console.error('Error invalidating other sessions:', error);
    throw error;
  }
};

// Clean up sessions periodically
setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // Run every hour
