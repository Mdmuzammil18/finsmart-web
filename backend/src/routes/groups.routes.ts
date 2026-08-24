import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateUUID } from '../utils/auth';

const router = Router();

router.use(authenticate);

// Helper: map DB member row to camelCase for frontend
function mapMember(m: any, currentUserId: string | undefined, defaultSplits: any[] = []) {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phoneNumber: m.phone_number,
    isGhost: Boolean(m.is_ghost),
    avatar: m.avatar,
    salary: m.salary,
    isCurrentUser: m.id === currentUserId,
    defaultSplitValue: defaultSplits.find((s: any) => s.user_id === m.id)?.split_value
  };
}

// Helper: map DB group row to frontend shape
function mapGroup(g: any) {
  return {
    id: g.id,
    name: g.name,
    created_by: g.created_by,
    default_split_method: g.default_split_method,
    createdAt: g.created_at,
  };
}

// List user's groups
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();
    const query = `
      SELECT g.* FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = ?
      ORDER BY g.created_at DESC
    `;
    const rawGroups = await db.all(query, [req.userId]);

    const groups = [];
    // For each group, fetch members
    for (const rawGroup of rawGroups) {
      const membersQuery = `
        SELECT u.id, u.name, u.email, u.phone_number, u.is_ghost, u.avatar_url as avatar,
               (SELECT COALESCE(SUM(amount), 0) FROM income_sources WHERE user_id = u.id AND category_id = 'salary' AND is_active = 1) as salary
        FROM users u
        JOIN group_members gm ON u.id = gm.user_id
        WHERE gm.group_id = ?
      `;
      const members = await db.all(membersQuery, [rawGroup.id]);
      
      const defaultSplits = await db.all('SELECT user_id, split_value FROM group_default_splits WHERE group_id = ?', [rawGroup.id]);
      
      groups.push({
        ...mapGroup(rawGroup),
        members: members.map(m => mapMember(m, req.userId, defaultSplits))
      });
    }

    return res.json({ groups });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new group
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, splitMethod, defaultSplits } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required' });

    const db = await getDb();
    const groupId = generateUUID();

    await db.run('BEGIN TRANSACTION');

    // Insert group
    await db.run(
      'INSERT INTO groups (id, name, created_by, default_split_method) VALUES (?, ?, ?, ?)',
      [groupId, name, req.userId, splitMethod || 'EQUAL']
    );

    // Add creator as member
    await db.run(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, req.userId]
    );

    // Save default splits if provided
    if (defaultSplits && Array.isArray(defaultSplits) && splitMethod === 'PERCENTAGE') {
      for (const split of defaultSplits) {
        const splitId = generateUUID();
        await db.run(
          'INSERT INTO group_default_splits (id, group_id, user_id, split_value) VALUES (?, ?, ?, ?)',
          [splitId, groupId, split.userId, split.splitValue]
        );
      }
    }

    await db.run('COMMIT');

    // Fetch the full inserted group to return a complete response
    const insertedGroup = await db.get('SELECT * FROM groups WHERE id = ?', [groupId]);
    const memberQuery = `
      SELECT u.id, u.name, u.email, u.phone_number, u.is_ghost, u.avatar_url as avatar
      FROM users u WHERE u.id = ?
    `;
    const members = await db.all(memberQuery, [req.userId]);

    return res.status(201).json({
      group: {
        ...mapGroup(insertedGroup),
        members: members.map(m => mapMember(m, req.userId))
      }
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add members by phone contacts
router.post('/:id/members', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Contacts array is required' });
    }

    const db = await getDb();

    // Verify user is in group
    const isMember = await db.get(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to add members to this group' });
    }

    const addedMembers = [];

    await db.run('BEGIN TRANSACTION');

    for (const contact of contacts) {
      if (!contact.phoneNumber) continue;

      // Normalize phone number (Default +91)
      let cleaned = contact.phoneNumber.replace(/\D/g, '');
      if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.substring(1);
      if (cleaned.length === 10) cleaned = '91' + cleaned;
      const normalizedPhone = '+' + cleaned;

      // Find user by phone number
      let user = await db.get('SELECT id, name, email, phone_number, avatar_url as avatar FROM users WHERE phone_number = ?', [normalizedPhone]);

      if (!user) {
        // Create Ghost User
        const ghostId = generateUUID();
        const ghostEmail = `ghost_${Date.now()}_${Math.floor(Math.random()*1000)}@expensetracker.local`;
        
        await db.run(
          'INSERT INTO users (id, name, email, password_hash, phone_number, is_ghost) VALUES (?, ?, ?, ?, ?, ?)',
          [ghostId, contact.name || 'Unknown', ghostEmail, 'ghost', normalizedPhone, 1]
        );
        
        user = {
          id: ghostId,
          name: contact.name || 'Unknown',
          email: ghostEmail,
          phone_number: normalizedPhone,
          avatar: null,
          is_ghost: 1
        };
      }

      // Check if already a member
      const alreadyMember = await db.get(
        'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
        [id, user.id]
      );

      if (!alreadyMember) {
        await db.run(
          'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
          [id, user.id]
        );
        addedMembers.push(mapMember(user, req.userId));
      }
    }

    await db.run('COMMIT');

    return res.json({ message: 'Members added successfully', members: addedMembers });
  } catch (error) {
    console.error('Error adding group members:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a member
router.delete('/:id/members/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId } = req.params;
    const db = await getDb();

    // Verify requesting user is in the group
    const isMember = await db.get(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // A user can remove themselves or anyone if they are the creator
    const group = await db.get('SELECT created_by FROM groups WHERE id = ?', [id]);
    if (group.created_by !== req.userId && req.userId !== userId) {
      return res.status(403).json({ error: 'Only the creator can remove other members' });
    }

    // Creator cannot remove themselves
    if (userId === group.created_by) {
      return res.status(400).json({ error: 'Group creator cannot be removed' });
    }

    await db.run(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing group member:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update default splits
router.put('/:id/default-splits', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { splitMethod, defaultSplits } = req.body;
    
    const db = await getDb();
    
    // Verify ownership
    const group = await db.get('SELECT * FROM groups WHERE id = ? AND created_by = ?', [id, req.userId]);
    if (!group) return res.status(403).json({ error: 'Not authorized' });

    await db.run('BEGIN TRANSACTION');

    await db.run('UPDATE groups SET default_split_method = ? WHERE id = ?', [splitMethod || 'EQUAL', id]);

    await db.run('DELETE FROM group_default_splits WHERE group_id = ?', [id]);

    if (splitMethod === 'PERCENTAGE' && defaultSplits && Array.isArray(defaultSplits)) {
      for (const split of defaultSplits) {
        const splitId = generateUUID();
        await db.run(
          'INSERT INTO group_default_splits (id, group_id, user_id, split_value) VALUES (?, ?, ?, ?)',
          [splitId, id, split.userId, split.splitValue]
        );
      }
    }

    await db.run('COMMIT');
    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating default splits:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Verify membership
    const isMember = await db.get(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized to view this group' });
    }

    // Get group
    const rawGroup = await db.get('SELECT * FROM groups WHERE id = ?', [id]);
    
    // Get members
    const membersQuery = `
      SELECT u.id, u.name, u.email, u.phone_number, u.is_ghost, u.avatar_url as avatar,
             (SELECT COALESCE(SUM(amount), 0) FROM income_sources WHERE user_id = u.id AND category_id = 'salary' AND is_active = 1) as salary
      FROM users u
      JOIN group_members gm ON u.id = gm.user_id
      WHERE gm.group_id = ?
    `;
    const members = await db.all(membersQuery, [id]);
    
    // Get default splits
    const defaultSplits = await db.all('SELECT user_id, split_value FROM group_default_splits WHERE group_id = ?', [id]);

    const group = {
      ...mapGroup(rawGroup),
      members: members.map(m => mapMember(m, req.userId, defaultSplits))
    };

    return res.json({ group });
  } catch (error) {
    console.error('Error fetching group details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get group balances
router.get('/:id/balances', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    // Verify membership
    const isMember = await db.get(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // 1. Fetch all transactions for this group
    const transactions = await db.all(
      'SELECT id, paid_by_user_id, amount FROM transactions WHERE group_id = ? AND type = "expense"',
      [id]
    );

    // 2. Fetch all splits for these transactions (parameterized to prevent SQL injection)
    let splits: any[] = [];
    if (transactions.length > 0) {
      const placeholders = transactions.map(() => '?').join(',');
      const txIdValues = transactions.map(t => t.id);
      splits = await db.all(`SELECT transaction_id, user_id, amount FROM transaction_splits WHERE transaction_id IN (${placeholders})`, txIdValues);
    }

    // 3. Calculate net balances
    const netBalances: Record<string, number> = {};

    for (const tx of transactions) {
      if (!tx.paid_by_user_id) continue;
      
      netBalances[tx.paid_by_user_id] = (netBalances[tx.paid_by_user_id] || 0) + tx.amount;

      const txSplits = splits.filter(s => s.transaction_id === tx.id);
      for (const split of txSplits) {
        netBalances[split.user_id] = (netBalances[split.user_id] || 0) - split.amount;
      }
    }

    // 4. Settle debts
    const debtors = Object.keys(netBalances).filter(k => netBalances[k] < -0.01).map(k => ({ id: k, amount: -netBalances[k] })).sort((a, b) => b.amount - a.amount);
    const creditors = Object.keys(netBalances).filter(k => netBalances[k] > 0.01).map(k => ({ id: k, amount: netBalances[k] })).sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0; 
    let j = 0; 

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(debtor.amount, creditor.amount);
      
      settlements.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(amount * 100) / 100
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return res.json({ balances: settlements });
  } catch (error) {
    console.error('Error calculating balances:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
