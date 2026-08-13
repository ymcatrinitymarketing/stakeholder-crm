require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');
const xlsx = require('xlsx');

function excelDateToJSDate(serial) {
  if (!serial) return null;
  const jsDate = new Date(Math.round((serial - 25569) * 86400 * 1000));
  return jsDate.toISOString().split('T')[0];
}

async function migrate() {
  if (!process.env.POSTGRES_URL) {
    console.error('Missing POSTGRES_URL');
    process.exit(1);
  }
  const url = process.env.POSTGRES_URL.replace(/^"|"$/g, '');
  const sql = neon(url);

  console.log('Reading Excel file...');
  const workbook = xlsx.readFile('C:\\Users\\Ian.birch\\OneDrive - YMCA Trinity Group\\Desktop\\YMCA 175th Anniversary - Delivery Plan Calendar v1.xlsx');
  
  const sheet = workbook.Sheets['Gantt Delivery Plan'];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Rows start at index 7 for the data
  const dataRows = rows.slice(7).filter(r => r[1] || r[3]); // Must have Phase or Activity

  console.log(`Found ${dataRows.length} tasks to migrate.`);

  let migrated = 0;
  for (const row of dataRows) {
    const phase = row[1] || null;
    const workstream = row[2] || null;
    const activity = row[3] || null;
    const type = row[4] || null;
    const lead = row[5] || null;
    const startDate = excelDateToJSDate(row[6]);
    const endDate = excelDateToJSDate(row[7]);
    const notes = row[8] || null;

    if (!activity) continue;

    try {
      await sql`
        INSERT INTO delivery_plan_tasks (phase, workstream, activity, type, lead, start_date, end_date, status, notes)
        VALUES (${phase}, ${workstream}, ${activity}, ${type}, ${lead}, ${startDate}, ${endDate}, 'Not Started', ${notes})
      `;
      migrated++;
    } catch (e) {
      console.error('Error inserting:', activity, e.message);
    }
  }

  console.log(`Successfully migrated ${migrated} tasks.`);
}

migrate();
