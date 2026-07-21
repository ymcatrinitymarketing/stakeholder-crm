import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

const ownerEmails = {
  Jonathan: 'jonathan.martin@ymcatrinity.org.uk',
  Amanda: 'amanda.butterworth@ymcatrinity.org.uk',
  Ian: 'ian.birch@ymcatrinity.org.uk',
  Ryan: 'ryan@athene-communications.co.uk'
};

export async function GET(request, { params }) {
  const { id } = await params;
  const sql = getDb();
  
  const actions = await sql`
    SELECT * FROM todo_actions 
    WHERE stakeholder_id = ${id} 
    ORDER BY id DESC
  `;
  
  return NextResponse.json(actions);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const sql = getDb();
  
  // Insert the new action
  const result = await sql`
    INSERT INTO todo_actions (stakeholder_id, date_created, action_description, owner, outcome, date_completed)
    VALUES (${id}, ${body.date_created}, ${body.action_description}, ${body.owner}, ${body.outcome || null}, ${body.date_completed || null})
    RETURNING id
  `;

  // Fetch stakeholder name for the email
  const stakeholderResult = await sql`SELECT name FROM stakeholders WHERE id = ${id}`;
  const stakeholderName = stakeholderResult[0]?.name || 'a stakeholder';

  // Send Email Notification
  if (body.owner && ownerEmails[body.owner]) {
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'YMCA CRM <stakeholdernotifications@ymcatrinity.org.uk>',
          to: ownerEmails[body.owner],
          subject: `New Action Assigned: ${stakeholderName}`,
          html: `
            <h3>You have a new action assigned to you in the CRM</h3>
            <p><strong>Stakeholder:</strong> ${stakeholderName}</p>
            <p><strong>Action:</strong> ${body.action_description}</p>
            <p><strong>Date Logged:</strong> ${body.date_created}</p>
            <br/>
            <p>Please log in to the CRM to update the outcome once completed.</p>
          `
        });
        console.log(`Email sent to ${body.owner}`);
      } else {
        console.log(`RESEND_API_KEY not set. Would have sent email to ${body.owner} (${ownerEmails[body.owner]})`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  
  return NextResponse.json({ success: true, id: result[0].id });
}
