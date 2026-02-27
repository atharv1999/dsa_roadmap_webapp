const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dsa_roadmap.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subtopics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subtopic_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    leetcode_url TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Easy',
    is_done INTEGER DEFAULT 0,
    is_bookmarked INTEGER DEFAULT 0,
    code_solution TEXT DEFAULT '',
    code_language TEXT DEFAULT 'cpp',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE
  );
`);

// Migration: add code_language column if it doesn't exist
try {
  db.prepare("SELECT code_language FROM problems LIMIT 1").get();
} catch (e) {
  db.exec("ALTER TABLE problems ADD COLUMN code_language TEXT DEFAULT 'cpp'");
  console.log('Migrated: added code_language column to problems table');
}

module.exports = db;
