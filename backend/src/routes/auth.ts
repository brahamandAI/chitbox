import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from '../database/connection';
import { sanitizeInput, validateRegistration, validateLogin, rateLimit } from '../middleware/validation';
import { createSession, logoutUser, verifyToken } from '../middleware/session';

const router = express.Router();

// Register user
router.post('/register', sanitizeInput, rateLimit(5, 300000), validateRegistration, async (req, res) => {
  try {
    const { 
      email, 
      name, 
      password, 
      confirmPassword, 
      age, 
      profession, 
      interests, 
      country, 
      newsletter 
    } = req.body;

    if (!email || !name || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Email, name, password, and confirm password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = await Database.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with all profile fields
    const newUser = await Database.query(
      `INSERT INTO users (email, name, password_hash, age, profession, interests, country, newsletter) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, email, name, age, profession, interests, country, newsletter, created_at`,
      [email, name, passwordHash, age, profession, interests, country, newsletter || false]
    );

    const user = newUser.rows[0];

    // Create default folders for the user
    const defaultFolders = [
      { name: 'Inbox', type: 'inbox' },
      { name: 'Sent', type: 'sent' },
      { name: 'Drafts', type: 'drafts' },
      { name: 'Spam', type: 'spam' },
      { name: 'Trash', type: 'trash' }
    ];

    for (const folder of defaultFolders) {
      await Database.query(
        'INSERT INTO folders (user_id, name, type) VALUES ($1, $2, $3)',
        [user.id, folder.name, folder.type]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create user session
    await createSession(user.id, token);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        profession: user.profession,
        interests: user.interests,
        country: user.country,
        newsletter: user.newsletter,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', sanitizeInput, rateLimit(10, 300000), validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const userResult = await Database.query(
      'SELECT id, email, name, password_hash, age, profession, interests, country, newsletter FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create user session
    await createSession(user.id, token);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        profession: user.profession,
        interests: user.interests,
        country: user.country,
        newsletter: user.newsletter
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get current user
router.get('/me', verifyToken, async (req: any, res) => {
  try {
    // Get fresh user data from database to ensure accuracy
    const userResult = await Database.query(
      'SELECT id, email, name, age, profession, interests, country, newsletter, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        profession: user.profession,
        interests: user.interests || [],
        country: user.country,
        newsletter: user.newsletter,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout user
router.post('/logout', verifyToken, async (req: any, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      await logoutUser(token);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
