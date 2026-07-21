import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const sql = getDb();
  
  const updates = await sql`
    SELECT * FROM action_updates 
    WHERE action_id = ${id} 
    ORDER BY date_created ASC
  `;
  
  return NextResponse.json(updates);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const sql = getDb();
  
  const result = await sql`
    INSERT INTO action_updates (action_id, update_text)
    VALUES (${id}, ${body.update_text})
    RETURNING *
  `;
  
  return NextResponse.json(result[0]);
}
