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

export async function GET() {
  const sql = getDb();
  
  // Fetch general actions (where stakeholder_id is NULL)
  const actions = await sql`
    SELECT * FROM todo_actions 
    WHERE stakeholder_id IS NULL 
    ORDER BY id DESC
  `;
  
  return NextResponse.json(actions);
}

export async function POST(request) {
  const body = await request.json();
  const sql = getDb();
  
  // Insert the new general action
  const result = await sql`
    INSERT INTO todo_actions (stakeholder_id, date_created, action_description, owner, outcome, date_completed, due_date)
    VALUES (NULL, ${body.date_created}, ${body.action_description}, ${body.owner}, ${body.outcome || null}, ${body.date_completed || null}, ${body.due_date || null})
    RETURNING id
  `;

  // Send Email Notification
  if (body.owner && ownerEmails[body.owner]) {
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'Stakeholder Notifications <stakeholdernotifications@ymcatrinity.org.uk>',
          to: ownerEmails[body.owner],
          subject: `New General Action Assigned`,
          html: `
            <h3>You have a new general action assigned to you in the CRM</h3>
            <p><strong>Action:</strong> ${body.action_description}</p>
            <p><strong>Date Logged:</strong> ${body.date_created}</p>
            <p><strong>Due Date:</strong> ${body.due_date ? body.due_date : 'No deadline set'}</p>
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
