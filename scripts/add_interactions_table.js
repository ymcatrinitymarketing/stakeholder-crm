const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'data.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stakeholder_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    outcome TEXT,
    next_contact TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stakeholder_id) REFERENCES stakeholders (id) ON DELETE CASCADE
  );
`);

console.log('Interactions table created.');
