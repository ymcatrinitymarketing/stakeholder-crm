require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

async function createTable() {
  if (!process.env.POSTGRES_URL) {
    console.error('Missing POSTGRES_URL');
    process.exit(1);
  }
  const url = process.env.POSTGRES_URL.replace(/^"|"$/g, '');
  const sql = neon(url);

  console.log('Creating table delivery_plan_tasks...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS delivery_plan_tasks (
        id SERIAL PRIMARY KEY,
        phase VARCHAR(255),
        workstream VARCHAR(255),
        activity TEXT,
        type VARCHAR(50),
        lead VARCHAR(255),
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'Not Started',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Table created successfully!');
  } catch (err) {
    console.error('Error creating table:', err);
  }
}

createTable();
