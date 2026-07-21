import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const sql = getDb();
  
  await sql`
    UPDATE todo_actions 
    SET outcome = ${body.outcome}, 
        date_completed = ${body.date_completed}
    WHERE id = ${id}
  `;
  
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const sql = getDb();
  
  await sql`DELETE FROM todo_actions WHERE id = ${id}`;
  
  return NextResponse.json({ success: true });
}
