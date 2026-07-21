import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  try {
    await sql`ALTER TABLE todo_actions ADD COLUMN IF NOT EXISTS action_type VARCHAR(50) DEFAULT 'General'`;
    return NextResponse.json({ success: true, message: 'Column action_type added' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
