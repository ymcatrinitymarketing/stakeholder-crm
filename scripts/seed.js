const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'db', 'data.db');

// Ensure db directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS stakeholders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    organisation TEXT,
    name TEXT NOT NULL,
    role TEXT,
    contact_details TEXT,
    focus_areas TEXT,
    tier INTEGER NOT NULL,
    main_contact TEXT,
    owned_by TEXT
  );
`);

const stakeholders = [
  // Page 1: Suffolk County Council
  { category: "Suffolk County Council", name: "Cllr Michael Hadwen", role: "Leader of the Council", contact_details: "leader@suffolk.gov.uk 0345 606 6067", focus_areas: "Local government reorganisation; county-wide strategic priorities", tier: 4 },
  { category: "Suffolk County Council", name: "Mark Ash & Andrew Cook", role: "Joint Chief Executives", contact_details: "chiefexecutive@suffolk.gov.uk 0345 606 6067", focus_areas: "Service delivery; young people's services; homelessness; LGR transition", tier: 3 },
  { category: "Suffolk County Council", name: "Cllr Louis Busuttil", role: "Chair of the Council", contact_details: "Via council switchboard 0345 606 6067", focus_areas: "Civic & ceremonial functions", tier: 4 },
  // Suffolk District & Borough Councils
  { category: "Suffolk District & Borough Councils", name: "Cllr Neil MacDonald", role: "Leader, Ipswich Borough Council", contact_details: "leader@ipswich.gov.uk 01473 432000", focus_areas: "Housing & homelessness; young people; anti-poverty; Ipswich Town Centre", tier: 3 },
  { category: "Suffolk District & Borough Councils", name: "Cllr John Ward", role: "Leader, Babergh District Council", contact_details: "leader@babergh.gov.uk 01473 822801", focus_areas: "Rural housing; homelessness prevention; community wellbeing; regeneration", tier: 3 },
  { category: "Suffolk District & Borough Councils", name: "Cllr Caroline Topping", role: "Leader, East Suffolk Council", contact_details: "caroline.topping@eastsuffolk.gov.uk 01394 383789", focus_areas: "Coastal deprivation; housing; regeneration; young people; community resilience", tier: 2 },
  { category: "Suffolk District & Borough Councils", name: "Cllr Richard Winch", role: "Leader, Mid Suffolk District Council", contact_details: "leader@midsuffolk.gov.uk 0300 123 4000", focus_areas: "Rural communities; affordable housing; climate & sustainability; wellbeing", tier: 3 },
  { category: "Suffolk District & Borough Councils", name: "Cllr Cliff Waterman", role: "Leader, West Suffolk Council", contact_details: "cliff.waterman@westsuffolk.gov.uk 01284 763233", focus_areas: "Housing & homelessness; economic growth; young people; skills & employment; Bury St Edmunds", tier: 3 },
  // Suffolk MPs
  { category: "Suffolk MPs", name: "Jack Abbott", role: "Ipswich (Labour)", contact_details: "jack.abbott.mp@parliament.uk", focus_areas: "Youth services; homelessness; anti-poverty; mental health; social housing", tier: 3 },
  { category: "Suffolk MPs", name: "Peter Prinsley", role: "Bury St Edmunds & Stowmarket (Labour)", contact_details: "peter.prinsley.mp@parliament.uk", focus_areas: "Housing; rural poverty; NHS & mental health; young people", tier: 4 },
  { category: "Suffolk MPs", name: "Jenny Riddell-Carpenter", role: "Suffolk Coastal (Labour)", contact_details: "jenny.riddell-carpenter.mp@parliament.uk", focus_areas: "Coastal poverty; housing; social care", tier: 4 },
  { category: "Suffolk MPs", name: "Jess Asato", role: "Lowestoft (Labour)", contact_details: "jess.asato.mp@parliament.uk", focus_areas: "Child poverty; domestic abuse; young people; coastal deprivation", tier: 1 },
  { category: "Suffolk MPs", name: "Adrian Ramsay", role: "Waveney Valley (Green)", contact_details: "adrian.ramsay.mp@parliament.uk", focus_areas: "Mental health; community wellbeing; young people; climate justice", tier: 4 },
  { category: "Suffolk MPs", name: "Nick Timothy", role: "West Suffolk (Conservative)", contact_details: "nick.timothy.mp@parliament.uk", focus_areas: "Rural services; policing; housing", tier: 4 },
  { category: "Suffolk MPs", name: "James Cartlidge", role: "South Suffolk (Conservative)", contact_details: "james.cartlidge.mp@parliament.uk", focus_areas: "Rural economy; housing; NHS", tier: 4 },
  { category: "Suffolk MPs", name: "Patrick Spencer", role: "Central Suffolk & North Ipswich", contact_details: "patrick.spencer.mp@parliament.uk", focus_areas: "Rural communities; education", tier: 4 },
  // Suffolk Civic & Ceremonial
  { category: "Suffolk Civic & Ceremonial", name: "Mark Pendlington DL", role: "Lord-Lieutenant of Suffolk", contact_details: "Via Suffolk Lieutenancy", focus_areas: "Young people; community resilience; voluntary sector; enterprise; skills", tier: 3 },
  { category: "Suffolk Civic & Ceremonial", name: "Oliver Paul DL", role: "High Sheriff of Suffolk", contact_details: "Via Under Sheriff", focus_areas: "Visitor economy; Ipswich; community; rural enterprise", tier: 2 },
  // Norfolk & Suffolk Combined County Authority
  { category: "Combined County Authority", name: "TBD", role: "Mayor of Norfolk & Suffolk", contact_details: "norfolksuffolk-cca.gov.uk", focus_areas: "Transport; skills & apprenticeships; economic growth; housing; strategic planning", tier: 4 },
  // Cambridgeshire County Council
  { category: "Cambridgeshire County Council", name: "Cllr Lucy Nethsingha", role: "Leader of the Council", contact_details: "lucy.nethsingha@cambridgeshire.gov.uk", focus_areas: "Children's services; public health; housing; climate; LGR planning", tier: 3 },
  { category: "Cambridgeshire County Council", name: "Cllr Lorna Dupré", role: "Deputy Leader of the Council", contact_details: "lorna.dupre@cambridgeshire.gov.uk", focus_areas: "Strategic leadership; community wellbeing", tier: 4 },
  { category: "Cambridgeshire County Council", name: "Dr Stephen Moir", role: "Chief Executive", contact_details: "chiefexecutive@cambridgeshire.gov.uk", focus_areas: "Children & adults services; education; public health; SEND; skills & employment", tier: 3 },
  { category: "Cambridgeshire County Council", name: "Cllr Peter McDonald", role: "Chair of the Council", contact_details: "Via council 0345 045 1363", focus_areas: "Civic leadership", tier: 4 },
  // Cambridgeshire District & City Councils
  { category: "Cambridgeshire District & City Councils", name: "Cllr Katie Thornburrow", role: "Leader, Cambridge City Council", contact_details: "leader@cambridge.gov.uk", focus_areas: "Housing & homelessness; youth services; equalities; anti-poverty; Cambridge city centre", tier: 3 },
  { category: "Cambridgeshire District & City Councils", name: "Robert Pollock", role: "Chief Executive, Cambridge City Council", contact_details: "robert.pollock@cambridge.gov.uk", focus_areas: "Housing; homelessness; community wellbeing; urban services", tier: 2 },
  { category: "Cambridgeshire District & City Councils", name: "Cllr Bridget Smith", role: "Leader, South Cambridgeshire District Council", contact_details: "leader@scambs.gov.uk", focus_areas: "Housing growth; rural wellbeing; affordable housing; LGR", tier: 3 },
  { category: "Cambridgeshire District & City Councils", name: "Cllr Anna Bailey", role: "Leader, East Cambridgeshire District Council", contact_details: "leader@eastcambs.gov.uk", focus_areas: "Rural community support; housing; economic development", tier: 4 },
  { category: "Cambridgeshire District & City Councils", name: "Cllr Chris Boden", role: "Leader, Fenland District Council", contact_details: "leader@fenland.gov.uk", focus_areas: "Rural poverty; social deprivation; housing; skills", tier: 4 },
  { category: "Cambridgeshire District & City Councils", name: "Cllr Sarah Conboy", role: "Leader, Huntingdonshire District Council", contact_details: "leader@huntingdonshire.gov.uk", focus_areas: "Housing; mental health; young people; rural community support", tier: 4 },
  { category: "Cambridgeshire District & City Councils", name: "Michelle Sacks", role: "Chief Executive, Huntingdonshire District Council", contact_details: "michelle.sacks@huntingdonshire.gov.uk", focus_areas: "Community wellbeing; housing; rural services", tier: 3 },
  { category: "Cambridgeshire District & City Councils", name: "Cllr Cameron Holloway", role: "Leader, Cambridge City Council", contact_details: "Via council", focus_areas: "Housing; social equity; young people", tier: 3 },
  // CPCA
  { category: "CPCA", name: "Paul Bristow", role: "Mayor of Cambridgeshire & Peterborough", contact_details: "mayor@cambridgeshirepeterborough-ca.gov.uk", focus_areas: "Transport; skills & apprenticeships; housing; youth employment guarantee", tier: 1 },
  { category: "CPCA", name: "Rob Bridge", role: "Chief Executive, CPCA", contact_details: "rob.bridge@cambridgeshirepeterborough-ca.gov.uk", focus_areas: "Strategic delivery; skills; employment; housing; transport infrastructure", tier: 3 },
  // Cambridgeshire & Peterborough MPs
  { category: "Cambridgeshire MPs", name: "Daniel Zeichner", role: "Cambridge", contact_details: "daniel.zeichner.mp@parliament.uk", focus_areas: "Housing; transport; NHS; social justice; young people", tier: 1 },
  { category: "Cambridgeshire MPs", name: "Pippa Heylings", role: "South Cambridgeshire", contact_details: "pippa.heylings.mp@parliament.uk", focus_areas: "Housing; mental health; environment; rural services", tier: 3 },
  { category: "Cambridgeshire MPs", name: "Ian Sollom", role: "St Neots & Mid Cambridgeshire", contact_details: "ian.sollom.mp@parliament.uk", focus_areas: "Housing; rural community; skills; young people", tier: 4 },
  { category: "Cambridgeshire MPs", name: "Charlotte Cane", role: "Ely & East Cambridgeshire", contact_details: "charlotte.cane.mp@parliament.uk", focus_areas: "Rural poverty; mental health; housing; community services", tier: 4 },
  { category: "Cambridgeshire MPs", name: "Steve Barclay", role: "North East Cambridgeshire", contact_details: "steve.barclay.mp@parliament.uk", focus_areas: "NHS; rural health; social care; community wellbeing", tier: 3 },
  { category: "Cambridgeshire MPs", name: "Ben Obese-Jecty", role: "Huntingdon", contact_details: "ben.obese-jecty.mp@parliament.uk", focus_areas: "Community safety; rural services; housing", tier: 3 },
  { category: "Cambridgeshire MPs", name: "Sam Carling", role: "North West Cambridgeshire", contact_details: "sam.carling.mp@parliament.uk", focus_areas: "Social housing; young people; community wellbeing; NHS", tier: 3 },
  { category: "Cambridgeshire MPs", name: "Andrew Pakes", role: "Peterborough", contact_details: "andrew.pakes.mp@parliament.uk", focus_areas: "Workers' rights; housing; young people; poverty; skills", tier: 1 },
  // Cambridgeshire Civic & Ceremonial
  { category: "Cambridgeshire Civic & Ceremonial", name: "Mrs Julie Spence OBE CStJ QPM", role: "Lord-Lieutenant", contact_details: "Via Cambridgeshire Lieutenancy", focus_areas: "Community safety; public services; charitable sector; volunteering; policing legacy", tier: 1 },
  { category: "Cambridgeshire Civic & Ceremonial", name: "The Hon. Frances Stanley DL", role: "High Sheriff 2025-2026", contact_details: "cambridgeshire@highsheriffs.com", focus_areas: "Early years intervention; tackling inequalities; community connection; children & families", tier: 2 },
  { category: "Cambridgeshire Civic & Ceremonial", name: "Francis Burkitt", role: "High Sheriff 2026-2027", contact_details: "cambridgeshire@highsheriffs.com", focus_areas: "TBC — monitor for relevant focus areas and engagement opportunities", tier: 1 },
  // Health, Mental Health & Wellbeing
  { category: "Health & Wellbeing", organisation: "NHS Cambridgeshire & Peterborough ICB", name: "Commissioning NHS services", role: "", contact_details: "cpicb.enquiries@nhs.net", focus_areas: "Mental health commissioning; young people's mental health; IAPT; community health", tier: 4 },
  { category: "Health & Wellbeing", organisation: "NHS Suffolk & North East Essex ICB", name: "Commissioning NHS services", role: "", contact_details: "snee.enquiries@nhs.net", focus_areas: "Mental health; young people's NHS services; VCSE partnerships; rough sleeper health", tier: 4 },
  { category: "Health & Wellbeing", organisation: "Cambridgeshire & Peterborough NHS Foundation Trust (CPFT)", name: "Provider of mental health", role: "", contact_details: "Via ICB / website", focus_areas: "CAMHS; adult mental health; wellbeing hubs; community support", tier: 3 },
  { category: "Health & Wellbeing", organisation: "Norfolk & Suffolk NHS Foundation Trust (NSFT)", name: "Provider of mental health services", role: "", contact_details: "nsft.nhs.uk", focus_areas: "CAMHS; crisis services; adults mental health; eating disorders", tier: 3 },
  // Policing, Crime & Community Safety
  { category: "Policing & Community Safety", organisation: "Chief Constable of Suffolk Constabulary", name: "Suffolk Police", role: "", contact_details: "Via: suffolk.police.uk", focus_areas: "Youth crime; anti-social behaviour; safeguarding; violence reduction; rough sleeping", tier: 3 },
  { category: "Policing & Community Safety", organisation: "Chief Constable of Cambridgeshire Constabulary", name: "Cambridgeshire Police", role: "", contact_details: "Via: cambs.police.uk", focus_areas: "Youth crime; county lines; exploitation; ASB; homelessness", tier: 2 },
  { category: "Policing & Community Safety", organisation: "Police & Crime Commissioner — Suffolk", name: "Democratically elected commissioner", role: "", contact_details: "suffolk-pcc.gov.uk", focus_areas: "Violence reduction; young people; safeguarding; community cohesion", tier: 3 },
  { category: "Policing & Community Safety", organisation: "Police & Crime Commissioner — Cambridgeshire", name: "Democratically elected commissioner", role: "", contact_details: "cambridgeshire-pcc.gov.uk", focus_areas: "Youth engagement; mental health diversion; community safety", tier: 2 },
  // Housing, Homelessness & Rough Sleeping
  { category: "Housing & Homelessness", organisation: "Homes England — East of England", name: "National housing & regeneration agency", role: "", contact_details: "homesengland.gov.uk", focus_areas: "Affordable housing development; supported housing; rough sleeping; capital grant funding", tier: 3 },
  { category: "Housing & Homelessness", organisation: "MHCLG", name: "Central government department", role: "", contact_details: "gov.uk/mhclg", focus_areas: "Rough Sleeping Initiative funding; homelessness prevention; VCSE partnerships", tier: 3 },
  // Skills, Employment & Young People
  { category: "Skills & Employment", organisation: "New Anglia Local Enterprise Partnership (LEP)", name: "Business & economic growth body", role: "", contact_details: "newanglia.co.uk", focus_areas: "Skills & apprenticeships; youth employment; economic development", tier: 4 },
  { category: "Skills & Employment", organisation: "Greater Cambridge Partnership", name: "City Deal / development body", role: "", contact_details: "greatercambridge.org.uk", focus_areas: "Housing growth; skills; transport; economic development in Cambridge area", tier: 3 },
  { category: "Skills & Employment", organisation: "DWP", name: "Job Centre Plus and Work Coach network", role: "", contact_details: "Via JobCentrePlus offices", focus_areas: "Youth employment; Universal Credit; NEET support; supported employment", tier: 2 },
  // Voluntary, Community & Faith Sector Infrastructure
  { category: "VCFS Infrastructure", organisation: "Suffolk Community Foundation", name: "Grants & philanthropy", role: "", contact_details: "suffolkcf.org.uk", focus_areas: "Community resilience; disadvantaged groups; mental health; youth", tier: 2 },
  { category: "VCFS Infrastructure", organisation: "Cambridgeshire Community Foundation", name: "Grants & philanthropy", role: "", contact_details: "cambscf.org.uk", focus_areas: "Poverty; young people; mental health; community wellbeing", tier: 2 },
  { category: "VCFS Infrastructure", organisation: "Voluntary Norfolk / Norfolk & Waveney Mind", name: "VCSE infrastructure and specialist", role: "", contact_details: "Via respective organisations", focus_areas: "Mental health; voluntary sector development; peer support", tier: 3 },
  { category: "VCFS Infrastructure", organisation: "Suffolk Voluntary Action Network (SVAN)", name: "VCSE support & development", role: "", contact_details: "communityactionsuffolk.org.uk", focus_areas: "Voluntary sector support; community development; capacity building", tier: 3 }
];

console.log('Seeding database with stakeholder data...');

const insert = db.prepare(`
  INSERT INTO stakeholders (category, organisation, name, role, contact_details, focus_areas, tier, main_contact, owned_by)
  VALUES (@category, @organisation, @name, @role, @contact_details, @focus_areas, @tier, @main_contact, @owned_by)
`);

const insertMany = db.transaction((items) => {
  for (const item of items) {
    insert.run({
      category: item.category,
      organisation: item.organisation || null,
      name: item.name,
      role: item.role || null,
      contact_details: item.contact_details || null,
      focus_areas: item.focus_areas || null,
      tier: item.tier,
      main_contact: null,
      owned_by: "Unassigned"
    });
  }
});

// Clear first just in case
db.exec('DELETE FROM stakeholders');
insertMany(stakeholders);

console.log('Seeding finished.');
