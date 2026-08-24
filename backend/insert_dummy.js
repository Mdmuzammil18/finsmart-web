const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

const transactions = [
  { title: 'Weekly Groceries', amount: 2500, category: 'other', date: '2026-06-23', type: 'expense' },
  { title: 'Movie Tickets', amount: 800, category: 'entertainment', date: '2026-06-24', type: 'expense' },
  { title: 'Uber to Office', amount: 350, category: 'transport', date: '2026-06-25', type: 'expense' },
  { title: 'Dinner with Friends', amount: 1200, category: 'food', date: '2026-06-25', type: 'expense' },
  { title: 'Netflix Subscription', amount: 199, category: 'entertainment', date: '2026-06-22', type: 'expense' },
  { title: 'Electricity Bill', amount: 1500, category: 'utilities', date: '2026-06-20', type: 'expense' },
  { title: 'Pharmacy', amount: 450, category: 'health', date: '2026-06-19', type: 'expense' },
  { title: 'New Shoes', amount: 3500, category: 'shopping', date: '2026-06-18', type: 'expense' }
];

const uid = 'c29bc3a3-3225-4991-937a-141d48807ab0';

const stmt = db.prepare('INSERT INTO transactions (id, user_id, title, amount, category, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)');

transactions.forEach(t => {
  const id = crypto.randomUUID();
  stmt.run([id, uid, t.title, t.amount, t.category, t.date, t.type]);
});

stmt.finalize(() => {
  console.log('Dummy data inserted successfully!');
  db.close();
});
