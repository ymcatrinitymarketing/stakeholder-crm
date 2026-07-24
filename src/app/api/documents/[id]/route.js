import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getDb } from '@/lib/db';

export async function DELETE(request, context) {
  const { id } = await context.params;
  const sql = getDb();

  try {
    // Get the document URL to delete from Blob
    const doc = await sql`SELECT url FROM documents WHERE id = ${id}`;
    if (doc.length > 0) {
      await del(doc[0].url);
    }
    
    // Delete from DB
    await sql`DELETE FROM documents WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to delete document' }, { status: 500 });
  }
}
