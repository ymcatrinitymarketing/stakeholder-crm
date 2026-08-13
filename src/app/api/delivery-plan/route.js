import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  const sql = getDb();
  try {
    const tasks = await sql`
      SELECT * FROM delivery_plan_tasks ORDER BY start_date ASC, id ASC
    `;
    return NextResponse.json(tasks);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const sql = getDb();
  try {
    const body = await request.json();
    const result = await sql`
      INSERT INTO delivery_plan_tasks (phase, workstream, activity, type, lead, start_date, end_date, status, notes)
      VALUES (${body.phase}, ${body.workstream}, ${body.activity}, ${body.type}, ${body.lead}, ${body.start_date || null}, ${body.end_date || null}, ${body.status || 'Not Started'}, ${body.notes})
      RETURNING *
    `;
    return NextResponse.json({ success: true, task: result[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
