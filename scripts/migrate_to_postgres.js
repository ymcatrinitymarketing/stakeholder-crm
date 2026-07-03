const Database = require('better-sqlite3');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });
const path = require('path');

async function migrate() {
  console.log('Starting migration to Neon Postgres...');
  
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not set in .env');
  }

  const sql = neon(process.env.POSTGRES_URL);
  const dbPath = path.join(__dirname, '..', 'db', 'data.db');
  const sqlite = new Database(dbPath, { readonly: true });

  console.log('Creating Postgres tables...');
  await sql`
    CREATE TABLE IF NOT EXISTS stakeholders (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      organisation TEXT,
      name TEXT NOT NULL,
      role TEXT,
      contact_details TEXT,
      focus_areas TEXT,
      tier INTEGER NOT NULL,
      main_contact TEXT,
      owned_by TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS interactions (
      id SERIAL PRIMARY KEY,
      stakeholder_id INTEGER NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      outcome TEXT,
      next_contact TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log('Reading from SQLite...');
  const stakeholders = sqlite.prepare('SELECT * FROM stakeholders').all();
  const interactions = sqlite.prepare('SELECT * FROM interactions').all();

  console.log(`Found ${stakeholders.length} stakeholders and ${interactions.length} interactions.`);

  // Clear existing to avoid duplicates if run multiple times
  await sql`DELETE FROM interactions`;
  await sql`DELETE FROM stakeholders`;

  // Reset sequences
  await sql`ALTER SEQUENCE stakeholders_id_seq RESTART WITH 1`;
  await sql`ALTER SEQUENCE interactions_id_seq RESTART WITH 1`;

  console.log('Inserting stakeholders into Postgres...');
  for (const s of stakeholders) {
    await sql`
      INSERT INTO stakeholders (id, category, organisation, name, role, contact_details, focus_areas, tier, main_contact, owned_by)
      VALUES (${s.id}, ${s.category}, ${s.organisation}, ${s.name}, ${s.role}, ${s.contact_details}, ${s.focus_areas}, ${s.tier}, ${s.main_contact}, ${s.owned_by})
    `;
  }
  // Ensure the sequence is updated past the max ID we just inserted explicitly
  await sql`SELECT setval('stakeholders_id_seq', (SELECT MAX(id) FROM stakeholders))`;

  console.log('Inserting interactions into Postgres...');
  for (const i of interactions) {
    await sql`
      INSERT INTO interactions (id, stakeholder_id, date, type, outcome, next_contact, created_at)
      VALUES (${i.id}, ${i.stakeholder_id}, ${i.date}, ${i.type}, ${i.outcome}, ${i.next_contact}, ${i.created_at})
    `;
  }
  if (interactions.length > 0) {
    await sql`SELECT setval('interactions_id_seq', (SELECT MAX(id) FROM interactions))`;
  }

  console.log('Migration complete!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
