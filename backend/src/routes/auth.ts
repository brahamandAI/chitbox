import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from '../database/connection';
import { sanitizeInput, validateRegistration, validateLogin, rateLimit } from '../middleware/validation';
import { createSession, logoutUser, verifyToken } from '../middleware/session';

const router = express.Router();

// Check email / username availability (public endpoint)
router.get('/check-email', async (req, res) => {
  const { username } = req.query as { username?: string };

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'username query param is required' });
  }

  const trimmed = username.trim().toLowerCase();

  // Validate username format
  const usernameRegex = /^[a-z0-9._-]+$/;
  const invalidPatterns = ['test', 'admin', 'root', 'postmaster', 'abuse', 'noreply', 'no-reply'];

  if (!usernameRegex.test(trimmed)) {
    return res.json({
      available: false,
      reason: 'Username can only contain letters, numbers, dots, hyphens, and underscores'
    });
  }

  if (invalidPatterns.some(p => trimmed.includes(p))) {
    return res.json({
      available: false,
      reason: 'This username is reserved and cannot be used'
    });
  }

  if (trimmed.length < 3) {
    return res.json({ available: false, reason: 'Username must be at least 3 characters' });
  }

  const email = `${trimmed}@chitbox.co`;

  try {
    const result = await Database.query('SELECT id FROM users WHERE email = $1', [email]);
    return res.json({
      available: result.rows.length === 0,
      email,
      reason: result.rows.length > 0 ? 'This email address is already registered' : null
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

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

    // Validate email domain - only @chitbox.co allowed
    const emailDomain = email.toLowerCase().split('@')[1];
    if (emailDomain !== 'chitbox.co') {
      return res.status(400).json({ 
        error: 'Only @chitbox.co email addresses are allowed. Please use a valid ChitBox email address.' 
      });
    }

    // Validate email format and prevent silly names
    const emailUsername = email.toLowerCase().split('@')[0];
    const invalidPatterns = ['test', 'admin', 'root', 'postmaster', 'abuse', 'noreply', 'no-reply', 'devilboy', 'silly', 'fake', 'temp', 'spam'];
    
    if (invalidPatterns.some(pattern => emailUsername.includes(pattern))) {
      return res.status(400).json({ 
        error: 'This username is not allowed. Please choose a professional email address.' 
      });
    }

    // Validate email username format (alphanumeric, dots, hyphens, underscores only)
    const usernameRegex = /^[a-z0-9._-]+$/;
    if (!usernameRegex.test(emailUsername)) {
      return res.status(400).json({ 
        error: 'Email username can only contain letters, numbers, dots, hyphens, and underscores.' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists (uniqueness check)
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

// Update profile
router.put('/profile', verifyToken, sanitizeInput, async (req: any, res) => {
  try {
    const { name, profession, country } = req.body;
    const errors: string[] = [];

    if (name !== undefined) {
      if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
      if (name.trim().length > 255) errors.push('Name is too long');
    }
    if (profession !== undefined && profession.length > 100) errors.push('Profession is too long');
    if (country !== undefined && country.length > 100) errors.push('Country is too long');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const result = await Database.query(
      `UPDATE users 
       SET name        = COALESCE($1, name),
           profession  = COALESCE($2, profession),
           country     = COALESCE($3, country),
           updated_at  = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, name, profession, country, age, interests, newsletter, created_at`,
      [name?.trim() || null, profession || null, country || null, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Change password
router.post('/change-password', verifyToken, sanitizeInput, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }

    const errors: string[] = [];
    if (newPassword.length < 8) errors.push('New password must be at least 8 characters');
    if (!/[a-z]/.test(newPassword)) errors.push('New password must contain a lowercase letter');
    if (!/[A-Z]/.test(newPassword)) errors.push('New password must contain an uppercase letter');
    if (!/\d/.test(newPassword)) errors.push('New password must contain a number');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    // Fetch current hash
    const userResult = await Database.query(
      'SELECT password_hash FROM users WHERE id = $1', [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await Database.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, req.user.id]
    );

    // Invalidate all existing sessions except current
    const currentToken = req.headers.authorization?.split(' ')[1];
    await Database.query(
      'DELETE FROM user_sessions WHERE user_id = $1 AND session_token != $2',
      [req.user.id, currentToken]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
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
