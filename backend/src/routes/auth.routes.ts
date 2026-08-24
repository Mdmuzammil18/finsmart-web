import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';
import { hashPassword, comparePassword, generateToken, generateUUID } from '../utils/auth';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phoneNumber } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDb();

    // Check if user exists
    const existing = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const passwordHash = await hashPassword(password);
    
    // Normalize phone number if provided
    let normalizedPhone = null;
    if (phoneNumber) {
      let cleaned = phoneNumber.replace(/\D/g, '');
      if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.substring(1);
      if (cleaned.length === 10) cleaned = '91' + cleaned;
      normalizedPhone = '+' + cleaned;
    }

    let userId = null;

    if (normalizedPhone) {
      // Check for Ghost User
      const ghostUser = await db.get('SELECT id FROM users WHERE phone_number = ? AND is_ghost = 1', [normalizedPhone]);
      if (ghostUser) {
        userId = ghostUser.id;
        // Claim the ghost profile
        await db.run(
          'UPDATE users SET email = ?, password_hash = ?, name = ?, is_ghost = 0 WHERE id = ?',
          [email, passwordHash, name, userId]
        );
      }
    }

    if (!userId) {
      userId = generateUUID();
      await db.run(
        'INSERT INTO users (id, email, password_hash, name, phone_number) VALUES (?, ?, ?, ?, ?)',
        [userId, email, passwordHash, name, normalizedPhone]
      );
    }

    // Add a dummy 'Monthly Salary' income source for the new user
    const incomeId = generateUUID();
    const isoDate = new Date().toISOString().split('T')[0]; // e.g. "2026-07-05"
    await db.run(
      'INSERT INTO income_sources (id, user_id, title, amount, start_date, frequency) VALUES (?, ?, ?, ?, ?, ?)',
      [incomeId, userId, 'Monthly Salary', 0, isoDate, 'Monthly']
    );

    const token = generateToken(userId);
    
    // Default user object to return
    const user = {
      id: userId,
      email,
      name,
      avatarUrl: null,
      phoneNumber: normalizedPhone
    };

    return res.status(201).json({ token, user });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDb();
    const userRecord = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!userRecord) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, userRecord.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(userRecord.id);

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatarUrl: userRecord.avatar_url,
      phoneNumber: userRecord.phone_number
    };

    return res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const userRecord = await db.get('SELECT id, email, name, avatar_url, phone_number FROM users WHERE id = ?', req.userId);

    if (!userRecord) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatarUrl: userRecord.avatar_url,
      phoneNumber: userRecord.phone_number
    };

    return res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Profile
router.put('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, avatarUrl, phoneNumber } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const db = await getDb();
    
    // Check if email is being updated and already exists
    const existing = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.userId]);
    if (existing) {
      return res.status(409).json({ error: 'Email is already in use by another account' });
    }

    await db.run(
      'UPDATE users SET name = ?, email = ?, avatar_url = ?, phone_number = ? WHERE id = ?',
      [name, email, avatarUrl || null, phoneNumber || null, req.userId]
    );

    const userRecord = await db.get('SELECT id, email, name, avatar_url, phone_number FROM users WHERE id = ?', req.userId);
    
    const user = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatarUrl: userRecord.avatar_url,
      phoneNumber: userRecord.phone_number
    };

    return res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
