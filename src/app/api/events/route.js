import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  try {
    const events = await sql`
      SELECT * FROM calendar_events 
      ORDER BY event_date ASC
    `;
    return NextResponse.json(events);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  const sql = getDb();
  try {
    const result = await sql`
      INSERT INTO calendar_events (title, description, event_date, owner)
      VALUES (${body.title}, ${body.description || null}, ${body.event_date}, ${body.owner || 'Unassigned'})
      RETURNING id
    `;
    return NextResponse.json({ success: true, id: result[0].id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
  }
}
