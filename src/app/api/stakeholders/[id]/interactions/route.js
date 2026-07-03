import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request, { params }) {
  const { id } = await params;
  const sql = getDb();
  
  const interactions = await sql`
    SELECT * FROM interactions 
    WHERE stakeholder_id = ${id} 
    ORDER BY date DESC, id DESC
  `;
  
  return NextResponse.json(interactions);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const sql = getDb();
  
  const result = await sql`
    INSERT INTO interactions (stakeholder_id, date, type, outcome, next_contact)
    VALUES (${id}, ${body.date}, ${body.type}, ${body.outcome || null}, ${body.next_contact || null})
    RETURNING id
  `;

  return NextResponse.json({ id: result[0].id }, { status: 201 });
}
