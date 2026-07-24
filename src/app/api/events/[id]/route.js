import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, context) {
  const { id } = await context.params;
  const body = await request.json();
  const sql = getDb();

  try {
    await sql`
      UPDATE calendar_events 
      SET 
        title = ${body.title},
        description = ${body.description},
        event_date = ${body.event_date},
        owner = ${body.owner}
      WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  const sql = getDb();

  try {
    await sql`DELETE FROM calendar_events WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}
