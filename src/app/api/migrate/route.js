import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  try {
    await sql`ALTER TABLE todo_actions ADD COLUMN IF NOT EXISTS action_type VARCHAR(50) DEFAULT 'General'`;
    
    // Create calendar events if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS calendar_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        owner VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add new columns for enhanced events
    await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS event_time VARCHAR(50)`;
    await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS location VARCHAR(255)`;
    await sql`ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS resources TEXT`;
    await sql`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        owner VARCHAR(100) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return NextResponse.json({ success: true, message: 'Migrations run successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
