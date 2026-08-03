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

export async function GET(request) {
  const sql = getDb();
  
  // Extract action type from query string, defaulting to 'General'
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'General';
  
  // Fetch general actions (where stakeholder_id is NULL) filtered by action_type
  const actions = await sql`
    SELECT * FROM todo_actions 
    WHERE stakeholder_id IS NULL AND action_type = ${type}
    ORDER BY id DESC
  `;
  
  return NextResponse.json(actions);
}

export async function POST(request) {
  const body = await request.json();
  const sql = getDb();
  
  // Determine action_type
  const actionType = body.action_type || 'General';

  // Insert the new general action
  const result = await sql`
    INSERT INTO todo_actions (stakeholder_id, action_type, date_created, action_description, owner, outcome, date_completed, due_date)
    VALUES (NULL, ${actionType}, ${body.date_created}, ${body.action_description}, ${body.owner}, ${body.outcome || null}, ${body.date_completed || null}, ${body.due_date || null})
    RETURNING id
  `;

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
            subject: `New General Action Assigned`,
            html: `
              <h3>You have a new general action assigned to you in the CRM</h3>
              <p><strong>Action:</strong> ${body.action_description}</p>
              <p><strong>Date Logged:</strong> ${body.date_created}</p>
              <p><strong>Due Date:</strong> ${body.due_date ? body.due_date : 'No deadline set'}</p>
              <br/>
              <p>Please log in to the CRM to update the outcome once completed: <a href="https://ymca-crm.vercel.app/actions">https://ymca-crm.vercel.app/actions</a></p>
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
