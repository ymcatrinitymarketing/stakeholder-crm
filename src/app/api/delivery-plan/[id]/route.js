import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  const sql = getDb();
  const { id } = await params;
  try {
    const body = await request.json();
    
    const existing = await sql`SELECT * FROM delivery_plan_tasks WHERE id = ${id}`;
    if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const current = existing[0];
    const updated = {
      phase: body.phase !== undefined ? body.phase : current.phase,
      workstream: body.workstream !== undefined ? body.workstream : current.workstream,
      activity: body.activity !== undefined ? body.activity : current.activity,
      type: body.type !== undefined ? body.type : current.type,
      lead: body.lead !== undefined ? body.lead : current.lead,
      start_date: body.start_date !== undefined ? body.start_date : current.start_date,
      end_date: body.end_date !== undefined ? body.end_date : current.end_date,
      status: body.status !== undefined ? body.status : current.status,
      notes: body.notes !== undefined ? body.notes : current.notes,
    };

    const result = await sql`
      UPDATE delivery_plan_tasks 
      SET 
        phase = ${updated.phase},
        workstream = ${updated.workstream},
        activity = ${updated.activity},
        type = ${updated.type},
        lead = ${updated.lead},
        start_date = ${updated.start_date || null},
        end_date = ${updated.end_date || null},
        status = ${updated.status},
        notes = ${updated.notes}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json({ success: true, task: result[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const sql = getDb();
  const { id } = await params;
  try {
    await sql`DELETE FROM delivery_plan_tasks WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
