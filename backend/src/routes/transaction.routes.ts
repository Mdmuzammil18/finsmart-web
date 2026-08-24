import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateUUID } from '../utils/auth';

const router = Router();

router.use(authenticate);

// Get transactions (with optional date/type filtering)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, type, category } = req.query;
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params: any[] = [req.userId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    const db = await getDb();
    const records = await db.all(query, params);

    // Map DB snake_case to frontend camelCase if necessary, but here the frontend uses id, title, amount, category, date, type
    const transactions = records.map(r => ({
      id: r.id,
      title: r.title,
      amount: r.amount,
      category: r.category,
      date: r.date,
      type: r.type,
      groupId: r.group_id,
      paidByUserId: r.paid_by_user_id,
      splitMethod: r.split_method
    }));

    return res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a transaction
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, category, date, type, groupId, paidByUserId, splitMethod, splits } = req.body;

    if (!title || amount === undefined || !category || !date || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = generateUUID();
    const db = await getDb();

    await db.run('BEGIN TRANSACTION');

    await db.run(
      'INSERT INTO transactions (id, user_id, title, amount, category, date, type, group_id, paid_by_user_id, split_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.userId, title, amount, category, date, type, groupId || null, paidByUserId || null, splitMethod || null]
    );

    if (splits && Array.isArray(splits)) {
      for (const split of splits) {
        const splitId = generateUUID();
        await db.run(
          'INSERT INTO transaction_splits (id, transaction_id, user_id, amount) VALUES (?, ?, ?, ?)',
          [splitId, id, split.userId, split.amount]
        );
      }
    }

    await db.run('COMMIT');

    const transaction = { id, title, amount, category, date, type, groupId, paidByUserId, splitMethod };
    return res.status(201).json({ transaction });
  } catch (error) {
    console.error('Post transaction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a transaction
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, type, groupId, paidByUserId, splitMethod, splits } = req.body;

    const db = await getDb();
    
    // Check ownership
    const existing = await db.get('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await db.run('BEGIN TRANSACTION');

    await db.run(
      'UPDATE transactions SET title = ?, amount = ?, category = ?, date = ?, type = ?, group_id = ?, paid_by_user_id = ?, split_method = ? WHERE id = ? AND user_id = ?',
      [title, amount, category, date, type, groupId || null, paidByUserId || null, splitMethod || null, id, req.userId]
    );

    // Recreate splits
    if (splits && Array.isArray(splits)) {
      await db.run('DELETE FROM transaction_splits WHERE transaction_id = ?', [id]);
      for (const split of splits) {
        const splitId = generateUUID();
        await db.run(
          'INSERT INTO transaction_splits (id, transaction_id, user_id, amount) VALUES (?, ?, ?, ?)',
          [splitId, id, split.userId, split.amount]
        );
      }
    }

    await db.run('COMMIT');

    const transaction = { id, title, amount, category, date, type, groupId, paidByUserId, splitMethod };
    return res.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a transaction
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Check ownership
    const existing = await db.get('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, req.userId]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
