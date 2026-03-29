import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "oursociete.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      username TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'fan',
      avatar TEXT,
      cover_photo TEXT,
      bio TEXT DEFAULT '',
      location TEXT DEFAULT '',
      categories TEXT DEFAULT '',
      subscription_price REAL DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER NOT NULL,
      title TEXT DEFAULT '',
      caption TEXT DEFAULT '',
      media_type TEXT DEFAULT 'image',
      media_url TEXT NOT NULL,
      is_premium INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fan_id INTEGER NOT NULL,
      creator_id INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (fan_id) REFERENCES users(id),
      FOREIGN KEY (creator_id) REFERENCES users(id),
      UNIQUE(fan_id, creator_id)
    );

    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending',
      decision TEXT DEFAULT '',
      veriff_url TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export default getDb;
