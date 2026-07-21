const { getDb } = require('../src/lib/db');

async function createActionUpdatesTable() {
  const sql = getDb();
  
  try {
    console.log('Creating action_updates table...');
    await sql`
      CREATE TABLE IF NOT EXISTS action_updates (
        id SERIAL PRIMARY KEY,
        action_id INTEGER REFERENCES todo_actions(id) ON DELETE CASCADE,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_text TEXT NOT NULL
      )
    `;
    console.log('Successfully created action_updates table.');
  } catch (err) {
    console.error('Error creating action_updates table:', err);
  } finally {
    process.exit(0);
  }
}

createActionUpdatesTable();
