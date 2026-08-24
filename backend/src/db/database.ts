import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(__dirname, '../../data.db');

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await dbInstance.exec('PRAGMA foreign_keys = ON;');

  // Initialize Schema
  await initializeSchema(dbInstance);

  return dbInstance;
}

async function initializeSchema(db: Database<sqlite3.Database, sqlite3.Statement>) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      phone_number TEXT,
      is_ghost BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      group_id TEXT,
      paid_by_user_id TEXT,
      split_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transaction_splits (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS income_categories (
      id TEXT PRIMARY KEY,
      user_id TEXT, -- null for system defaults
      name TEXT NOT NULL,
      is_default BOOLEAN DEFAULT 0,
      icon TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      default_split_method TEXT DEFAULT 'EQUAL',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_default_splits (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      split_value REAL NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
    CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_transaction_splits_transaction ON transaction_splits(transaction_id);

    CREATE TABLE IF NOT EXISTS income_sources (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category_id TEXT,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      start_date TEXT NOT NULL,
      end_date TEXT,
      frequency TEXT DEFAULT 'Onetime',
      is_active BOOLEAN DEFAULT 1,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES income_categories (id) ON DELETE SET NULL
    );
  `);

  try {
    await db.exec(`ALTER TABLE income_sources ADD COLUMN frequency TEXT DEFAULT 'Onetime'`);
  } catch (err) {
    // Column might already exist, safe to ignore
  }

  try {
    await db.exec(`ALTER TABLE users ADD COLUMN phone_number TEXT`);
  } catch (err) {}

  try {
    await db.exec(`ALTER TABLE users ADD COLUMN is_ghost BOOLEAN DEFAULT 0`);
  } catch (err) {}

  // Migrate Income Sources new fields
  const incomeCols = [
    { name: 'category', def: "TEXT DEFAULT 'other'" },
    { name: 'currency', def: "TEXT DEFAULT 'INR'" },
    { name: 'is_active', def: "BOOLEAN DEFAULT 1" },
    { name: 'notes', def: "TEXT" },
    { name: 'updated_at', def: "DATETIME" },
  ];

  for (const col of incomeCols) {
    try {
      await db.exec(`ALTER TABLE income_sources ADD COLUMN ${col.name} ${col.def}`);
    } catch (err) {}
  }

  // Migration: Add default_split_method to groups
  try {
    await db.exec(`ALTER TABLE groups ADD COLUMN default_split_method TEXT DEFAULT 'EQUAL'`);
  } catch (err) {}

  // --- Category Relational Migration ---
  try {
    // 1. Rename date to start_date if it hasn't been done
    await db.exec(`ALTER TABLE income_sources RENAME COLUMN date TO start_date`);
  } catch (err) {}

  try {
    // 2. Add end_date if it doesn't exist
    await db.exec(`ALTER TABLE income_sources ADD COLUMN end_date TEXT`);
  } catch (err) {}

  try {
    // 3. Add category_id if it doesn't exist
    await db.exec(`ALTER TABLE income_sources ADD COLUMN category_id TEXT REFERENCES income_categories(id)`);
  } catch (err) {}

  // 4. Seed system categories
  const systemCategories = [
    { name: 'salary', icon: 'cash-outline', color: '#10B981' },
    { name: 'freelance', icon: 'laptop-outline', color: '#3B82F6' },
    { name: 'business', icon: 'briefcase-outline', color: '#6366F1' },
    { name: 'investment', icon: 'trending-up-outline', color: '#F59E0B' },
    { name: 'rental', icon: 'home-outline', color: '#EC4899' },
    { name: 'other', icon: 'wallet-outline', color: '#6B7280' },
  ];

  for (const cat of systemCategories) {
    const existing = await db.get('SELECT id FROM income_categories WHERE name = ? AND is_default = 1', cat.name);
    if (!existing) {
      const id = require('crypto').randomUUID();
      await db.run(
        'INSERT INTO income_categories (id, user_id, name, is_default, icon, color) VALUES (?, NULL, ?, 1, ?, ?)',
        [id, cat.name, cat.icon, cat.color]
      );
    }
  }

  // 5. Map old 'category' string data to new 'category_id' references
  try {
    // Only attempt mapping if the old 'category' column still exists
    await db.exec(`
      UPDATE income_sources
      SET category_id = (
        SELECT id FROM income_categories 
        WHERE LOWER(income_categories.name) = LOWER(income_sources.category) 
        AND is_default = 1
        LIMIT 1
      )
      WHERE category_id IS NULL AND category IS NOT NULL
    `);
    
    // Drop the old column to clean up the schema
    await db.exec(`ALTER TABLE income_sources DROP COLUMN category`);
  } catch (err) {
  }
  
  // 6. Add group fields to transactions
  try {
    await db.exec(`ALTER TABLE transactions ADD COLUMN group_id TEXT`);
  } catch (err) { /* ignore if exists */ }
  
  try {
    await db.exec(`ALTER TABLE transactions ADD COLUMN paid_by_user_id TEXT`);
  } catch (err) { /* ignore if exists */ }
  
  try {
    await db.exec(`ALTER TABLE transactions ADD COLUMN split_method TEXT`);
  } catch (err) { /* ignore if exists */ }
}
