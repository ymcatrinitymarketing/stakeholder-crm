import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

async function ensurePledgesTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS pledges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      pledge_type VARCHAR(50) DEFAULT 'Action',
      amount NUMERIC(10, 2),
      pledge_date DATE NOT NULL,
      pledge_description TEXT NOT NULL,
      target_completion_date DATE,
      status VARCHAR(50) DEFAULT 'In Progress',
      completed_date DATE,
      marketing_consent BOOLEAN DEFAULT false,
      thank_you_sent BOOLEAN DEFAULT false,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export async function GET() {
  const sql = getDb();
  try {
    await ensurePledgesTable(sql);
    const pledges = await sql`
      SELECT * FROM pledges
      ORDER BY 
        CASE WHEN status = 'Completed' THEN 1 ELSE 0 END ASC,
        target_completion_date ASC NULLS LAST,
        pledge_date DESC,
        id DESC
    `;
    return NextResponse.json(pledges);
  } catch (err) {
    console.error('Error fetching pledges:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const sql = getDb();
  try {
    await ensurePledgesTable(sql);
    const body = await request.json();

    const parsedAmount =
      body.amount !== undefined && body.amount !== null && body.amount !== ''
        ? parseFloat(body.amount)
        : null;

    const result = await sql`
      INSERT INTO pledges (
        name,
        pledge_type,
        amount,
        pledge_date,
        pledge_description,
        target_completion_date,
        status,
        completed_date,
        marketing_consent,
        thank_you_sent,
        notes
      )
      VALUES (
        ${body.name},
        ${body.pledge_type || 'Action'},
        ${parsedAmount},
        ${body.pledge_date},
        ${body.pledge_description},
        ${body.target_completion_date || null},
        ${body.status || 'In Progress'},
        ${body.status === 'Completed' ? new Date().toISOString().split('T')[0] : null},
        ${Boolean(body.marketing_consent)},
        ${Boolean(body.thank_you_sent)},
        ${body.notes || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, pledge: result[0] }, { status: 201 });
  } catch (err) {
    console.error('Error creating pledge:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
