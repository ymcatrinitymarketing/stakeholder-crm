import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: 'C:\\Users\\Ian.birch\\.gemini\\antigravity\\scratch\\ymca-crm\\.env'});

async function main() {
  const sql = neon(process.env.POSTGRES_URL);
  
  // Try adding county column to stakeholders table
  try {
    await sql`ALTER TABLE stakeholders ADD COLUMN county TEXT`;
    console.log('county column added');
  } catch (e) {
    console.log('county column might already exist or error: ', e.message);
  }
}
main();
