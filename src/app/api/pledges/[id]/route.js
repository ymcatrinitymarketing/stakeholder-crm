import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, context) {
  const { id } = await context.params;
  const body = await request.json();
  const sql = getDb();

  try {
    const updates = [];
    if (body.name !== undefined) updates.push(sql`name = ${body.name}`);
    if (body.pledge_type !== undefined) updates.push(sql`pledge_type = ${body.pledge_type}`);
    if (body.amount !== undefined) {
      const parsedAmount =
        body.amount !== null && body.amount !== '' ? parseFloat(body.amount) : null;
      updates.push(sql`amount = ${parsedAmount}`);
    }
    if (body.pledge_date !== undefined) updates.push(sql`pledge_date = ${body.pledge_date}`);
    if (body.pledge_description !== undefined)
      updates.push(sql`pledge_description = ${body.pledge_description}`);
    if (body.target_completion_date !== undefined)
      updates.push(sql`target_completion_date = ${body.target_completion_date || null}`);
    if (body.status !== undefined) updates.push(sql`status = ${body.status}`);
    if (body.completed_date !== undefined)
      updates.push(sql`completed_date = ${body.completed_date || null}`);
    if (body.marketing_consent !== undefined)
      updates.push(sql`marketing_consent = ${Boolean(body.marketing_consent)}`);
    if (body.thank_you_sent !== undefined)
      updates.push(sql`thank_you_sent = ${Boolean(body.thank_you_sent)}`);
    if (body.notes !== undefined) updates.push(sql`notes = ${body.notes || null}`);

    if (updates.length > 0) {
      const setClause = updates.reduce((acc, current, idx) => {
        if (idx === 0) return current;
        return sql`${acc}, ${current}`;
      });

      await sql`
        UPDATE pledges
        SET ${setClause}
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating pledge:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  const sql = getDb();

  try {
    await sql`DELETE FROM pledges WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting pledge:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
