import { Request, Response, NextFunction } from 'express';

// Input sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Only sanitize body (query and params are read-only in Express)
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Optional: Add special character requirement
  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   errors.push('Password must contain at least one special character');
  // }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// User registration validation
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, confirmPassword, age, profession, country } = req.body;
  const errors: string[] = [];

  // Required fields
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Enforce @chitbox.co domain for registration
  if (email && !email.toLowerCase().endsWith('@chitbox.co')) {
    errors.push('You can only register with a @chitbox.co email address');
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }

  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  // Age validation
  if (age) {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      errors.push('Age must be between 13 and 120');
    }
  }

  // Profession validation
  if (profession && profession.length > 100) {
    errors.push('Profession must be less than 100 characters');
  }

  // Country validation
  if (country && country.length > 100) {
    errors.push('Country must be less than 100 characters');
  }

  // Interests validation
  if (req.body.interests) {
    if (!Array.isArray(req.body.interests)) {
      errors.push('Interests must be an array');
    } else if (req.body.interests.length > 10) {
      errors.push('You can select up to 10 interests');
    } else {
      req.body.interests.forEach((interest: string, index: number) => {
        if (typeof interest !== 'string' || interest.length > 50) {
          errors.push(`Interest ${index + 1} must be a string less than 50 characters`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Login validation
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || !validateEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Email validation
export const validateEmailData = (req: Request, res: Response, next: NextFunction) => {
  const { to, subject, body } = req.body;
  const errors: string[] = [];

  if (!to) {
    errors.push('Recipient is required');
  } else {
    const recipients = Array.isArray(to) ? to : [to];
    recipients.forEach((recipient: string, index: number) => {
      if (!validateEmail(recipient)) {
        errors.push(`Recipient ${index + 1} is not a valid email address`);
      }
    });
  }

  if (!subject || subject.trim().length === 0) {
    errors.push('Subject is required');
  } else if (subject.length > 500) {
    errors.push('Subject must be less than 500 characters');
  }

  if (!body || (typeof body === 'string' && body.trim().length === 0)) {
    errors.push('Email body is required');
  }

  // Validate CC and BCC if provided
  if (req.body.cc) {
    const ccRecipients = Array.isArray(req.body.cc) ? req.body.cc : [req.body.cc];
    ccRecipients.forEach((recipient: string, index: number) => {
      if (!validateEmail(recipient)) {
        errors.push(`CC recipient ${index + 1} is not a valid email address`);
      }
    });
  }

  if (req.body.bcc) {
    const bccRecipients = Array.isArray(req.body.bcc) ? req.body.bcc : [req.body.bcc];
    bccRecipients.forEach((recipient: string, index: number) => {
      if (!validateEmail(recipient)) {
        errors.push(`BCC recipient ${index + 1} is not a valid email address`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Email validation failed',
      details: errors
    });
  }

  next();
};

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (maxRequests: number = 100, windowMs: number = 900000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = rateLimitMap.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      // Reset or create new entry
      rateLimitMap.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((clientData.resetTime - now) / 1000)} seconds.`
      });
    }
    
    clientData.count++;
    next();
  };
};

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [clientId, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(clientId);
    }
  }
}, 60000); // Clean up every minute
