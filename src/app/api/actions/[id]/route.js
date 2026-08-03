import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const sql = getDb();
  
  const updates = [];
  if (body.outcome !== undefined) updates.push(sql`outcome = ${body.outcome}`);
  if (body.date_completed !== undefined) updates.push(sql`date_completed = ${body.date_completed}`);
  if (body.action_description !== undefined) updates.push(sql`action_description = ${body.action_description}`);
  if (body.due_date !== undefined) updates.push(sql`due_date = ${body.due_date}`);
  if (body.owner !== undefined) updates.push(sql`owner = ${body.owner}`);

  if (updates.length > 0) {
    const setClause = updates.reduce((acc, current, idx) => {
      if (idx === 0) return current;
      return sql`${acc}, ${current}`;
    });

    await sql`
      UPDATE todo_actions 
      SET ${setClause}
      WHERE id = ${id}
    `;
  }
  
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const sql = getDb();
  
  await sql`DELETE FROM todo_actions WHERE id = ${id}`;
  
  return NextResponse.json({ success: true });
}
