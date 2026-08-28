import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const sql = getDb();
  
  await sql`
    UPDATE stakeholders 
    SET 
        name = ${body.name},
        organisation = ${body.organisation},
        role = ${body.role},
        category = ${body.category},
        contact_details = ${body.contact_details},
        focus_areas = ${body.focus_areas},
        tier = ${body.tier}, 
        main_contact = ${body.main_contact}, 
        owned_by = ${body.owned_by},
        county = ${body.county}
    WHERE id = ${id}
  `;
  
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const sql = getDb();
  
  await sql`DELETE FROM stakeholders WHERE id = ${id}`;
  
  return NextResponse.json({ success: true });
}
