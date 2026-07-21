import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS action_updates (
        id SERIAL PRIMARY KEY,
        action_id INTEGER REFERENCES todo_actions(id) ON DELETE CASCADE,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_text TEXT NOT NULL
      )
    `;
    return NextResponse.json({ success: true, message: 'Table created' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
