const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });

async function createTable() {
  console.log('Connecting to Postgres...');
  
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not set in .env');
  }

  const sql = neon(process.env.POSTGRES_URL);

  console.log('Creating todo_actions table...');
  await sql`
    CREATE TABLE IF NOT EXISTS todo_actions (
      id SERIAL PRIMARY KEY,
      stakeholder_id INTEGER NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
      date_created TEXT NOT NULL,
      action_description TEXT NOT NULL,
      outcome TEXT,
      owner TEXT NOT NULL,
      date_completed TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log('Table created successfully!');
}

createTable().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
