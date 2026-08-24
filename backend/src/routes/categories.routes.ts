import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateUUID } from '../utils/auth';

const router = Router();

router.use(authenticate);

// Get all categories (system defaults + user specific)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const records = await db.all(
      'SELECT * FROM income_categories WHERE is_default = 1 OR user_id = ? ORDER BY is_default DESC, name ASC',
      [req.userId]
    );

    const categories = records.map(r => ({
      id: r.id,
      name: r.name,
      isDefault: Boolean(r.is_default),
      icon: r.icon,
      color: r.color,
      createdAt: r.created_at
    }));

    return res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create custom category
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = generateUUID();
    const db = await getDb();

    await db.run(
      'INSERT INTO income_categories (id, user_id, name, is_default, icon, color) VALUES (?, ?, ?, 0, ?, ?)',
      [id, req.userId, name.toLowerCase(), icon, color]
    );

    const newRecord = await db.get('SELECT * FROM income_categories WHERE id = ?', [id]);
    const category = {
      id: newRecord.id,
      name: newRecord.name,
      isDefault: Boolean(newRecord.is_default),
      icon: newRecord.icon,
      color: newRecord.color,
      createdAt: newRecord.created_at
    };

    return res.status(201).json({ category });
  } catch (error) {
    console.error('Post category error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
