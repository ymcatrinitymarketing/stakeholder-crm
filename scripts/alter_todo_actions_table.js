const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });

async function alterTable() {
  console.log('Connecting to Postgres...');
  
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not set in .env');
  }

  const sql = neon(process.env.POSTGRES_URL);

  console.log('Altering todo_actions table...');
  await sql`
    ALTER TABLE todo_actions ALTER COLUMN stakeholder_id DROP NOT NULL;
  `;

  console.log('Table altered successfully!');
}

alterTable().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
