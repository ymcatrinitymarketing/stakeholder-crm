import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getDb } from '@/lib/db';

export async function GET() {
  const sql = getDb();
  try {
    const documents = await sql`
      SELECT * FROM documents 
      ORDER BY uploaded_at DESC
    `;
    return NextResponse.json(documents);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const owner = formData.get('owner');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    
    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Save metadata to DB
    const sql = getDb();
    const result = await sql`
      INSERT INTO documents (filename, url, owner)
      VALUES (${filename}, ${blob.url}, ${owner})
      RETURNING id
    `;
    
    return NextResponse.json({ success: true, id: result[0].id, url: blob.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to upload document' }, { status: 500 });
  }
}
