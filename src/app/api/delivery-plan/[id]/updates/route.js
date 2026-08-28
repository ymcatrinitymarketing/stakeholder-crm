import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
  const sql = getDb();
  try {
    const updates = await sql`
      SELECT * FROM delivery_plan_updates 
      WHERE task_id = ${params.id} 
      ORDER BY date_added ASC
    `;
    return NextResponse.json(updates);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const sql = getDb();
  try {
    const body = await request.json();
    const result = await sql`
      INSERT INTO delivery_plan_updates (task_id, update_text)
      VALUES (${params.id}, ${body.update_text})
      RETURNING *
    `;
    return NextResponse.json(result[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
