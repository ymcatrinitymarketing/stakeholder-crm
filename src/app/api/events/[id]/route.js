import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, context) {
  const { id } = await context.params;
  const body = await request.json();
  const sql = getDb();

  try {
    const updates = [];
    if (body.title !== undefined) updates.push(sql`title = ${body.title}`);
    if (body.description !== undefined) updates.push(sql`description = ${body.description}`);
    if (body.event_date !== undefined) updates.push(sql`event_date = ${body.event_date}`);
    if (body.event_time !== undefined) updates.push(sql`event_time = ${body.event_time}`);
    if (body.location !== undefined) updates.push(sql`location = ${body.location}`);
    if (body.resources !== undefined) updates.push(sql`resources = ${body.resources}`);
    if (body.owner !== undefined) updates.push(sql`owner = ${body.owner}`);

    if (updates.length > 0) {
      const setClause = updates.reduce((acc, current, idx) => {
        if (idx === 0) return current;
        return sql`${acc}, ${current}`;
      });

      await sql`
        UPDATE calendar_events 
        SET ${setClause}
        WHERE id = ${id}
      `;
    }
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
