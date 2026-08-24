import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateUUID } from '../utils/auth';

const router = Router();

router.use(authenticate);

// Get income sources
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const records = await db.all('SELECT * FROM income_sources WHERE user_id = ? ORDER BY created_at DESC', [req.userId]);

    const incomeSources = records.map(r => ({
      id: r.id,
      title: r.title,
      categoryId: r.category_id,
      amount: r.amount,
      currency: r.currency,
      startDate: r.start_date,
      endDate: r.end_date,
      frequency: r.frequency,
      isActive: Boolean(r.is_active),
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    return res.json({ incomeSources });
  } catch (error) {
    console.error('Get income sources error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add an income source
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, categoryId, amount, currency = 'INR', startDate, endDate = null, frequency = 'Onetime', isActive = true, notes = null } = req.body;

    if (!title || amount === undefined || !startDate || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = generateUUID();
    const db = await getDb();

    await db.run(
      'INSERT INTO income_sources (id, user_id, title, category_id, amount, currency, start_date, end_date, frequency, is_active, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.userId, title, categoryId, amount, currency, startDate, endDate, frequency, isActive ? 1 : 0, notes]
    );

    const newRecord = await db.get('SELECT * FROM income_sources WHERE id = ?', [id]);
    const incomeSource = {
      id: newRecord.id,
      title: newRecord.title,
      categoryId: newRecord.category_id,
      amount: newRecord.amount,
      currency: newRecord.currency,
      startDate: newRecord.start_date,
      endDate: newRecord.end_date,
      frequency: newRecord.frequency,
      isActive: Boolean(newRecord.is_active),
      notes: newRecord.notes,
      createdAt: newRecord.created_at,
      updatedAt: newRecord.updated_at
    };
    return res.status(201).json({ incomeSource });
  } catch (error) {
    console.error('Post income source error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE an income source
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, categoryId, amount, currency = 'INR', startDate, endDate = null, frequency = 'Onetime', isActive = true, notes = null } = req.body;
    const db = await getDb();
    
    // Check ownership
    const source = await db.get('SELECT * FROM income_sources WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!source) {
      return res.status(404).json({ error: 'Income source not found' });
    }

    await db.run(
      'UPDATE income_sources SET title = ?, category_id = ?, amount = ?, currency = ?, start_date = ?, end_date = ?, frequency = ?, is_active = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, categoryId, amount, currency, startDate, endDate, frequency, isActive ? 1 : 0, notes, id]
    );

    const updatedSource = await db.get('SELECT * FROM income_sources WHERE id = ?', [id]);
    res.json({ incomeSource: {
      id: updatedSource.id,
      title: updatedSource.title,
      categoryId: updatedSource.category_id,
      amount: updatedSource.amount,
      currency: updatedSource.currency,
      startDate: updatedSource.start_date,
      endDate: updatedSource.end_date,
      frequency: updatedSource.frequency,
      isActive: Boolean(updatedSource.is_active),
      notes: updatedSource.notes,
      createdAt: updatedSource.created_at,
      updatedAt: updatedSource.updated_at
    } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an income source
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Check ownership
    const existing = await db.get('SELECT id FROM income_sources WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Income source not found' });
    }

    await db.run('DELETE FROM income_sources WHERE id = ? AND user_id = ?', [id, req.userId]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete income source error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
