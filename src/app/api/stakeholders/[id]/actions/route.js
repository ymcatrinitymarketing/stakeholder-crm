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
    INSERT INTO todo_actions (stakeholder_id, date_created, action_description, owner, outcome, date_completed, due_date)
    VALUES (${id}, ${body.date_created}, ${body.action_description}, ${body.owner}, ${body.outcome || null}, ${body.date_completed || null}, ${body.due_date || null})
    RETURNING id
  `;

  // Fetch stakeholder name for the email
  const stakeholderResult = await sql`SELECT name FROM stakeholders WHERE id = ${id}`;
  const stakeholderName = stakeholderResult[0]?.name || 'a stakeholder';

  // Send Email Notification
  if (body.owner) {
    const owners = body.owner.split(',').map(o => o.trim());
    const emailsTo = owners.map(o => ownerEmails[o]).filter(e => e);

    if (emailsTo.length > 0) {
      try {
        if (process.env.RESEND_API_KEY) {
          await resend.emails.send({
            from: 'Stakeholder Notifications <stakeholdernotifications@ymcatrinity.org.uk>',
            to: emailsTo,
            subject: `New Action Assigned: ${stakeholderName}`,
            html: `
              <h3>You have a new action assigned to you in the CRM</h3>
              <p><strong>Stakeholder:</strong> ${stakeholderName}</p>
              <p><strong>Action:</strong> ${body.action_description}</p>
              <p><strong>Date Logged:</strong> ${body.date_created}</p>
              <p><strong>Due Date:</strong> ${body.due_date ? body.due_date : 'No deadline set'}</p>
              <br/>
              <p>Please log in to the CRM to update the outcome once completed: <a href="https://ymca-crm.vercel.app/">https://ymca-crm.vercel.app</a></p>
            `
          });
          console.log(`Email sent to ${emailsTo.join(', ')}`);
        } else {
          console.log(`RESEND_API_KEY not set. Would have sent email to ${emailsTo.join(', ')}`);
        }
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  }
  
  return NextResponse.json({ success: true, id: result[0].id });
}
