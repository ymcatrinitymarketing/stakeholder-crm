import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  const stakeholders = await sql`SELECT * FROM stakeholders ORDER BY name ASC`;
  return NextResponse.json(stakeholders);
}

export async function POST(request) {
  const sql = getDb();
  const body = await request.json();
  const result = await sql`
    INSERT INTO stakeholders (category, organisation, name, role, contact_details, focus_areas, tier, main_contact, owned_by)
    VALUES (${body.category}, ${body.organisation}, ${body.name}, ${body.role}, ${body.contact_details}, ${body.focus_areas}, ${body.tier || 4}, ${body.main_contact}, ${body.owned_by || 'Unassigned'})
    RETURNING id
  `;
  return NextResponse.json({ id: result[0].id }, { status: 201 });
}
